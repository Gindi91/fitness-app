// services/nutrition/nutrition.service.ts
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
  date: Date;
  value: number;
}

@Injectable({ providedIn: 'root' })
export class NutritionService {

  private http = inject(HttpClient);
  
  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    // Caricamento alimenti
    this.http.get<FoodEntry[]>('assets/data/alimenti.json').subscribe(data => {
      this.foodHistory.set(data.map(f => ({...f, date: new Date(f.date)})));
    });

    // Caricamento pesi
    this.http.get<WeightEntry[]>('assets/data/pesi.json').subscribe(data => {
      this.weightHistory.set(data.map(w => ({...w, date: new Date(w.date)})));
    });
  }

  // Obiettivi giornalieri
  targetCalories = signal(2500);
  targetProtein = signal(150);
  targetCarbs = signal(300);
  targetFat = signal(80);

  foodHistory = signal<FoodEntry[]>([]);

  // Calcolo dei totali odierni basato sullo storico
  currentProtein = computed(() => this.foodHistory().reduce((acc, f) => acc + f.protein, 0));
  currentCarbs = computed(() => this.foodHistory().reduce((acc, f) => acc + f.carbs, 0));
  currentFat = computed(() => this.foodHistory().reduce((acc, f) => acc + f.fat, 0));
  
  // Calcolo calorie totali
  currentCalories = computed(() => (this.currentProtein() * 4) + (this.currentCarbs() * 4) + (this.currentFat() * 9));

  calProgress = computed(() => (this.currentCalories() / this.targetCalories()) * 100);
  protProgress = computed(() => (this.currentProtein() / this.targetProtein()) * 100);
  carbsProgress = computed(() => (this.currentCarbs() / this.targetCarbs()) * 100);
  fatProgress = computed(() => (this.currentFat() / this.targetFat()) * 100);

  addEntry(entry: Omit<FoodEntry, 'id' | 'calories'>) {
    const newEntry: FoodEntry = {
      ...entry,
      id: Date.now(),
      calories: (entry.protein * 4) + (entry.carbs * 4) + (entry.fat * 9)
    };
    this.foodHistory.update(history => [...history, newEntry]);
  }

  deleteEntry(id: number) {
    this.foodHistory.update(h => h.filter(e => e.id !== id));
  }

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

  weightHistory = signal<WeightEntry[]>([
    { date: new Date('2024-05-01'), value: 80.5 },
    { date: new Date('2024-05-03'), value: 80.2 },
    { date: new Date('2024-05-05'), value: 79.8 }
  ]);

  addWeight(value: number, date: Date) {
    this.weightHistory.update(h => [...h, { date, value }].sort((a,b) => a.date.getTime() - b.date.getTime()));
  }

  // Helper per ottenere le calorie totali raggruppate per data (per il grafico)
  caloriesPerDay = computed(() => {
    const history = this.foodHistory();
    const daily: { [date: string]: number } = {};
    history.forEach(f => {
      const d = new Date(f.date).toLocaleDateString();
      daily[d] = (daily[d] || 0) + f.calories;
    });
    return daily;
  });
}

