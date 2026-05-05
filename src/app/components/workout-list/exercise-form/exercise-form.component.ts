import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Esercizio } from '../../../models/esercizio.model';

@Component({
    selector: 'app-exercise-form',
    imports: [CommonModule, FormsModule],
    templateUrl: './exercise-form.component.html',
    styleUrls: ['./exercise-form.component.css']
})
export class ExerciseFormComponent {
  @Output() onAggiungi = new EventEmitter<Esercizio>();

  mostraForm: boolean = false;
  nuovoNome: string = '';
  nuovoCarico: number = 0;

  inviaEsercizio() {
    if (this.nuovoNome.trim() !== '') {
      const nuovo: Esercizio = {
        id: Date.now(),
        nome: this.nuovoNome,
        serie: 3,
        ripetizioni: 10,
        carico: this.nuovoCarico,
        completato: false,
        note: ''
      };

      this.onAggiungi.emit(nuovo); // Invia l'oggetto al padre
      this.resetForm();
    }
  }

  resetForm() {
    this.nuovoNome = '';
    this.nuovoCarico = 0;
    this.mostraForm = false;
  }
}
