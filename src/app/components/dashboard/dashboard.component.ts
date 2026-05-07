import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WorkoutService } from '../../services/workout-service/workout.service';
import { NutritionService } from 'src/app/services/nutrition-service/nutrition.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  public workoutService = inject(WorkoutService);
  public nutritionService = inject(NutritionService);

  calorieRimanenti = computed(() => {
    const rimanenti = this.nutritionService.targetCalories() - this.nutritionService.currentCalories();
    return rimanenti > 0 ? rimanenti : 0;
  });

  dataOggi = new Date().toLocaleDateString('it-IT', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
}
