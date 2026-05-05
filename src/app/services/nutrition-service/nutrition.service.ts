// services/nutrition/nutrition.service.ts
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NutritionService {
  // Obiettivi giornalieri
  targetCalories = signal(2500);
  targetProtein = signal(150);
  targetCarbs = signal(300);
  targetFat = signal(80);

  // Valori assunti oggi
  currentProtein = signal(120); // Dati di prova
  currentCarbs = signal(210);
  currentFat = signal(45);

  // Calcolo calorie totali (1g prot/carb = 4kcal, 1g fat = 9kcal)
  currentCalories = computed(() => 
    (this.currentProtein() * 4) + (this.currentCarbs() * 4) + (this.currentFat() * 9)
  );

  // Percentuali per le barre (0-100)
  calProgress = computed(() => (this.currentCalories() / this.targetCalories()) * 100);
  protProgress = computed(() => (this.currentProtein() / this.targetProtein()) * 100);
  carbsProgress = computed(() => (this.currentCarbs() / this.targetCarbs()) * 100);
  fatProgress = computed(() => (this.currentFat() / this.targetFat()) * 100);
}
