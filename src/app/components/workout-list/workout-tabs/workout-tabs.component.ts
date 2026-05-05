import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Scheda } from '../../../models/esercizio.model';

@Component({
    selector: 'app-workout-tabs',
    imports: [CommonModule, FormsModule],
    templateUrl: './workout-tabs.component.html',
    styleUrls: ['./workout-tabs.component.css']
})
export class WorkoutTabsComponent {
  @Input() schede: Scheda[] = [];
  @Input() attivaIndex: number = 0;

  @Output() cambiaTab = new EventEmitter<number>();
  @Output() onAggiungiScheda = new EventEmitter<string>();

  mostraFormScheda: boolean = false;
  nuovaSchedaNome: string = '';

  seleziona(index: number) {
    this.cambiaTab.emit(index);
  }

  creaScheda() {
    if (this.nuovaSchedaNome.trim()) {
      this.onAggiungiScheda.emit(this.nuovaSchedaNome);
      this.nuovaSchedaNome = '';
      this.mostraFormScheda = false;
    }
  }
}
