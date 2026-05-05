// services/nutrition/nutrition.service.ts
import { Injectable, signal, computed } from '@angular/core';

export type MealTag = 'Colazione' | 'Pranzo' | 'Cena' | 'Merenda 1' | 'Merenda 2';

export interface FoodEntry {
  id: number;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  date: Date;
  tag: MealTag;
}

@Injectable({ providedIn: 'root' })
export class NutritionService {
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
}

