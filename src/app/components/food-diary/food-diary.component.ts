import { Component } from '@angular/core';
import { NutritionSummaryComponent } from './nutrition-summary/nutrition-summary.component';
import { WeightTrackerComponent } from './weight-tracker/weight-tracker.component';

@Component({
    selector: 'app-food-diary',
    imports: [ NutritionSummaryComponent, WeightTrackerComponent ],
    templateUrl: './food-diary.component.html',
    styleUrls: ['./food-diary.component.css'],
    standalone: true
})
export class FoodDiaryComponent {

}
