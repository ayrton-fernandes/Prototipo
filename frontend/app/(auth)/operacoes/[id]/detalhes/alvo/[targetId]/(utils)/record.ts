import { BaseResponseDTO } from "@/domain/types/base";
import { CustomFieldResponse } from "@/domain/types/customField";
import { FieldValueResponse } from "@/domain/types/fieldValue";
import { TargetResponse } from "@/domain/types/target";
import { TemplateFieldResponse } from "@/domain/types/templateField";
import { formatDateToBackend, formatDateToDisplay, maskCpf } from "@/utils/formatters";

export type ProntuarioCategoryCode =
  | "IDENTIFICACAO"
  | "CONTEXTO_OPERACIONAL"
  | "VINCULO_RELACIONAL";

export interface ProntuarioCategoryConfig {
  codeName: ProntuarioCategoryCode;
  title: string;
  description: string;
  groupLabels: string[];
}

export interface TemplateGroupNode {
  group: TemplateFieldResponse;
  children: TemplateFieldResponse[];
  subgroups: TemplateGroupNode[];
}

export interface ProntuarioFieldDraft {
  fieldValueId: number | null;
  templateFieldId: number | null;
  customFieldId: number | null;
  groupInstanceId: string | null;
  valueContent: string;
}

export interface DropdownOption {
  label: string;
  value: string;
}

export type CanonicalInputType = "GROUP" | "TEXT" | "NUMBER" | "DATE" | "DROPDOWN" | "INPUT";

export interface ProntuarioFieldPresentation {
  label: string;
  inputTypeOverride: CanonicalInputType | null;
}

const CATEGORY_ORDER: ProntuarioCategoryCode[] = ["IDENTIFICACAO", "CONTEXTO_OPERACIONAL", "VINCULO_RELACIONAL"];

export const PRONTUARIO_CATEGORY_CONFIGS: Record<ProntuarioCategoryCode, ProntuarioCategoryConfig> = {
  IDENTIFICACAO: {
    codeName: "IDENTIFICACAO",
    title: "Identificação",
    description: "Dados biográficos e registros formais do alvo.",
    groupLabels: ["Alvo", "Informações sobre Estado Civíl", "Registro Geral", "Filiação", "Fotos do Alvo", "Naturalidade"],
  },
  CONTEXTO_OPERACIONAL: {
    codeName: "CONTEXTO_OPERACIONAL",
    title: "Contexto Operacional",
    description: "Anotações, pessoas e endereços relacionados à investigação.",
    groupLabels: ["Informação", "Pessoas Envolvidas", "Endereços do Alvo", "Imagens do Local do Endereço"],
  },
  VINCULO_RELACIONAL: {
    codeName: "VINCULO_RELACIONAL",
    title: "Vínculo Relacional",
    description: "Conexões institucionais e vínculos secundários do alvo.",
    groupLabels: ["Hospitais / UPAs", "Endereço Hospitais / UPAs"],
  },
};

const REPEATABLE_GROUPS = new Set([
  "filiacao",
  "fotos do alvo",
  "pessoas envolvidas",
  "endereços do alvo",
  "imagens do local do endereço",
  "hospitais / upas",
  "endereço hospitais / upas",
  "endereço",
]);

const FILIACAO_GROUP_KEY = "filiacao";
const LEGACY_FILIACAO_MOTHER_INSTANCE_ID = "filiacao-mother";
const LEGACY_FILIACAO_FATHER_INSTANCE_ID = "filiacao-father";
const LEGACY_FILIACAO_FATHER_ALT_INSTANCE_ID = "filiacao-father-alt";
export const FILIACAO_MOTHER_INSTANCE_ID = "9edebf15-7437-4ebf-869e-40f8f9cf45cb";
export const FILIACAO_FATHER_INSTANCE_ID = "11e5c84d-d7bb-4f31-a391-5fa326d8a316";
export const FILIACAO_FATHER_ALT_INSTANCE_ID = "e02f9f74-f19f-4977-abd8-7c00e0f83d34";
export const FILIACAO_MOTHER_KINSHIP = "Mãe";
export const FILIACAO_FATHER_KINSHIP = "Pai";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const UF_OPTIONS: DropdownOption[] = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
].map((value) => ({ label: value, value }));

const ESTADO_CIVIL_OPTIONS: DropdownOption[] = [
  "Solteiro",
  "Casado",
  "União estável",
  "Separado",
  "Divorciado",
  "Viúvo",
  "Outro",
].map((value) => ({ label: value, value }));

const NACIONALIDADE_OPTIONS: DropdownOption[] = [
  "Brasileira",
  "Argentina",
  "Uruguaia",
  "Paraguaia",
  "Chilena",
  "Boliviana",
  "Peruana",
  "Colombiana",
  "Venezuelana",
  "Equatoriana",
  "Norte-americana",
  "Portuguesa",
  "Espanhola",
  "Italiana",
  "Alemã",
  "Francesa",
  "Chinesa",
  "Japonesa",
  "Outra",
].map((value) => ({ label: value, value }));

const ESTA_PRESO_OPTIONS: DropdownOption[] = ["Sim", "Não"].map((value) => ({
  label: value,
  value,
}));

const RG_ORGAO_OPTIONS: DropdownOption[] = [
  "SDS",
  "SSP",
  "DIC",
  "IFP",
  "OUTROS",
].map((value) => ({ label: value, value }));

const VINCULO_OPTIONS: DropdownOption[] = [
  FILIACAO_MOTHER_KINSHIP,
  FILIACAO_FATHER_KINSHIP,
  "Familiar",
  "Amigo",
  "Conhecido",
  "Relacionamento afetivo",
  "Outro",
].map((value) => ({
  label: value,
  value,
}));

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const GROUP_TITLE_OVERRIDES: Record<string, string> = {
  "fotos do alvo": "Lista de Fotos (FOTO DO ALVO)",
  "pessoas envolvidas": "Pessoas Relacionadas",
  "endereços do alvo": "Endereço do Alvo",
  "imagens do local do endereço": "Imagem do Local",
};

const INPUT_TYPE_ALIASES: Record<string, CanonicalInputType> = {
  GRUPO: "GROUP",
  GROUP: "GROUP",
  TEXTO: "TEXT",
  TEXT: "TEXT",
  NUMERICO: "NUMBER",
  NUMBER: "NUMBER",
  DATA: "DATE",
  DATE: "DATE",
  DROPDOWN: "DROPDOWN",
  INPUT: "INPUT",
};

export const normalizeInputType = (inputType: string | null | undefined): CanonicalInputType | null => {
  if (!inputType) {
    return null;
  }

  return INPUT_TYPE_ALIASES[inputType.trim().toUpperCase()] ?? null;
};

export const normalizeGroupInstanceId = (groupInstanceId: string | null): string | null => {
  if (!groupInstanceId) {
    return null;
  }

  if (groupInstanceId === LEGACY_FILIACAO_MOTHER_INSTANCE_ID) {
    return FILIACAO_MOTHER_INSTANCE_ID;
  }

  if (groupInstanceId === LEGACY_FILIACAO_FATHER_INSTANCE_ID) {
    return FILIACAO_FATHER_INSTANCE_ID;
  }

  if (groupInstanceId === LEGACY_FILIACAO_FATHER_ALT_INSTANCE_ID) {
    return FILIACAO_FATHER_ALT_INSTANCE_ID;
  }

  return groupInstanceId;
};

export const isValidUuid = (value: string): boolean => UUID_REGEX.test(value);

export const getDisplayGroupLabel = (label: string): string => GROUP_TITLE_OVERRIDES[normalizeText(label)] ?? label;

export const isCompactGroup = (label: string): boolean => normalizeText(label) === "alvo";

export const getOrderedCategories = (categories: BaseResponseDTO[]): BaseResponseDTO[] =>
  [...categories].sort((left, right) => {
    const leftIndex = CATEGORY_ORDER.indexOf(left.codeName as ProntuarioCategoryCode);
    const rightIndex = CATEGORY_ORDER.indexOf(right.codeName as ProntuarioCategoryCode);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.descName.localeCompare(right.descName, "pt-BR");
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });

export const getCategoryConfig = (category: BaseResponseDTO): ProntuarioCategoryConfig | null => {
  if (category.codeName in PRONTUARIO_CATEGORY_CONFIGS) {
    return PRONTUARIO_CATEGORY_CONFIGS[category.codeName as ProntuarioCategoryCode];
  }

  return null;
};

export const buildTemplateGroups = (fields: TemplateFieldResponse[]): TemplateGroupNode[] => {
  const activeFields = fields
    .filter((field) => field.active)
    .sort((left, right) => (left.orderIndex ?? Number.MAX_SAFE_INTEGER) - (right.orderIndex ?? Number.MAX_SAFE_INTEGER));

  const childrenByParent = new Map<number, TemplateFieldResponse[]>();
  const groupsByParent = new Map<number, TemplateFieldResponse[]>();

  activeFields.forEach((field) => {
    if (field.parentFieldId == null) {
      return;
    }

    const isGroup = normalizeInputType(field.inputType) === "GROUP";
    const currentChildren = isGroup
      ? (groupsByParent.get(field.parentFieldId) ?? [])
      : (childrenByParent.get(field.parentFieldId) ?? []);

    currentChildren.push(field);

    if (isGroup) {
      groupsByParent.set(field.parentFieldId, currentChildren);
      return;
    }

    childrenByParent.set(field.parentFieldId, currentChildren);
  });

  const buildGroupNode = (group: TemplateFieldResponse): TemplateGroupNode => ({
    group,
    children: (childrenByParent.get(group.id) ?? []).sort((left, right) => (left.orderIndex ?? Number.MAX_SAFE_INTEGER) - (right.orderIndex ?? Number.MAX_SAFE_INTEGER)),
    subgroups: (groupsByParent.get(group.id) ?? [])
      .sort((left, right) => (left.orderIndex ?? Number.MAX_SAFE_INTEGER) - (right.orderIndex ?? Number.MAX_SAFE_INTEGER))
      .map(buildGroupNode),
  });

  const rootNodes = activeFields
    .filter((field) => normalizeInputType(field.inputType) === "GROUP" && field.parentFieldId == null)
    .map(buildGroupNode);

  // Virtual Hierarchy Hacks: nest groups that are top-level in template but logically subgroups
  const findAndRemove = (nodes: TemplateGroupNode[], label: string): TemplateGroupNode | null => {
    const normalized = normalizeText(label);
    const index = nodes.findIndex((n) => normalizeText(n.group.label) === normalized);
    if (index !== -1) {
      return nodes.splice(index, 1)[0];
    }
    for (const node of nodes) {
      const found = findAndRemove(node.subgroups, label);
      if (found) return found;
    }
    return null;
  };

  const findNode = (nodes: TemplateGroupNode[], label: string): TemplateGroupNode | null => {
    const normalized = normalizeText(label);
    for (const node of nodes) {
      if (normalizeText(node.group.label) === normalized) return node;
      const found = findNode(node.subgroups, label);
      if (found) return found;
    }
    return null;
  };

  // Move "Imagens do Local do Endereço" inside "Endereço"
  const imgsLocal = findAndRemove(rootNodes, "Imagens do Local do Endereço");
  if (imgsLocal) {
    const endereco = findNode(rootNodes, "Endereço");
    if (endereco) {
      endereco.subgroups.push(imgsLocal);
    } else {
      rootNodes.push(imgsLocal);
    }
  }

  // Move "Endereço Hospitais / UPAs" inside "Hospitais / UPAs"
  const endHosp = findAndRemove(rootNodes, "Endereço Hospitais / UPAs");
  if (endHosp) {
    const hosp = findNode(rootNodes, "Hospitais / UPAs");
    if (hosp) {
      hosp.subgroups.push(endHosp);
    } else {
      rootNodes.push(endHosp);
    }
  }

  return rootNodes;
};

export const getGroupNodeFieldIds = (groupNode: TemplateGroupNode): number[] => [
  ...groupNode.children.map((field) => field.id),
  ...groupNode.subgroups.flatMap((subgroup) => getGroupNodeFieldIds(subgroup)),
];

export const buildCategoryTemplateGroups = (groups: TemplateGroupNode[], categoryCode: string): TemplateGroupNode[] => {
  const config = PRONTUARIO_CATEGORY_CONFIGS[categoryCode as ProntuarioCategoryCode];

  if (!config) {
    return [];
  }

  return groups.filter((group) => config.groupLabels.includes(group.group.label));
};

export const isRepeatableGroup = (label: string): boolean => {
  const normalized = normalizeText(label);
  for (const item of REPEATABLE_GROUPS) {
    if (normalizeText(item) === normalized) return true;
  }
  return false;
};

export const isFiliacaoGroup = (label: string): boolean => normalizeText(label) === FILIACAO_GROUP_KEY;

export const getFieldPresentationForGroup = (
  groupLabel: string,
  field: TemplateFieldResponse,
  _fieldIndex: number
): ProntuarioFieldPresentation => {
  const normalizedFieldLabel = normalizeText(field.label);

  const normalizedGroupLabel = normalizeText(groupLabel);

  if (isFiliacaoGroup(groupLabel)) {
    if (normalizedFieldLabel === "nome") {
      return {
        label: "Nome",
        inputTypeOverride: "TEXT",
      };
    }

    if (normalizedFieldLabel === "vinculo") {
      return {
        label: "Parentesco",
        inputTypeOverride: "DROPDOWN",
      };
    }
  }

  if (normalizedFieldLabel === "orgao emissor rg" || normalizedFieldLabel === "estado emissor rg") {
    return {
      label: field.label,
      inputTypeOverride: "DROPDOWN",
    };
  }

  // For hospital/UPA related groups, ensure the 'número' field is numeric
  if (
    (normalizedGroupLabel.includes("hospitais") || normalizedGroupLabel.includes("upa") || normalizedGroupLabel.includes("upas")) &&
    (normalizedFieldLabel === "numero" || normalizedFieldLabel.includes("numero") || normalizedFieldLabel.includes("número"))
  ) {
    return {
      label: field.label,
      inputTypeOverride: "NUMBER",
    };
  }

  return {
    label: field.label,
    inputTypeOverride: null,
  };
};

export const buildTemplateFieldDraftKey = (entryId: number, templateFieldId: number, groupInstanceId: string | null): string =>
  `entry:${entryId}:template:${templateFieldId}:group:${groupInstanceId ?? "single"}`;

export const buildCustomFieldDraftKey = (entryId: number, customFieldId: number): string =>
  `entry:${entryId}:custom:${customFieldId}`;

export const buildEntryDraftMap = (
  entryId: number,
  templateFields: TemplateFieldResponse[],
  fieldValues: FieldValueResponse[],
  customFields: CustomFieldResponse[]
): Record<string, ProntuarioFieldDraft> => {
  const drafts: Record<string, ProntuarioFieldDraft> = {};
  const normalizeValueForDisplay = (field: TemplateFieldResponse, valueContent: string): string =>
    normalizeInputType(field.inputType) === "DATE" ? formatDateToDisplay(valueContent) : valueContent;

  templateFields
    .filter((field) => normalizeInputType(field.inputType) !== "GROUP")
    .forEach((field) => {
      const valuesForField = fieldValues.filter((value) => value.templateFieldId === field.id);

      if (valuesForField.length === 0) {
        drafts[buildTemplateFieldDraftKey(entryId, field.id, null)] = {
          fieldValueId: null,
          templateFieldId: field.id,
          customFieldId: null,
          groupInstanceId: null,
          valueContent: "",
        };
        return;
      }

      valuesForField.forEach((value) => {
        const normalizedGroupInstanceId = normalizeGroupInstanceId(value.groupInstanceId ? String(value.groupInstanceId) : null);
        drafts[buildTemplateFieldDraftKey(entryId, field.id, normalizedGroupInstanceId)] = {
          fieldValueId: value.id,
          templateFieldId: field.id,
          customFieldId: null,
          groupInstanceId: normalizedGroupInstanceId,
          valueContent: normalizeValueForDisplay(field, value.valueContent),
        };
      });
    });

  customFields.forEach((customField) => {
    const value = fieldValues.find((item) => item.customFieldId === customField.id);
    const normalizedGroupInstanceId = normalizeGroupInstanceId(value?.groupInstanceId ? String(value.groupInstanceId) : null);
    const customFieldInputType = normalizeInputType(customField.inputType);
    drafts[buildCustomFieldDraftKey(entryId, customField.id)] = {
      fieldValueId: value?.id ?? null,
      templateFieldId: null,
      customFieldId: customField.id,
      groupInstanceId: normalizedGroupInstanceId,
      valueContent:
        value != null && customFieldInputType === "DATE"
          ? formatDateToDisplay(value.valueContent)
          : value?.valueContent ?? "",
    };
  });

  return drafts;
};

const getTargetSeedValueForField = (
  field: TemplateFieldResponse,
  _parentGroupLabel: string | null,
  target: TargetResponse
): string | null => {
  const normalizedLabel = normalizeText(field.label);

  if (normalizedLabel.includes("nome da mae") || normalizedLabel.includes("mae")) {
    return target.motherName;
  }

  if (normalizedLabel.includes("cpf")) {
    return maskCpf(target.cpf);
  }

  if (normalizedLabel.includes("data de nascimento") || normalizedLabel.includes("nascimento")) {
    return target.birthDate ? formatDateToDisplay(target.birthDate) : null;
  }

  if (normalizedLabel.includes("nome do alvo") || (normalizedLabel.includes("alvo") && normalizedLabel.includes("nome")) || normalizedLabel === "nome") {
    return target.fullName;
  }

  return null;
};

export const applyTargetDraftSeeds = (
  entryId: number,
  templateFields: TemplateFieldResponse[],
  drafts: Record<string, ProntuarioFieldDraft>,
  target: TargetResponse | null
): Record<string, ProntuarioFieldDraft> => {
  if (!target) {
    return drafts;
  }

  const nextDrafts = { ...drafts };
  const parentGroupLabelById = new Map<number, string>(
    templateFields
      .filter((field) => normalizeInputType(field.inputType) === "GROUP")
      .map((field) => [field.id, field.label])
  );

  const hasVisibleValueForField = (templateFieldId: number) =>
    Object.values(nextDrafts).some(
      (draft) => draft.templateFieldId === templateFieldId && (draft.fieldValueId != null || draft.valueContent.trim().length > 0)
    );

  templateFields
    .filter((field) => normalizeInputType(field.inputType) !== "GROUP")
    .forEach((field) => {
      const parentGroupLabel = field.parentFieldId != null ? parentGroupLabelById.get(field.parentFieldId) ?? null : null;
      if (parentGroupLabel && isFiliacaoGroup(parentGroupLabel)) {
        return;
      }

      const seedValue = getTargetSeedValueForField(field, parentGroupLabel, target);

      if (!seedValue) {
        return;
      }

      const hasExistingVisibleValue = hasVisibleValueForField(field.id);

      if (hasExistingVisibleValue) {
        return;
      }

      const draftKey = buildTemplateFieldDraftKey(entryId, field.id, null);
      nextDrafts[draftKey] = {
        fieldValueId: null,
        templateFieldId: field.id,
        customFieldId: null,
        groupInstanceId: null,
        valueContent: seedValue,
      };
    });

  return nextDrafts;
};

export const buildEntryDraftForNewGroupInstance = (
  entryId: number,
  groupNode: TemplateGroupNode,
  instanceId: string,
  existingDrafts: Record<string, ProntuarioFieldDraft>
): Record<string, ProntuarioFieldDraft> => {
  const nextDrafts = { ...existingDrafts };

  getGroupNodeFieldIds(groupNode).forEach((fieldId) => {
    const draftKey = buildTemplateFieldDraftKey(entryId, fieldId, instanceId);
    nextDrafts[draftKey] = {
      fieldValueId: null,
      templateFieldId: fieldId,
      customFieldId: null,
      groupInstanceId: instanceId,
      valueContent: "",
    };
  });

  return nextDrafts;
};

const DATE_BACKEND_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const normalizeDateValueForBackend = (value: string): string => {
  const trimmed = value.trim();

  if (!trimmed) {
    return trimmed;
  }

  if (DATE_BACKEND_REGEX.test(trimmed)) {
    return trimmed;
  }

  return formatDateToBackend(trimmed) ?? trimmed;
};

const resolveDraftInputType = (
  draft: ProntuarioFieldDraft,
  templateInputTypeById?: ReadonlyMap<number, CanonicalInputType | null>,
  customInputTypeById?: ReadonlyMap<number, CanonicalInputType | null>
): CanonicalInputType | null => {
  if (draft.templateFieldId != null) {
    return templateInputTypeById?.get(draft.templateFieldId) ?? null;
  }

  if (draft.customFieldId != null) {
    return customInputTypeById?.get(draft.customFieldId) ?? null;
  }

  return null;
};

export const buildDraftValuePayload = (
  draft: ProntuarioFieldDraft,
  templateInputTypeById?: ReadonlyMap<number, CanonicalInputType | null>,
  customInputTypeById?: ReadonlyMap<number, CanonicalInputType | null>
) => {
  const inputType = resolveDraftInputType(draft, templateInputTypeById, customInputTypeById);
  const trimmedValue = draft.valueContent.trim();
  const normalizedValue = inputType === "DATE" ? normalizeDateValueForBackend(trimmedValue) : trimmedValue;

  return {
    templateFieldId: draft.templateFieldId,
    customFieldId: draft.customFieldId,
    groupInstanceId: normalizeGroupInstanceId(draft.groupInstanceId),
    valueContent: normalizedValue,
  };
};

export const hasVisibleDraftValue = (draft: ProntuarioFieldDraft): boolean =>
  draft.fieldValueId != null || draft.valueContent.trim().length > 0;

export const countFilledDrafts = (drafts: Record<string, ProntuarioFieldDraft>, fieldIds: number[]): { filledCount: number; totalCount: number } => {
  const values = Object.values(drafts).filter((draft) => {
    if (draft.templateFieldId != null) {
      return fieldIds.includes(draft.templateFieldId);
    }

    return false;
  });

  return {
    filledCount: values.filter((draft) => draft.valueContent.trim().length > 0).length,
    totalCount: values.length,
  };
};

export const getDropdownOptionsForField = (label: string): DropdownOption[] | null => {
  const normalizedLabel = normalizeText(label);

  if (normalizedLabel === "estado civil") {
    return ESTADO_CIVIL_OPTIONS;
  }

  if (normalizedLabel === "nacionalidade") {
    return NACIONALIDADE_OPTIONS;
  }

  if (normalizedLabel === "vinculo") {
    return VINCULO_OPTIONS;
  }

  if (
    normalizedLabel === "estado" ||
    normalizedLabel === "uf do estado" ||
    normalizedLabel === "estado emissor rg"
  ) {
    return UF_OPTIONS;
  }

  if (normalizedLabel === "orgao emissor rg") {
    return RG_ORGAO_OPTIONS;
  }

  if (normalizedLabel === "esta preso?" || normalizedLabel === "esta preso") {
    return ESTA_PRESO_OPTIONS;
  }

  return null;
};

export const shouldUseTextarea = (label: string): boolean =>
  /descri|inform|observ|detalh|coment|histór|relac|conteu/i.test(label);
