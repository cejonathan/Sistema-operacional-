export type OcorrenciaType = 'log' | 'simples' | 'especial';

export interface KMRecord {
  id: string;
  vtr: string;
  condutor: string;
  apoio?: string;
  kmInicial: string;
  horaInicial: string;
  kmFinal?: string;
  horaFinal?: string;
  status: 'aberto' | 'fechado';
  timestamp: string;
}

export interface SimplesItem {
  codigo: string;
  local: string;
}

export interface Vitima {
  nome: string;
  sexo: string;
  estado: string;
  descricao: string;
}

export interface Envolvido {
  tipo: string;
  custom?: string;
  placa?: string;
  cnh?: string;
}

export interface ApoioPolicial {
  tipo: string;
  prefixo: string;
  responsavel: string;
}

export interface SocorroMedico {
  tipo: string;
  prefixo?: string;
  responsavel?: string;
}

export interface SinistroData {
  data: string;
  hora: string;
  numero: string;
  origem: string;
  endereco: string;
  caracteristica: string;
  resumo: string;
  agentes: string[];
  vtrs: string[];
  photos: string[];
  supervisao: string;
  responsavel: string;
  matricula: string;
  dataFinal: string;
  envolvidos: Envolvido[];
  apoio: ApoioPolicial[];
  socorro: SocorroMedico[];
  vitimas: Vitima[];
}

export interface LogData {
  codigo: string;
  local: string;
  inicio: string;
  termino: string;
  vtr: string;
  condutor: string;
  apoio: string;
}

export interface Report {
  id: string;
  type: OcorrenciaType;
  data: any; // Can be { items: SimplesItem[] } or LogData or SinistroData or generic especial
  agent: string;
  timestamp: number;
}
