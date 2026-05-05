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
  esercizi: Esercizio[];
}
