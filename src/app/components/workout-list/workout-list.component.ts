import { Component, OnInit, signal, computed, inject } from '@angular/core';
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
    standalone: true,
    imports: [
        CommonModule, 
        FormsModule, 
        ExerciseItemComponent, 
        ExerciseFormComponent, 
        WorkoutTabsComponent, 
        DragDropModule, 
        TimerWidgetComponent 
    ],
    templateUrl: './workout-list.component.html',
    styleUrls: ['./workout-list.component.css']
})
export class WorkoutListComponent implements OnInit {
  // Iniezione moderna del servizio
  private workoutService = inject(WorkoutService);

  nuovoNome: string = '';
  nuovoCarico: number = 0;
  mostraForm: boolean = false;

  nuovaSchedaNome: string = '';
  mostraFormScheda: boolean = false;

  // Indice della scheda attiva gestito come Signal
  schedaAttivaIndex = signal<number>(0);

  // Computed Signal per ottenere la scheda corrente dal Service
  readonly schedaCorrenteSignal = computed(() => {
    const lista = this.workoutService.schede();
    return (lista && lista.length > 0) ? lista[this.schedaAttivaIndex()] : null;
  });

  get schedaCorrente() {
    return this.schedaCorrenteSignal();
  }

  get schede() {
    return this.workoutService.schede();
  }

  constructor() {}

  ngOnInit() {}

  aggiungiEsercizio(nuovoEx: Esercizio) {
    if (this.schedaCorrente) {
      this.schedaCorrente.esercizi.push(nuovoEx);
      // Sincronizziamo la modifica con il database Java
      this.workoutService.salvaSchedaSuBackend(this.schedaCorrente);
    }
  }

  eliminaEsercizio(esercizio: Esercizio) {
    const conferma = window.confirm(`Sei sicuro di voler eliminare l'esercizio "${esercizio.nome}"?`);
    if (conferma && this.schedaCorrente) {
      this.schedaCorrente.esercizi = this.schedaCorrente.esercizi.filter(ex => ex.id !== esercizio.id);
      
      // Sincronizziamo la rimozione con il database Java
      this.workoutService.salvaSchedaSuBackend(this.schedaCorrente);

      if (this.schedaCorrente.esercizi.length > 0 && this.percentualeCompletamento === 100) {
        this.lanciaCoriandoli();
      }
    }
  }

  onDrop(event: CdkDragDrop<any>) {
    if (this.schedaCorrente) {
        moveItemInArray(this.schedaCorrente.esercizi, event.previousIndex, event.currentIndex);
        // Sincronizziamo il nuovo ordine degli esercizi su Java
        this.workoutService.salvaSchedaSuBackend(this.schedaCorrente);
    }
  }

  toggleCompletato(esercizio: Esercizio) {
    if (this.schedaCorrente && this.schedaCorrente.id !== undefined) {
      const esercizioModificato = { ...esercizio, completato: !esercizio.completato };
      this.workoutService.aggiornaEsercizio(this.schedaCorrente.id, esercizioModificato);
      
      if (this.percentualeCompletamento === 100) {
        this.lanciaCoriandoli();
      }
    }
  }
  
  get percentualeCompletamento(): number {
      const scheda = this.schedaCorrente;
      if (!scheda || !scheda.esercizi || scheda.esercizi.length === 0) return 0;

      const completati = scheda.esercizi.filter(ex => ex.completato).length;
      return Math.round((completati / scheda.esercizi.length) * 100);
  }

  resettaSchedaCorrente() {
    if (this.schedaCorrente && this.percentualeCompletamento > 0) {
      this.schedaCorrente.esercizi.forEach(ex => ex.completato = false);
      this.workoutService.salvaSchedaSuBackend(this.schedaCorrente);
    }
  }

  private lanciaCoriandoli() {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f97316', '#f97316', '#e4e4e7']
    });
  }
  
  aggiungiScheda(nome: string) {
      this.workoutService.creaNuovaScheda(nome);

      setTimeout(() => {
        this.schedaAttivaIndex.set(this.workoutService.schede().length - 1);
      }, 100);
  }

  rimuoviSchedaCorrente() {
    const scheda = this.schedaCorrente;
    if (!scheda) return;
    
    const conferma = window.confirm(`Eliminare la scheda "${scheda.nome}"?`);
    if (conferma) {
      const listaAttuale = this.workoutService.schede().filter(s => s.id !== scheda.id);
      this.workoutService.updateGiorniSettimana(scheda.id!, []);
      this.schedaAttivaIndex.set(0);
    }
  }

  salvaModificheScheda() {
    if (this.schedaCorrente) {
      this.workoutService.salvaSchedaSuBackend(this.schedaCorrente);
    }
  }


  toggleGiorno(index: number) {
    const scheda = this.schedaCorrente;
    if (!scheda || scheda.id === undefined) return;

    let nuoviGiorni = [...(scheda.giorniSettimana || [])];
    if (nuoviGiorni.includes(index)) {
      nuoviGiorni = nuoviGiorni.filter(d => d !== index);
    } else {
      nuoviGiorni.push(index);
    }
    
    this.workoutService.updateGiorniSettimana(scheda.id, nuoviGiorni);
  }
}
