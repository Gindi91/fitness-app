// services/workout-service/workout.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Scheda, Esercizio } from '../../models/esercizio.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private http = inject(HttpClient);
  
  // Endpoint che punta al nuovo SchedaController in Java
  private apiUrl = 'http://localhost:8080/api/schede';

  // Stato globale delle schede
  private schedeSignal = signal<Scheda[]>([]);
  
  // Esponiamo il segnale in sola lettura per i componenti
  readonly schede = this.schedeSignal.asReadonly();

  constructor() {
    this.caricaSchedeDalBackend();
  }

  // GET: Scarica la struttura completa delle schede da Java
  private caricaSchedeDalBackend() {
    this.http.get<Scheda[]>(this.apiUrl).subscribe({
      next: (dati) => {
        this.schedeSignal.set(dati);
        console.log('Schede caricate con successo da Java:', dati);
      },
      error: (err) => {
        console.error('Errore nel caricamento dal backend Java. Verifica che Spring Boot sia acceso.', err);
      }
    });
  }

  // POST: Salva o aggiorna una singola scheda nel DB Java
  salvaSchedaSuBackend(scheda: Scheda) {
    this.http.post<Scheda>(this.apiUrl, scheda).subscribe({
      next: (schedaSalvatagg) => {
        console.log('Scheda sincronizzata con successo su Java DB', schedaSalvatagg);
        // Aggiorna lo stato locale sostituendo la vecchia scheda con quella salvata (aggiornata di ID dal DB)
        this.schedeSignal.update(lista => 
          lista.map(s => s.id === scheda.id || s.nome === scheda.nome ? schedaSalvatagg : s)
        );
      },
      error: (err) => console.error('Errore durante la sincronizzazione della scheda con Java:', err)
    });
  }

  // Creazione di una nuova scheda vuota da zero
  creaNuovaScheda(nomeScheda: string, descrizioneScheda?: string) {
    const nuovaScheda: Scheda = {
      nome: nomeScheda,
      descrizione: descrizioneScheda || '',
      esercizi: [],
      giorniSettimana: []
    };

    // Invia direttamente al backend Java
    this.http.post<Scheda>(this.apiUrl, nuovaScheda).subscribe({
      next: (schedaCreata) => {
        this.schedeSignal.update(lista => [...lista, schedaCreata]);
        console.log('Nuova scheda creata a database:', schedaCreata);
      },
      error: (err) => console.error('Errore nella creazione della scheda:', err)
    });
  }

  // Metodo per smarcare l'esercizio
  aggiornaEsercizio(schedaId: number, esercizioAggiornato: Esercizio) {
    this.schedeSignal.update(lista => 
      lista.map(s => s.id === schedaId ? {
        ...s,
        esercizi: s.esercizi.map(ex => ex.id === esercizioAggiornato.id ? esercizioAggiornato : ex)
      } : s)
    );
    
    // Trova la scheda modificata e inviala al backend per salvarla
    const schedaModificata = this.schedeSignal().find(s => s.id === schedaId);
    if (schedaModificata) {
      this.salvaSchedaSuBackend(schedaModificata);
    }
  }

  // Metodo per aggiornare i giorni (L, M, M...)
  updateGiorniSettimana(schedaId: number, nuoviGiorni: number[]) {
    this.schedeSignal.update(lista => 
      lista.map(s => s.id === schedaId ? { ...s, giorniSettimana: nuoviGiorni } : s)
    );
    
    // Trova la scheda modificata e inviala al backend per salvarla
    const schedaModificata = this.schedeSignal().find(s => s.id === schedaId);
    if (schedaModificata) {
      this.salvaSchedaSuBackend(schedaModificata);
    }
  }

  // Logica per la Dashboard: Trova la scheda di oggi
  readonly schedaDiOggi = computed(() => {
    const oggi = new Date().getDay(); // 0 (Dom) a 6 (Sab)
    return this.schede().find(s => s.giorniSettimana?.includes(oggi));
  });
}