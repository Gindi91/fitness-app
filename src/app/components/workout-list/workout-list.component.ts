import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Esercizio, Scheda } from '../../models/esercizio.model';
import { FormsModule } from '@angular/forms';
import confetti from 'canvas-confetti';
import { WorkoutService } from '../../services/workout-service/workout.service';
import { ExerciseItemComponent } from './exercise-item/exercise-item.component';
import { ExerciseFormComponent } from './exercise-form/exercise-form.component';
import { WorkoutTabsComponent } from './workout-tabs/workout-tabs.component';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { TimerWidgetComponent } from '../timer-widget/timer-widget.component';

@Component({
    selector: 'app-workout-list',
    imports: [CommonModule, FormsModule, ExerciseItemComponent, ExerciseFormComponent, WorkoutTabsComponent, DragDropModule, TimerWidgetComponent ],
    templateUrl: './workout-list.component.html',
    styleUrls: ['./workout-list.component.css']
})

export class WorkoutListComponent implements OnInit {

  nuovoNome: string = '';
  nuovoCarico: number = 0;
  mostraForm: boolean = false;

  nuovaSchedaNome: string = '';
  mostraFormScheda: boolean = false;


  schede: Scheda[] = [];
  schedaAttivaIndex: number = 0;

constructor(private workoutService: WorkoutService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.workoutService.getEsercizi().subscribe({next: (dati) => {
        this.schede = dati;
        if (this.schede.length > 0) {
          this.schedaAttivaIndex = 0;
        }
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error(err)
    });
  }

  get schedaCorrente() {
    return (this.schede && this.schede.length > 0) 
      ? this.schede[this.schedaAttivaIndex] 
      : null;
  }

  aggiungiEsercizio(nuovoEx: Esercizio) {
    this.schedaCorrente?.esercizi.push(nuovoEx);
  }

  eliminaEsercizio(esercizio: Esercizio) {
    const conferma = window.confirm(`Sei sicuro di voler eliminare l'esercizio "${esercizio.nome}"?`);

    if (conferma && this.schedaCorrente) {
      this.schedaCorrente.esercizi = this.schedaCorrente.esercizi.filter(ex => ex.id !== esercizio.id);
      
      if (this.schedaCorrente.esercizi.length > 0 && this.percentualeCompletamento === 100) {
        this.lanciaCoriandoli();
      }
    }
  }

  onDrop(event: CdkDragDrop<any>) { // Usando <any> risolvi il conflitto di assegnazione
    if (this.schedaCorrente) {
        moveItemInArray(this.schedaCorrente.esercizi, event.previousIndex, event.currentIndex);
    }
  }


  toggleCompletato(esercizio: Esercizio) {
    esercizio.completato = !esercizio.completato;
    if (this.percentualeCompletamento === 100) {
      this.lanciaCoriandoli();
    }
  }
  
  get percentualeCompletamento(): number {
      if (!this.schedaCorrente || this.schedaCorrente.esercizi.length === 0) return 0;

      const completati = this.schedaCorrente.esercizi.filter(ex => ex.completato).length;
      return Math.round((completati / this.schedaCorrente.esercizi.length) * 100);
  }

  resettaSchedaCorrente() {
    if (this.percentualeCompletamento > 0) {
      this.schedaCorrente?.esercizi.forEach(ex => ex.completato = false);
    }
  }


  private lanciaCoriandoli() {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#27ae60', '#2ecc71', '#ffffff'] // Colori a tema salute/palestra
    });
  }
  
  aggiungiScheda(nome: string) {
      const nuova: Scheda = {
        id: Date.now(),
        nomeScheda: nome,
        esercizi: []
      };
      this.schede.push(nuova);
      this.schedaAttivaIndex = this.schede.length - 1; // Seleziona la nuova
  }

  rimuoviSchedaCorrente() {
    if (!this.schedaCorrente) return;
    
    const nome = this.schedaCorrente.nomeScheda;
    const conferma = window.confirm(`Eliminare la scheda "${nome}"?`);

    if (conferma) {
      this.schede.splice(this.schedaAttivaIndex, 1);
      this.schedaAttivaIndex = 0;
    }
  }
}

