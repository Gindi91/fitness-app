import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type MealTag = 'Colazione' | 'Pranzo' | 'Cena' | 'Merenda 1' | 'Merenda 2';

// 1. ALLINEATO CON JAVA: I campi ora corrispondono esattamente all'entità Java Alimento
export interface FoodEntry {
  id: number;
  nome: string;        // Mappato da 'name'
  grams: number;       // Se nel DB Java si chiama grammi, cambialo in 'grammi'
  proteine: number;    // Mappato da 'protein'
  carboidrati: number; // Mappato da 'carbs'
  grassi: number;      // Mappato da 'fat'
  calorie: number;     // Mappato da 'calories'
  data: string;        // Java restituisce una stringa (es: "2026-06-16")
  tag: MealTag;
}

// 2. ALLINEATO CON JAVA: I campi ora corrispondono esattamente all'entità Java Peso
export interface WeightEntry {
  id?: number; 
  data: string;        // Mappato da 'date' (Java restituisce la stringa della data)
  valore: number;      // Mappato da 'value'
}

@Injectable({ providedIn: 'root' })
export class NutritionService {
  private http = inject(HttpClient);
  
  private foodApiUrl = 'http://localhost:8080/api/alimenti';
  private weightApiUrl = 'http://localhost:8080/api/pesi';

  targetCalories = signal(2500);
  targetProtein = signal(150);
  targetCarbs = signal(300);
  targetFat = signal(80);

  foodHistory = signal<FoodEntry[]>([]);
  weightHistory = signal<WeightEntry[]>([]);
  altezza = signal<number>(175);

  constructor() {
    this.caricaDatiDalBackend();
  }

  // GET: Scarica alimenti e pesi dal database Java
  private caricaDatiDalBackend() {
    this.http.get<FoodEntry[]>(this.foodApiUrl).subscribe({
      next: (data) => {
        // Popoliamo il segnale lasciando la data come stringa leggibile
        this.foodHistory.set(data);
        console.log('Alimenti caricati da Java:', data);
      },
      error: (err) => console.error('Errore nel caricamento alimenti da Java:', err)
    });

    this.http.get<WeightEntry[]>(this.weightApiUrl).subscribe({
      next: (data) => {
        this.weightHistory.set(data);
        console.log('Storico pesi caricato da Java:', data);
      },
      error: (err) => console.error('Errore nel caricamento pesi da Java:', err)
    });
  }

  // POST: Salva un nuovo alimento nel DB Java
  addEntry(entry: Omit<FoodEntry, 'id' | 'calorie'>) {
    this.http.post<FoodEntry>(this.foodApiUrl, entry).subscribe({
      next: (alimentoSalvato) => {
        this.foodHistory.update(history => [...history, alimentoSalvato]);
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
  addWeight(valore: number, data: string) {
    // Il payload ora rispetta le variabili italiane accettate da PesoController
    const payload = { valore, data };
    this.http.post<WeightEntry>(this.weightApiUrl, payload).subscribe({
      next: (pesoSalvato) => {
        this.weightHistory.update(h => 
          [...h, pesoSalvato].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
        );
      },
      error: (err) => console.error('Errore nel salvataggio del peso su Java:', err)
    });
  }

  // DELETE: Elimina una misurazione di peso dal DB Java
  deleteWeight(dataDaEliminare: string) {
    const pesoDaEliminare = this.weightHistory().find(w => w.data === dataDaEliminare);
    
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

  // --- LOGICA COMPUTED AGGIORNATA CON I CAMPI IN ITALIANO ---
  currentProtein = computed(() => this.foodHistory().reduce((acc, f) => acc + f.proteine, 0));
  currentCarbs = computed(() => this.foodHistory().reduce((acc, f) => acc + f.carboidrati, 0));
  currentFat = computed(() => this.foodHistory().reduce((acc, f) => acc + f.grassi, 0));
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
        const dateKey = new Date(entry.data).toLocaleDateString('it-IT', { 
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
      const d = new Date(f.data).toLocaleDateString();
      daily[d] = (daily[d] || 0) + f.calorie;
    });
    return daily;
  });

  updateAltezza(nuovaAltezza: number) {
    this.altezza.set(nuovaAltezza);
  }

  ultimoPeso = computed(() => {
    const history = this.weightHistory();
    return history.length > 0 ? history[history.length - 1].valore : 0;
  });

  penultimoPeso = computed(() => {
    const history = this.weightHistory();
    return history.length > 1 ? history[history.length - 2].valore : 0;
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