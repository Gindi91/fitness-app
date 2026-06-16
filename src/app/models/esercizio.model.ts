export interface Esercizio {
  id?: number;
  nome: string;
  serie: number;
  ripetizioni: number;
  carico: number;
  completato: boolean;
  note?: string;
}

export interface Scheda {
  id?: number;
  nome: string;     
  descrizione?: string;
  esercizi: Esercizio[];
  giorniSettimana: number[];
}

