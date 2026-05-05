import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NutritionService } from 'src/app/services/nutrition-service/nutrition.service';

@Component({
  selector: 'app-nutrition-summary',
  imports: [ CommonModule ],
  templateUrl: './nutrition-summary.component.html',
  styleUrl: './nutrition-summary.component.css',
  standalone: true
})
export class NutritionSummaryComponent {

  constructor (public nutritionService : NutritionService){}
}
