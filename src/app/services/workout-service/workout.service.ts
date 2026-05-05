import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Esercizio, Scheda } from '../../models/esercizio.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private jsonUrl = 'assets/data/esercizi.json';

  constructor(private http: HttpClient) { }

  getEsercizi(): Observable<Scheda[]> {
    // Simula una chiamata GET al database
    return this.http.get<Scheda[]>(this.jsonUrl);
  }
}