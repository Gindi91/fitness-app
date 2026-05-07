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
    const lista = this.workoutService.schede(); // Legge il segnale dal service
    return (lista && lista.length > 0) ? lista[this.schedaAttivaIndex()] : null;
  });

  // Getter per mantenere la compatibilità con il template esistente
  get schedaCorrente() {
    return this.schedaCorrenteSignal();
  }

  // Getter per le schede totali (dal service)
  get schede() {
    return this.workoutService.schede();
  }

  constructor() {}

  ngOnInit() {
    // Non serve più il subscribe perché il WorkoutService 
    // carica i dati nel suo costruttore e li espone tramite segnale
  }

  aggiungiEsercizio(nuovoEx: Esercizio) {
    if (this.schedaCorrente) {
      this.schedaCorrente.esercizi.push(nuovoEx);
    }
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

  onDrop(event: CdkDragDrop<any>) {
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
      const scheda = this.schedaCorrente;
      if (!scheda || !scheda.esercizi || scheda.esercizi.length === 0) return 0;

      const completati = scheda.esercizi.filter(ex => ex.completato).length;
      return Math.round((completati / scheda.esercizi.length) * 100);
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
      colors: ['#f97316', '#f97316', '#e4e4e7']
    });
  }
  
  aggiungiScheda(nome: string) {
      const nuova: Scheda = {
        id: Date.now(),
        nomeScheda: nome,
        esercizi: [],
        giorniSettimana: [],
      };
      // Usiamo il metodo del servizio per mantenere l'integrità dei dati
      // (Oppure, se preferisci aggiornare localmente l'array del service)
      const listaAttuale = [...this.workoutService.schede()];
      listaAttuale.push(nuova);
      (this.workoutService as any).schedeSignal.set(listaAttuale); 
      
      this.schedaAttivaIndex.set(listaAttuale.length - 1);
  }

  rimuoviSchedaCorrente() {
    const scheda = this.schedaCorrente;
    if (!scheda) return;
    
    const conferma = window.confirm(`Eliminare la scheda "${scheda.nomeScheda}"?`);
    if (conferma) {
      const listaAttuale = this.workoutService.schede().filter(s => s.id !== scheda.id);
      (this.workoutService as any).schedeSignal.set(listaAttuale);
      this.schedaAttivaIndex.set(0);
    }
  }

  // Funzione per aggiornare i giorni programmata (da chiamare nel template)
  toggleGiorno(index: number) {
    const scheda = this.schedaCorrente;
    if (!scheda) return;

    let nuoviGiorni = [...(scheda.giorniSettimana || [])];
    if (nuoviGiorni.includes(index)) {
      nuoviGiorni = nuoviGiorni.filter(d => d !== index);
    } else {
      nuoviGiorni.push(index);
    }
    
    this.workoutService.updateGiorniSettimana(scheda.id, nuoviGiorni);
  }
}
