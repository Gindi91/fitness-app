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
    newP = 0; newC = 0; newF = 0;
    selectedTag: MealTag = 'Pranzo';
    selectedDate = new Date().toISOString().split('T')[0];
    tags: MealTag[] = ['Colazione', 'Pranzo', 'Cena', 'Merenda 1', 'Merenda 2'];

    toggleAddFood() {
        this.showAddFood.update(v => !v);
    }

    saveFood() {
        this.nutritionService.addEntry({
        name: this.foodName || 'Nuovo Alimento',
        protein: this.newP,
        carbs: this.newC,
        fat: this.newF,
        tag: this.selectedTag,
        date: new Date(this.selectedDate)
        });
        this.showAddFood.set(false);
        this.resetForm();
    }

    private resetForm() {
        this.foodName = ''; this.newP = 0; this.newC = 0; this.newF = 0;
    }

}
