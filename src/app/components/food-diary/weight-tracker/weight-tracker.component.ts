import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NutritionService } from 'src/app/services/nutrition-service/nutrition.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-weight-tracker',
  imports: [ FormsModule, BaseChartDirective ],
  templateUrl: './weight-tracker.component.html',
  styleUrl: './weight-tracker.component.css',
})
export class WeightTrackerComponent {
  activeTab = signal<'weight' | 'calories'>('weight');
  showWeightForm = signal(false);
  
  tempWeight = 0;
  tempDate = new Date().toISOString().split('T')[0];

  constructor(public nutritionService: NutritionService) {}

  saveWeight() {
    if (this.tempWeight > 0) {
      this.nutritionService.addWeight(this.tempWeight, new Date(this.tempDate));
      this.showWeightForm.set(false);
    }
  }

   public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { grid: { color: '#3a3a3c' }, ticks: { color: '#8e8e93' } },
      x: { grid: { display: false }, ticks: { color: '#8e8e93' } }
    },
    plugins: {
      legend: { display: false } // Nascondiamo la legenda per pulizia
    }
  };

  // Dati Dinamici per il PESO
  weightChartData = computed<ChartData<'line'>>(() => {
    const history = this.nutritionService.weightHistory();
    return {
      labels: history.map(h => new Date(h.date).toLocaleDateString('it-IT', {day: 'numeric', month: 'short'})),
      datasets: [{
        data: history.map(h => h.value),
        label: 'Peso (kg)',
        borderColor: '#27ae60',
        backgroundColor: 'rgba(39, 174, 96, 0.2)',
        fill: true,
        tension: 0.4
      }]
    };
  });

  // Dati Dinamici per le CALORIE
  caloriesChartData = computed<ChartData<'bar'>>(() => {
    const dailyCals = this.nutritionService.caloriesPerDay(); // Assumendo che esista nel service
    return {
      labels: Object.keys(dailyCals),
      datasets: [{
        data: Object.values(dailyCals),
        label: 'Calorie giornaliere',
        backgroundColor: '#007aff',
        borderRadius: 5
      }]
    };
  });
}
