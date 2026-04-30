export type TargetTabType =
  | "PRONTUARIO_DO_ALVO"
  | "CORROBORACAO_JURIDICA"
  | "INTERROGATORIO"
  | "DOCUMENTACAO_DA_OPERACAO"
  | "DOCUMENTOS_GENERICOS";

export interface TargetTab {
  id: TargetTabType;
  label: string;
  path: string;
  enabled: boolean;
  active?: boolean;
}

export const TARGET_TABS: Record<TargetTabType, Omit<TargetTab, "enabled" | "active">> = {
  DOCUMENTOS_GENERICOS: {
    id: "DOCUMENTOS_GENERICOS",
    label: "DOCUMENTOS GENERICOS",
    path: "documentos",
  },
  PRONTUARIO_DO_ALVO: {
    id: "PRONTUARIO_DO_ALVO",
    label: "PRONTUARIO DO ALVO",
    path: "prontuario",
  },
  CORROBORACAO_JURIDICA: {
    id: "CORROBORACAO_JURIDICA",
    label: "CORROBORACAO JURIDICA",
    path: "corroboracao-juridica",
  },
  INTERROGATORIO: {
    id: "INTERROGATORIO",
    label: "INTERROGATORIO",
    path: "interrogatorio",
  },
  DOCUMENTACAO_DA_OPERACAO: {
    id: "DOCUMENTACAO_DA_OPERACAO",
    label: "DOCUMENTACAO DA OPERACAO",
    path: "documentacao-operacao",
  },
};
