// services/workout-service/workout.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Scheda, Esercizio } from '../../models/esercizio.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private http = inject(HttpClient);
  
  // URL corretta che punta al nuovo SchedaController in Java
  private apiUrl = 'http://localhost:8080/api/schede';

  // 1. Stato globale delle schede (Legge l'oggetto strutturato)
  private schedeSignal = signal<Scheda[]>([]);
  
  // Esponiamo il segnale in sola lettura per i componenti
  readonly schede = this.schedeSignal.asReadonly();

  constructor() {
    // Avvia immediatamente lo scaricamento dei dati all'accensione dell'app
    this.caricaSchedeDalBackend();
  }

  // GET: Scarica la struttura delle schede e degli esercizi da Java
  private caricaSchedeDalBackend() {
    this.http.get<Scheda[]>(this.apiUrl).subscribe({
      next: (dati) => {
        this.schedeSignal.set(dati);
        console.log('Schede caricate con successo da Java:', dati);
      },
      error: (err) => {
        console.error('Errore nel caricamento dal backend Java. Verifica che Spring Boot sia acceso sulla porta 8080.', err);
      }
    });
  }

  // POST: Sincronizza l'intero array delle schede (Aggiunta/Rimozione/Spostamento) con Java
  salvaNuovaListaSchede(nuoveSchede: Scheda[]) {
    // Aggiornamento ottimistico locale per mantenere la UI fluida
    this.schedeSignal.set(nuoveSchede);

    // Invia lo stato aggiornato a Spring Boot per salvarlo nel DB in memoria
    this.http.post<any>(this.apiUrl, nuoveSchede).subscribe({
      next: () => console.log('Stato delle schede sincronizzato con successo su Java DB'),
      error: (err) => console.error('Errore durante la sincronizzazione con Java:', err)
    });
  }

  // Metodo per smarcare l'esercizio (chiamato dal toggleCompletato della lista)
  aggiornaEsercizio(schedaId: number, esercizioAggiornato: Esercizio) {
    this.schedeSignal.update(lista => 
      lista.map(s => s.id === schedaId ? {
        ...s,
        esercizi: s.esercizi.map(ex => ex.id === esercizioAggiornato.id ? esercizioAggiornato : ex)
      } : s)
    );
    // Notifica le modifiche al database Java
    this.salvaNuovaListaSchede(this.schedeSignal());
  }

  // Metodo per aggiornare i giorni (chiamato dai pulsanti L, M, M...)
  updateGiorniSettimana(schedaId: number, nuoviGiorni: number[]) {
    this.schedeSignal.update(lista => 
      lista.map(s => s.id === schedaId ? { ...s, giorniSettimana: nuoviGiorni } : s)
    );
    // Notifica le modifiche al database Java
    this.salvaNuovaListaSchede(this.schedeSignal());
  }

  // 2. Logica per la Dashboard: Trova la scheda di oggi
  readonly schedaDiOggi = computed(() => {
    const oggi = new Date().getDay(); // 0 (Dom) a 6 (Sab)
    return this.schede().find(s => s.giorniSettimana?.includes(oggi));
  });
}