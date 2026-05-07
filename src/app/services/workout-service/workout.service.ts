import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Scheda } from '../../models/esercizio.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private http = inject(HttpClient);
  private jsonUrl = 'assets/data/esercizi.json';

  // 1. Stato globale delle schede
  private schedeSignal = signal<Scheda[]>([]);
  
  // Esponiamo il segnale in sola lettura per i componenti
  readonly schede = this.schedeSignal.asReadonly();

  constructor() {
    this.caricaSchede();
  }

  // Caricamento iniziale
  private caricaSchede() {
    this.http.get<Scheda[]>(this.jsonUrl).subscribe(data => {
      this.schedeSignal.set(data);
    });
  }

  // 2. Logica per la Dashboard: Trova la scheda di oggi
  readonly schedaDiOggi = computed(() => {
    const oggi = new Date().getDay(); // 0 (Dom) a 6 (Sab)
    return this.schede().find(s => s.giorniSettimana?.includes(oggi));
  });

  // Metodo per aggiornare i giorni (da chiamare nel workout-list)
  updateGiorniSettimana(schedaId: number, nuoviGiorni: number[]) {
    this.schedeSignal.update(lista => 
      lista.map(s => s.id === schedaId ? { ...s, giorniSettimana: nuoviGiorni } : s)
    );
  }
}
