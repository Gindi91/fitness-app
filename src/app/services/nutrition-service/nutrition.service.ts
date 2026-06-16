import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type MealTag = 'Colazione' | 'Pranzo' | 'Cena' | 'Merenda 1' | 'Merenda 2';

export interface FoodEntry {
  id: number;
  name: string;
  grams: number;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  date: Date;
  tag: MealTag;
}

export interface WeightEntry {
  id?: number; // Opzionale perché il DB Java lo autogenera
  date: Date;
  value: number;
}

@Injectable({ providedIn: 'root' })
export class NutritionService {
  private http = inject(HttpClient);
  
  // Endpoint delle API REST del backend Java
  private foodApiUrl = 'http://localhost:8080/api/alimenti';
  private weightApiUrl = 'http://localhost:8080/api/pesi';

  // Obiettivi giornalieri
  targetCalories = signal(2500);
  targetProtein = signal(150);
  targetCarbs = signal(300);
  targetFat = signal(80);

  foodHistory = signal<FoodEntry[]>([]);
  weightHistory = signal<WeightEntry[]>([]);
  altezza = signal<number>(175); // Versione 2: Stateless (torna a 175 al refresh)

  constructor() {
    this.caricaDatiDalBackend();
  }

  // GET: Scarica alimenti e pesi dal database in memoria di Java
  private caricaDatiDalBackend() {
    this.http.get<FoodEntry[]>(this.foodApiUrl).subscribe({
      next: (data) => {
        this.foodHistory.set(data.map(f => ({ ...f, date: new Date(f.date) })));
        console.log('Alimenti caricati da Java:', data);
      },
      error: (err) => console.error('Errore nel caricamento alimenti da Java:', err)
    });

    this.http.get<WeightEntry[]>(this.weightApiUrl).subscribe({
      next: (data) => {
        this.weightHistory.set(data.map(w => ({ ...w, date: new Date(w.date) })));
        console.log('Storico pesi caricato da Java:', data);
      },
      error: (err) => console.error('Errore nel caricamento pesi da Java:', err)
    });
  }

  // POST: Salva un nuovo alimento nel DB Java
  addEntry(entry: Omit<FoodEntry, 'id' | 'calories'>) {
    this.http.post<FoodEntry>(this.foodApiUrl, entry).subscribe({
      next: (alimentoSalvato) => {
        // Ricostruiamo la data come oggetto Date e aggiorniamo il segnale locale
        const nuovoAlimento = { ...alimentoSalvato, date: new Date(alimentoSalvato.date) };
        this.foodHistory.update(history => [...history, nuovoAlimento]);
      },
      error: (err) => console.error('Errore nel salvataggio dell\'alimento su Java:', err)
    });
  }

  // DELETE: Elimina un alimento dal DB Java
  deleteEntry(id: number) {
    this.http.delete(`${this.foodApiUrl}/${id}`).subscribe({
      next: () => {
        this.foodHistory.update(h => h.filter(e => e.id !== id));
        console.log(`Alimento ${id} eliminato dal backend Java`);
      },
      error: (err) => console.error('Errore nell\'eliminazione dell\'alimento su Java:', err)
    });
  }

  // POST: Salva una nuova misurazione di peso nel DB Java
  addWeight(value: number, date: Date) {
    const payload = { value, date };
    this.http.post<WeightEntry>(this.weightApiUrl, payload).subscribe({
      next: (pesoSalvato) => {
        const nuovoPeso = { ...pesoSalvato, date: new Date(pesoSalvato.date) };
        this.weightHistory.update(h => [...h, nuovoPeso].sort((a, b) => a.date.getTime() - b.date.getTime()));
      },
      error: (err) => console.error('Errore nel salvataggio del peso su Java:', err)
    });
  }

  // DELETE: Elimina una misurazione di peso dal DB Java
  deleteWeight(dateToDelete: Date) {
    // Cerchiamo l'ID corrispondente alla data da eliminare
    const pesoDaEliminare = this.weightHistory().find(w => w.date.getTime() === dateToDelete.getTime());
    
    if (!pesoDaEliminare || !pesoDaEliminare.id) {
      console.warn('Impossibile trovare l\'ID per eliminare la pesata selezionata');
      return;
    }

    this.http.delete(`${this.weightApiUrl}/${pesoDaEliminare.id}`).subscribe({
      next: () => {
        this.weightHistory.update(history => 
          history.filter(w => w.id !== pesoDaEliminare.id)
        );
        console.log(`Pesata con ID ${pesoDaEliminare.id} eliminata dal backend Java`);
      },
      error: (err) => console.error('Errore nell\'eliminazione del peso su Java:', err)
    });
  }

  // --- LOGICA COMPUTED INVARIATA ---
  currentProtein = computed(() => this.foodHistory().reduce((acc, f) => acc + f.protein, 0));
  currentCarbs = computed(() => this.foodHistory().reduce((acc, f) => acc + f.carbs, 0));
  currentFat = computed(() => this.foodHistory().reduce((acc, f) => acc + f.fat, 0));
  currentCalories = computed(() => (this.currentProtein() * 4) + (this.currentCarbs() * 4) + (this.currentFat() * 9));

  calProgress = computed(() => (this.currentCalories() / this.targetCalories()) * 100);
  protProgress = computed(() => (this.currentProtein() / this.targetProtein()) * 100);
  carbsProgress = computed(() => (this.currentCarbs() / this.targetCarbs()) * 100);
  fatProgress = computed(() => (this.currentFat() / this.targetFat()) * 100);

  readonly mealOrder: MealTag[] = ['Colazione', 'Merenda 1', 'Pranzo', 'Merenda 2', 'Cena'];

  groupedHistory = computed(() => {
    const history = this.foodHistory();
    const groups: { [date: string]: { [meal in MealTag]?: FoodEntry[] } } = {};
    history.forEach(entry => {
        const dateKey = new Date(entry.date).toLocaleDateString('it-IT', { 
          weekday: 'long', day: 'numeric', month: 'long' 
        });
        if (!groups[dateKey]) groups[dateKey] = {};
        if (!groups[dateKey][entry.tag]) groups[dateKey][entry.tag] = [];
        groups[dateKey][entry.tag]?.push(entry);
    });
    return groups;
  });

  caloriesPerDay = computed(() => {
    const history = this.foodHistory();
    const daily: { [date: string]: number } = {};
    history.forEach(f => {
      const d = new Date(f.date).toLocaleDateString();
      daily[d] = (daily[d] || 0) + f.calories;
    });
    return daily;
  });

  updateAltezza(nuovaAltezza: number) {
    this.altezza.set(nuovaAltezza);
  }

  ultimoPeso = computed(() => {
    const history = this.weightHistory();
    return history.length > 0 ? history[history.length - 1].value : 0;
  });

  penultimoPeso = computed(() => {
    const history = this.weightHistory();
    return history.length > 1 ? history[history.length - 2].value : 0;
  }); 

  bmi = computed(() => {
    const peso = this.ultimoPeso();
    const altezzaCm = this.altezza();
    if (peso === 0 || altezzaCm === 0) return 0;
    const altezzaM = altezzaCm / 100;
    return parseFloat((peso / (altezzaM * altezzaM)).toFixed(1));
  });

  bmiStatus = computed(() => {
    const val = this.bmi();
    if (val === 0) return { label: '--', class: 'status-none' };
    if (val < 18.5) return { label: 'Sottopeso', class: 'status-warning' };
    if (val < 25) return { label: 'Normopeso', class: 'status-success' };
    if (val < 30) return { label: 'Sovrappeso', class: 'status-warning' };
    return { label: 'Obesità', class: 'status-danger' };
  });

  trend = computed(() => {
    const ultimo = this.ultimoPeso();
    const penultimo = this.penultimoPeso();
    return parseFloat((penultimo - ultimo).toFixed(1));
  });

  trendAssoluto = computed(() => Math.abs(this.trend()));
  isTrendPositivo = computed(() => this.trend() >= 0);
}
