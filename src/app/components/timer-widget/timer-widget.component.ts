import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core'; // Rimosso Injectable
import { TimerService } from 'src/app/services/timer-service/timer.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-timer-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timer-widget.component.html',
  styleUrl: './timer-widget.component.css',
})
export class TimerWidgetComponent {
  constructor(public timerService: TimerService) {}

  isVisible = signal(false);
  
  toggleTimer() {
    this.isVisible.update(v => !v);
  }

  calculateOffset(percent: number): number {
    const circumference = 2 * Math.PI * 90; // 565.48
    return circumference - (percent / 100) * circumference;
  }

  getStrokeColor(seconds: number): string {
    if (seconds <= 10) {
      return 'var(--danger)'; // Rosso (#ef4444)
    } else {
      return 'var(--palestra)'; // Arancione (#f97316)
    }
  }
}
