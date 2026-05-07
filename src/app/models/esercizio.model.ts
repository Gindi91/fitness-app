export interface Esercizio {
  id: number;
  nome: string;
  serie: number;
  ripetizioni: number;
  carico: number;
  completato: boolean;
  note?: string;
}

export interface Scheda {
  id: number;
  nomeScheda: string;
  giorniSettimana: number[];
  esercizi: Esercizio[];
}
