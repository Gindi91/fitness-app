import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Esercizio } from '../../../models/esercizio.model';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-exercise-item',
    imports: [CommonModule, FormsModule, DragDropModule],
    templateUrl: './exercise-item.component.html',
    styleUrls: ['./exercise-item.component.css']
})
export class ExerciseItemComponent {
  @Input() esercizio!: Esercizio;

  @Output() onToggle = new EventEmitter<void>();
  @Output() onElimina = new EventEmitter<void>();
  @Output() onModifica = new EventEmitter<void>();

  toggle() {
    this.onToggle.emit();
  }

  elimina() {
    this.onElimina.emit();
  }

  // SPIEGAZIONE: Questo metodo viene attivato dagli input HTML quando scatta l'evento (blur)
  notificaModifica() {
    this.onModifica.emit();
  }
}
