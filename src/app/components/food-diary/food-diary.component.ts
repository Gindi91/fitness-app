import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NutritionSummaryComponent } from './nutrition-summary/nutrition-summary.component';
import { WeightTrackerComponent } from './weight-tracker/weight-tracker.component';
import { NutritionService } from 'src/app/services/nutrition-service/nutrition.service';

export type MealTag = 'Colazione' | 'Pranzo' | 'Cena' | 'Merenda 1' | 'Merenda 2';

@Component({
    selector: 'app-food-diary',
    imports: [ NutritionSummaryComponent, WeightTrackerComponent, CommonModule, FormsModule ],
    templateUrl: './food-diary.component.html',
    styleUrls: ['./food-diary.component.css'],
    standalone: true
})
export class FoodDiaryComponent {

    showAddFood = signal(false);

    constructor(public nutritionService: NutritionService) {}

    foodName = '';
    newGrams = 100;
    newP = 0; newC = 0; newF = 0;
    selectedTag: MealTag = 'Pranzo';
    selectedDate = new Date().toISOString().split('T')[0];
    tags: MealTag[] = ['Colazione', 'Pranzo', 'Cena', 'Merenda 1', 'Merenda 2'];

    toggleAddFood() {
        this.showAddFood.update(v => !v);
    }

    saveFood() {
        // MODIFICATO: Mappatura con le proprietà in italiano coerenti con il Service e Java
        this.nutritionService.addEntry({
          nome: this.foodName || 'Nuovo Alimento',
          grams: this.newGrams, // Se nel DB Java hai rinominato in grammi, cambia anche qui in grammi
          proteine: this.newP,
          carboidrati: this.newC,
          grassi: this.newF,
          tag: this.selectedTag,
          data: this.selectedDate // Passiamo direttamente la stringa (es: "2026-06-16")
        });
        this.showAddFood.set(false);
        this.resetForm();
    }

    private resetForm() {
        this.foodName = ''; this.newP = 0; this.newC = 0; this.newF = 0;
        this.newGrams = 100;
        this.selectedDate = new Date().toISOString().split('T')[0]; // Reset della data ad oggi
    }
}
