"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { showToast } from "@/store/slices/toastSlice";
import { RootState } from "@/store/store";
import { useAppDispatch } from "@/store/store";
import { targetService } from "@/services/targetService";
import { templateService } from "@/services/templateService";
import { templateFieldService } from "@/services/templateFieldService";
import { infoEntryService } from "@/services/infoEntryService";
import { fieldValueService } from "@/services/fieldValueService";
import { customFieldService } from "@/services/customFieldService";
import { domainInfoCategoryService } from "@/services/domainInfoCategoryService";
import { BaseResponseDTO } from "@/domain/types/base";
import { CustomFieldResponse } from "@/domain/types/customField";
import { FieldValueResponse } from "@/domain/types/fieldValue";
import { InfoEntryResponse } from "@/domain/types/infoEntry";
import { TargetResponse } from "@/domain/types/target";
import { TemplateFieldResponse } from "@/domain/types/templateField";
import { TemplateResponse } from "@/domain/types/template";
import {
  CanonicalInputType,
  applyTargetDraftSeeds,
  buildCategoryTemplateGroups,
  buildDraftValuePayload,
  buildEntryDraftForNewGroupInstance,
  buildEntryDraftMap,
  buildCustomFieldDraftKey,
  buildTemplateGroups,
  buildTemplateFieldDraftKey,
  countFilledDrafts,
  getGroupNodeFieldIds,
  getCategoryConfig,
  getOrderedCategories,
  hasVisibleDraftValue,
  isValidUuid,
  normalizeGroupInstanceId,
  normalizeInputType,
  PRONTUARIO_CATEGORY_CONFIGS,
  ProntuarioCategoryCode,
  ProntuarioCategoryConfig,
  ProntuarioFieldDraft,
  TemplateGroupNode,
} from "@/app/(auth)/operacoes/[id]/detalhes/alvo/[targetId]/(utils)/record";
import { infoEntryService as infoEntryApi } from "@/services/infoEntryService";
import { hasAnyProfile } from "@/utils/userProfiles";

export type ProntuarioCustomFieldInputType = Exclude<CanonicalInputType, "GROUP">;

export interface ProntuarioCustomFieldFormState {
  label: string;
  inputType: ProntuarioCustomFieldInputType;
}

export interface ProntuarioEntryState {
  category: ProntuarioCategoryConfig;
  infoEntry: InfoEntryResponse;
  fieldValues: FieldValueResponse[];
  customFields: CustomFieldResponse[];
  drafts: Record<string, ProntuarioFieldDraft>;
}

export interface ProntuarioCategoryTabItem {
  codeName: ProntuarioCategoryCode;
  title: string;
  description: string;
  entryId: number | null;
  filledCount: number;
  totalCount: number;
}

interface PendingImageUpload {
  file: File;
  previewUrl: string;
}

const CATEGORY_SEQUENCE: ProntuarioCategoryCode[] = ["IDENTIFICACAO", "CONTEXTO_OPERACIONAL", "VINCULO_RELACIONAL"];

const EMPTY_ENTRY_STATES = (): Record<ProntuarioCategoryCode, ProntuarioEntryState | null> => ({
  IDENTIFICACAO: null,
  CONTEXTO_OPERACIONAL: null,
  VINCULO_RELACIONAL: null,
});

const LEGACY_CUSTOM_FIELD_INPUT_TYPE_MAP: Record<string, ProntuarioCustomFieldInputType> = {
  TEXTO: "TEXT",
  NUMERICO: "NUMBER",
  DATA: "DATE",
};

const normalizeCustomFieldInputType = (inputType: string): ProntuarioCustomFieldInputType => {
  const normalized = inputType.trim().toUpperCase();

  if (normalized in LEGACY_CUSTOM_FIELD_INPUT_TYPE_MAP) {
    return LEGACY_CUSTOM_FIELD_INPUT_TYPE_MAP[normalized];
  }

  if (
    normalized === "TEXT" ||
    normalized === "NUMBER" ||
    normalized === "DATE" ||
    normalized === "DROPDOWN" ||
    normalized === "INPUT"
  ) {
    return normalized;
  }

  return "TEXT";
};

const DEFAULT_CUSTOM_FIELD_FORM = (): ProntuarioCustomFieldFormState => ({
  label: "",
  inputType: "TEXT",
});

export const CUSTOM_FIELD_INPUT_TYPE_OPTIONS: Array<{ label: string; value: ProntuarioCustomFieldInputType }> = [
  { label: "Texto", value: "TEXT" },
  { label: "Número", value: "NUMBER" },
  { label: "Data", value: "DATE" },
  { label: "Lista", value: "DROPDOWN" },
  { label: "Arquivo ou link", value: "INPUT" },
];

const buildCategoryTabItem = (
  category: BaseResponseDTO,
  entryState: ProntuarioEntryState | null,
  groups: TemplateGroupNode[]
): ProntuarioCategoryTabItem => {
  const categoryGroups = buildCategoryTemplateGroups(groups, category.codeName);
  const visibleFieldIds = categoryGroups.flatMap((group) => getGroupNodeFieldIds(group));

  if (!entryState) {
    return {
      codeName: category.codeName as ProntuarioCategoryCode,
      title: category.descName,
      description: PRONTUARIO_CATEGORY_CONFIGS[category.codeName as ProntuarioCategoryCode]?.description ?? "",
      entryId: null,
      filledCount: 0,
      totalCount: 0,
    };
  }

  const templateDraftCounts = countFilledDrafts(entryState.drafts, visibleFieldIds);
  const customDrafts = Object.values(entryState.drafts).filter((draft) => draft.customFieldId != null);

  return {
    codeName: category.codeName as ProntuarioCategoryCode,
    title: category.descName,
    description: PRONTUARIO_CATEGORY_CONFIGS[category.codeName as ProntuarioCategoryCode]?.description ?? "",
    entryId: entryState.infoEntry.id,
    filledCount: templateDraftCounts.filledCount + customDrafts.filter(hasVisibleValue).length,
    totalCount: templateDraftCounts.totalCount + customDrafts.length,
  };
};

const hasVisibleValue = (draft: ProntuarioFieldDraft) => hasVisibleDraftValue(draft);

const mapCategoryCode = (codeName: string): ProntuarioCategoryCode | null => {
  if (CATEGORY_SEQUENCE.includes(codeName as ProntuarioCategoryCode)) {
    return codeName as ProntuarioCategoryCode;
  }

  return null;
};

const getErrorMessages = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
};

const normalizeSaveErrorMessage = (message: string): string => {
  const normalized = message.toLowerCase();

  if (normalized.includes("groupinstanceid") && normalized.includes("uuid")) {
    return "Dados inválidos em campos agrupados do prontuário. Recarregue a página e tente novamente.";
  }

  return message;
};

const revokeObjectUrlIfNeeded = (value: string): void => {
  if (value.startsWith("blob:")) {
    URL.revokeObjectURL(value);
  }
};

const extractSaveErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data;

    if (responseData && typeof responseData === "object") {
      const apiData = responseData as {
        message?: unknown;
        errors?: unknown;
        detail?: unknown;
        error?: unknown;
      };

      const errorMessages = getErrorMessages(apiData.errors);
      if (errorMessages.length > 0) {
        return normalizeSaveErrorMessage(errorMessages.join(" "));
      }

      if (typeof apiData.detail === "string" && apiData.detail.trim().length > 0) {
        return normalizeSaveErrorMessage(apiData.detail);
      }

      if (typeof apiData.message === "string" && apiData.message.trim().length > 0) {
        return normalizeSaveErrorMessage(apiData.message);
      }

      if (typeof apiData.error === "string" && apiData.error.trim().length > 0) {
        return normalizeSaveErrorMessage(apiData.error);
      }
    }

    if (typeof error.message === "string" && error.message.trim().length > 0) {
      return normalizeSaveErrorMessage(error.message);
    }
  }

  if (error && typeof error === "object") {
    const possibleError = error as {
      message?: unknown;
      errors?: unknown;
      detail?: unknown;
    };

    const errorMessages = getErrorMessages(possibleError.errors);
    if (errorMessages.length > 0) {
      return normalizeSaveErrorMessage(errorMessages.join(" "));
    }

    if (typeof possibleError.detail === "string" && possibleError.detail.trim().length > 0) {
      return normalizeSaveErrorMessage(possibleError.detail);
    }

    if (typeof possibleError.message === "string" && possibleError.message.trim().length > 0) {
      return normalizeSaveErrorMessage(possibleError.message);
    }
  }

  return fallbackMessage;
};

const getDraftFieldLabel = (
  draft: ProntuarioFieldDraft,
  templateLabelById: Map<number, string>,
  customLabelById: Map<number, string>
): string => {
  if (draft.templateFieldId != null) {
    return templateLabelById.get(draft.templateFieldId) ?? `Campo #${draft.templateFieldId}`;
  }

  if (draft.customFieldId != null) {
    return customLabelById.get(draft.customFieldId) ?? `Campo complementar #${draft.customFieldId}`;
  }

  return "campo desconhecido";
};

const normalizeTemplateName = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const getSelectedTemplate = (templates: TemplateResponse[], templateName: string): TemplateResponse | null => {
  const normalizedTemplateName = normalizeTemplateName(templateName);
  const matchedTemplate = templates.find(
    (template) => template.active && normalizeTemplateName(template.name) === normalizedTemplateName
  );

  return matchedTemplate ?? templates.find((template) => template.active) ?? null;
};

const buildEntryState = async (
  operationId: number,
  targetId: number,
  category: ProntuarioCategoryConfig,
  entry: InfoEntryResponse,
  templateFields: TemplateFieldResponse[],
  target: TargetResponse | null
): Promise<ProntuarioEntryState> => {
  const [fieldValuesResponse, customFieldsResponse] = await Promise.all([
    fieldValueService.findAll(operationId, targetId, entry.id),
    customFieldService.findAll(operationId, targetId, entry.id),
  ]);

  const drafts = applyTargetDraftSeeds(
    entry.id,
    templateFields,
    buildEntryDraftMap(entry.id, templateFields, fieldValuesResponse.data, customFieldsResponse.data),
    target
  );

  return {
    category,
    infoEntry: entry,
    fieldValues: fieldValuesResponse.data,
    customFields: customFieldsResponse.data,
    drafts,
  };
};

interface UseTargetProntuarioOptions {
  templateName?: string;
  sectionLabel?: string;
  allowPlanningEditing?: boolean;
}

export interface ProntuarioSection {
  category: BaseResponseDTO;
  config: ProntuarioCategoryConfig;
  entryState: ProntuarioEntryState;
  groups: TemplateGroupNode[];
}

export function useTargetProntuario(options: UseTargetProntuarioOptions = {}) {
  const { templateName = "Prontuário do Alvo", sectionLabel = "Prontuário do Alvo", allowPlanningEditing = false } = options;
  const params = useParams() as { id: string; targetId: string };
  const router = useRouter();
  const dispatch = useAppDispatch();

  const operationId = Number(params.id);
  const targetId = Number(params.targetId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [target, setTarget] = useState<TargetResponse | null>(null);
  const [template, setTemplate] = useState<TemplateResponse | null>(null);
  const [categories, setCategories] = useState<BaseResponseDTO[]>([]);
  const [templateFields, setTemplateFields] = useState<TemplateFieldResponse[]>([]);
  const [entryStates, setEntryStates] = useState<Record<ProntuarioCategoryCode, ProntuarioEntryState | null>>(EMPTY_ENTRY_STATES);
  const [pendingFieldValueDeleteIdsByEntry, setPendingFieldValueDeleteIdsByEntry] = useState<Record<number, number[]>>({});
  const [pendingImageUploadsByDraftKey, setPendingImageUploadsByDraftKey] = useState<Record<string, PendingImageUpload>>({});
  const pendingImageUploadsRef = useRef<Record<string, PendingImageUpload>>({});
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<ProntuarioCategoryCode>("IDENTIFICACAO");
  const [customFieldDialogVisible, setCustomFieldDialogVisible] = useState(false);
  const [customFieldForm, setCustomFieldForm] = useState<ProntuarioCustomFieldFormState>(DEFAULT_CUSTOM_FIELD_FORM);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const canEdit = useMemo(
    () => Boolean(currentUser && (allowPlanningEditing || !hasAnyProfile(currentUser, ["PLANNING"]))),
    [allowPlanningEditing, currentUser]
  );

  const clearPendingImageUploads = useCallback(() => {
    setPendingImageUploadsByDraftKey((current) => {
      Object.values(current).forEach(({ previewUrl }) => revokeObjectUrlIfNeeded(previewUrl));
      return {};
    });
  }, []);

  const removePendingImageUploads = useCallback((draftKeys: string[]) => {
    if (draftKeys.length === 0) {
      return;
    }

    setPendingImageUploadsByDraftKey((current) => {
      const keysToRemove = new Set(draftKeys);
      let hasChanges = false;
      const next = { ...current };

      Object.entries(current).forEach(([draftKey, upload]) => {
        if (!keysToRemove.has(draftKey)) {
          return;
        }

        hasChanges = true;
        revokeObjectUrlIfNeeded(upload.previewUrl);
        delete next[draftKey];
      });

      return hasChanges ? next : current;
    });
  }, []);

  const removePendingImageUploadsByEntry = useCallback((entryId: number) => {
    const entryKeyPrefix = `entry:${entryId}:`;

    setPendingImageUploadsByDraftKey((current) => {
      let hasChanges = false;
      const next = { ...current };

      Object.entries(current).forEach(([draftKey, upload]) => {
        if (!draftKey.startsWith(entryKeyPrefix)) {
          return;
        }

        hasChanges = true;
        revokeObjectUrlIfNeeded(upload.previewUrl);
        delete next[draftKey];
      });

      return hasChanges ? next : current;
    });
  }, []);

  useEffect(() => {
    pendingImageUploadsRef.current = pendingImageUploadsByDraftKey;
  }, [pendingImageUploadsByDraftKey]);

  useEffect(() => {
    return () => {
      Object.values(pendingImageUploadsRef.current).forEach(({ previewUrl }) => revokeObjectUrlIfNeeded(previewUrl));
    };
  }, []);

  const selectedCategoryConfig = useMemo(() => PRONTUARIO_CATEGORY_CONFIGS[selectedCategoryCode], [selectedCategoryCode]);

  const templateGroups = useMemo(() => buildCategoryTemplateGroups(buildTemplateGroups(templateFields), selectedCategoryCode), [selectedCategoryCode, templateFields]);

  const categoryTabs = useMemo<ProntuarioCategoryTabItem[]>(() => {
    const orderedCategories = getOrderedCategories(categories);
    const groupedTemplateFields = buildTemplateGroups(templateFields);

    return orderedCategories
      .map((category) => mapCategoryCode(category.codeName) ? buildCategoryTabItem(category, entryStates[category.codeName as ProntuarioCategoryCode], groupedTemplateFields) : null)
      .filter((item): item is ProntuarioCategoryTabItem => item != null);
  }, [categories, entryStates, templateFields]);

  const selectedEntryState = useMemo(() => entryStates[selectedCategoryCode], [entryStates, selectedCategoryCode]);

  const sections = useMemo<ProntuarioSection[]>(() => {
    const groupedTemplateFields = buildTemplateGroups(templateFields);
    return categories
      .map((category) => {
        const code = category.codeName as ProntuarioCategoryCode;
        const config = getCategoryConfig(category);
        const entryState = entryStates[code];

        if (!config || !entryState) {
          return null;
        }

        const groups = buildCategoryTemplateGroups(groupedTemplateFields, code);
        return { category, config, entryState, groups };
      })
      .filter((s): s is ProntuarioSection => s !== null);
  }, [categories, entryStates, templateFields]);

  const refreshEntryState = useCallback(
    async (categoryCode: ProntuarioCategoryCode, entry: InfoEntryResponse) => {
      const category = categories.find((item) => item.codeName === categoryCode);

      if (!category) {
        return null;
      }

      const config = getCategoryConfig(category);

      if (!config) {
        return null;
      }

      return buildEntryState(operationId, targetId, config, entry, templateFields, target);
    },
    [categories, operationId, target, targetId, templateFields]
  );

  const loadProntuario = useCallback(async () => {
    if (!Number.isFinite(operationId) || !Number.isFinite(targetId)) {
      clearPendingImageUploads();
      setErrorMessage("Não foi possível identificar a operação ou o alvo.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const [targetResponse, templatesResponse, categoriesResponse] = await Promise.all([
        targetService.findById(operationId, targetId),
        templateService.findAll(),
        domainInfoCategoryService.findAll(),
      ]);

      const selectedTemplate = getSelectedTemplate(templatesResponse.data, templateName);

      if (!selectedTemplate) {
        throw new Error(`Template de ${sectionLabel.toLowerCase()} não encontrado.`);
      }

      const templateFieldsResponse = await templateFieldService.findAll(selectedTemplate.id);
      const orderedCategories = getOrderedCategories(categoriesResponse.data)
        .map((category) => getCategoryConfig(category) ? category : null)
        .filter((category): category is BaseResponseDTO => category != null);

      if (orderedCategories.length === 0) {
        throw new Error(`Categorias de ${sectionLabel.toLowerCase()} não encontradas.`);
      }

      const existingEntriesResponse = await infoEntryApi.findAllByTarget(operationId, targetId);
      let currentEntries = existingEntriesResponse.data;
      const uncategorizedEntry = currentEntries.find((entry) => entry.templateId === selectedTemplate.id && entry.categoryId == null) ?? null;
      let uncategorizedUsed = false;

      const nextEntryStates = EMPTY_ENTRY_STATES();

      for (const category of orderedCategories) {
        const config = getCategoryConfig(category);

        if (!config) {
          continue;
        }

        let entry = currentEntries.find(
          (entry) => entry.templateId === selectedTemplate.id && entry.categoryId === category.id
        ) ?? null;

        if (!entry && uncategorizedEntry && !uncategorizedUsed) {
          entry = uncategorizedEntry;
          uncategorizedUsed = true;
        }

        if (!entry) {
          await infoEntryService.create(operationId, targetId, {
            templateId: selectedTemplate.id,
            categoryId: category.id,
          });

          currentEntries = (await infoEntryApi.findAllByTarget(operationId, targetId)).data;
          entry = currentEntries.find(
            (item) => item.templateId === selectedTemplate.id && item.categoryId === category.id
          ) ?? null;
        }

        if (!entry) {
          throw new Error("Não foi possível localizar o registro de informação da categoria.");
        }

        const entryState = await buildEntryState(operationId, targetId, config, entry, templateFieldsResponse.data, targetResponse.data);
        nextEntryStates[config.codeName] = entryState;
      }

      setTarget(targetResponse.data);
      setTemplate(selectedTemplate);
      setCategories(orderedCategories);
      setTemplateFields(templateFieldsResponse.data);
      setEntryStates(nextEntryStates);
      setPendingFieldValueDeleteIdsByEntry({});
      clearPendingImageUploads();

      // Escolhe a categoria padrão como a primeira que contenha grupos do template.
      const groupedTemplateFields = buildTemplateGroups(templateFieldsResponse.data);
      const preferred = orderedCategories.find((cat) => buildCategoryTemplateGroups(groupedTemplateFields, cat.codeName).length > 0);
      const defaultCategory = (preferred ?? orderedCategories[0]).codeName as ProntuarioCategoryCode;

      setSelectedCategoryCode(defaultCategory);
    } catch (loadError) {
      setErrorMessage(loadError instanceof Error ? loadError.message : `Não foi possível carregar ${sectionLabel.toLowerCase()}.`);
      setTarget(null);
      setTemplate(null);
      setCategories([]);
      setTemplateFields([]);
      setEntryStates(EMPTY_ENTRY_STATES());
      setPendingFieldValueDeleteIdsByEntry({});
      clearPendingImageUploads();
    } finally {
      setLoading(false);
    }
  }, [clearPendingImageUploads, operationId, sectionLabel, targetId, templateName]);

  useEffect(() => {
    void loadProntuario();
  }, [loadProntuario]);

  const updateEntryStateById = useCallback(
    (entryId: number, updater: (current: ProntuarioEntryState) => ProntuarioEntryState) => {
      setEntryStates((current) => {
        const next = { ...current };
        let updated = false;

        Object.entries(current).forEach(([code, state]) => {
          if (state?.infoEntry.id === entryId) {
            next[code as ProntuarioCategoryCode] = updater(state);
            updated = true;
          }
        });

        return updated ? next : current;
      });
    },
    []
  );

  const handleTemplateFieldChange = useCallback(
    (field: TemplateFieldResponse, groupInstanceId: string | null, nextValue: string, entryId: number, selectedFile?: File) => {
      if (!canEdit) {
        return;
      }

      const draftKey = buildTemplateFieldDraftKey(entryId, field.id, groupInstanceId);

      updateEntryStateById(entryId, (entryState) => {
        const currentDraft = entryState.drafts[draftKey] ?? {
          fieldValueId: null,
          templateFieldId: field.id,
          customFieldId: null,
          groupInstanceId,
          valueContent: "",
        };

        return {
          ...entryState,
          drafts: {
            ...entryState.drafts,
            [draftKey]: {
              ...currentDraft,
              valueContent: nextValue,
            },
          },
        };
      });

      const isImageInputField = normalizeInputType(field.inputType) === "INPUT";

      if (!isImageInputField || !selectedFile) {
        removePendingImageUploads([draftKey]);
        return;
      }

      setPendingImageUploadsByDraftKey((current) => {
        const existingUpload = current[draftKey];

        if (existingUpload) {
          revokeObjectUrlIfNeeded(existingUpload.previewUrl);
        }

        return {
          ...current,
          [draftKey]: {
            file: selectedFile,
            previewUrl: nextValue,
          },
        };
      });
    },
    [canEdit, removePendingImageUploads, updateEntryStateById]
  );

  const handleCustomFieldChange = useCallback(
    (customField: CustomFieldResponse, nextValue: string, entryId: number, selectedFile?: File) => {
      if (!canEdit) {
        return;
      }

      const draftKey = buildCustomFieldDraftKey(entryId, customField.id);

      updateEntryStateById(entryId, (entryState) => {
        const currentDraft = entryState.drafts[draftKey] ?? {
          fieldValueId: null,
          templateFieldId: null,
          customFieldId: customField.id,
          groupInstanceId: null,
          valueContent: "",
        };

        return {
          ...entryState,
          drafts: {
            ...entryState.drafts,
            [draftKey]: {
              ...currentDraft,
              valueContent: nextValue,
            },
          },
        };
      });

      const isImageInputField = normalizeInputType(customField.inputType) === "INPUT";

      if (!isImageInputField || !selectedFile) {
        removePendingImageUploads([draftKey]);
        return;
      }

      setPendingImageUploadsByDraftKey((current) => {
        const existingUpload = current[draftKey];

        if (existingUpload) {
          revokeObjectUrlIfNeeded(existingUpload.previewUrl);
        }

        return {
          ...current,
          [draftKey]: {
            file: selectedFile,
            previewUrl: nextValue,
          },
        };
      });
    },
    [canEdit, removePendingImageUploads, updateEntryStateById]
  );

  const handleAddGroupInstance = useCallback(
    (groupNode: TemplateGroupNode, entryId: number) => {
      if (!canEdit) {
        return;
      }

      updateEntryStateById(entryId, (entryState) => {
        const instanceId = crypto.randomUUID();

        return {
          ...entryState,
          drafts: buildEntryDraftForNewGroupInstance(entryState.infoEntry.id, groupNode, instanceId, entryState.drafts),
        };
      });
    },
    [canEdit, updateEntryStateById]
  );

  const handleRemoveGroupInstance = useCallback(
    (groupNode: TemplateGroupNode, groupInstanceId: string | null, entryId: number) => {
      if (!canEdit) {
        return;
      }

      const normalizedGroupInstanceId = normalizeGroupInstanceId(groupInstanceId);

      const removableFieldIds = new Set(getGroupNodeFieldIds(groupNode));

      updateEntryStateById(entryId, (entryState) => {
        const nextDraftEntries = Object.entries(entryState.drafts).filter(([, draft]) => {
          const draftGroupInstanceId = normalizeGroupInstanceId(draft.groupInstanceId);

          return !(
            draftGroupInstanceId === normalizedGroupInstanceId &&
            draft.templateFieldId != null &&
            removableFieldIds.has(draft.templateFieldId)
          );
        });

        const fieldValueIdsToDelete = Object.values(entryState.drafts)
          .filter((draft) => {
            const draftGroupInstanceId = normalizeGroupInstanceId(draft.groupInstanceId);
            return (
              draftGroupInstanceId === normalizedGroupInstanceId &&
              draft.templateFieldId != null &&
              removableFieldIds.has(draft.templateFieldId)
            );
          })
          .map((draft) => draft.fieldValueId)
          .filter((fieldValueId): fieldValueId is number => fieldValueId != null);

        if (fieldValueIdsToDelete.length > 0) {
          setPendingFieldValueDeleteIdsByEntry((current) => {
            const currentEntryDeletes = current[entryId] ?? [];

            return {
              ...current,
              [entryId]: Array.from(new Set([...currentEntryDeletes, ...fieldValueIdsToDelete])),
            };
          });
        }

        const draftKeysToRemove = Object.entries(entryState.drafts)
          .filter(([, draft]) => {
            const draftGroupInstanceId = normalizeGroupInstanceId(draft.groupInstanceId);
            return (
              draftGroupInstanceId === normalizedGroupInstanceId &&
              draft.templateFieldId != null &&
              removableFieldIds.has(draft.templateFieldId)
            );
          })
          .map(([draftKey]) => draftKey);

        removePendingImageUploads(draftKeysToRemove);

        return {
          ...entryState,
          drafts: Object.fromEntries(nextDraftEntries),
        };
      });
    },
    [canEdit, removePendingImageUploads, updateEntryStateById]
  );

  const handleOpenCustomFieldDialog = useCallback(() => {
    if (!canEdit) {
      return;
    }

    setCustomFieldDialogVisible(true);
  }, [canEdit]);

  const handleCloseCustomFieldDialog = useCallback(() => {
    setCustomFieldDialogVisible(false);
    setCustomFieldForm(DEFAULT_CUSTOM_FIELD_FORM());
  }, []);

  const goToOperationsDetails = useCallback(() => {
    router.push(`/operacoes/${operationId}/detalhes`);
  }, [operationId, router]);

  const reloadSelectedEntry = useCallback(async () => {
    const activeEntry = selectedEntryState;

    if (!activeEntry) {
      return;
    }

    const refreshedEntry = await refreshEntryState(selectedCategoryCode, activeEntry.infoEntry);

    if (!refreshedEntry) {
      return;
    }

    setEntryStates((current) => ({
      ...current,
      [selectedCategoryCode]: refreshedEntry,
    }));
    removePendingImageUploadsByEntry(activeEntry.infoEntry.id);
  }, [refreshEntryState, removePendingImageUploadsByEntry, selectedCategoryCode, selectedEntryState]);

  const reloadEntryById = useCallback(async (entryId: number) => {
    let categoryCode: ProntuarioCategoryCode | null = null;
    let entry: InfoEntryResponse | null = null;

    Object.entries(entryStates).forEach(([code, state]) => {
      if (state?.infoEntry.id === entryId) {
        categoryCode = code as ProntuarioCategoryCode;
        entry = state.infoEntry;
      }
    });

    if (!categoryCode || !entry) {
      return;
    }

    const refreshedEntry = await refreshEntryState(categoryCode, entry);

    if (!refreshedEntry) {
      return;
    }

    setEntryStates((current) => ({
      ...current,
      [categoryCode as ProntuarioCategoryCode]: refreshedEntry,
    }));
    removePendingImageUploadsByEntry(entryId);
  }, [entryStates, refreshEntryState, removePendingImageUploadsByEntry]);

  const handleRemoveCustomField = useCallback(async (customField: CustomFieldResponse, entryId: number) => {
    if (!canEdit) {
      return;
    }

    setSaving(true);
    try {
      await customFieldService.delete(operationId, targetId, entryId, customField.id);
      await reloadEntryById(entryId);

      dispatch(
        showToast({
          severity: "success",
          summary: "Campo removido",
          detail: "O campo complementar foi removido da seção.",
        })
      );
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha ao remover campo",
          detail: "Não foi possível remover o campo complementar.",
        })
      );
    } finally {
      setSaving(false);
    }
  }, [canEdit, dispatch, operationId, reloadEntryById, targetId]);

  const handleCreateCustomField = useCallback(async () => {
    if (!canEdit) {
      return;
    }

    // Default to selected category if not specified? 
    // Or maybe we should specify which section to add to.
    // For now, let's keep it simple and add to the first section if not selected.
    const activeEntry = selectedEntryState;

    if (!activeEntry) {
      dispatch(
        showToast({
          severity: "error",
          summary: "Seção indisponível",
          detail: "Selecione uma seção válida do prontuário.",
        })
      );
      return;
    }

    if (!customFieldForm.label.trim()) {
      dispatch(
        showToast({
          severity: "error",
          summary: "Rótulo obrigatório",
          detail: "Informe o nome do campo complementar.",
        })
      );
      return;
    }

    setSaving(true);
    try {
      await customFieldService.create(operationId, targetId, activeEntry.infoEntry.id, {
        label: customFieldForm.label.trim(),
        inputType: normalizeCustomFieldInputType(customFieldForm.inputType),
      });

      await reloadEntryById(activeEntry.infoEntry.id);

      dispatch(
        showToast({
          severity: "success",
          summary: "Campo criado",
          detail: "O campo complementar foi adicionado à seção.",
        })
      );
      handleCloseCustomFieldDialog();
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha ao criar campo",
          detail: "Não foi possível criar o campo complementar.",
        })
      );
    } finally {
      setSaving(false);
    }
  }, [canEdit, customFieldForm.inputType, customFieldForm.label, dispatch, handleCloseCustomFieldDialog, operationId, reloadEntryById, selectedEntryState, targetId]);

  const handleSaveAllCategories = useCallback(async () => {
    if (!canEdit) {
      return;
    }

    setSaving(true);
    try {
      const templateInputTypeById = new Map(
        templateFields.map((field) => [field.id, normalizeInputType(field.inputType)])
      );
      
      const allUpsertOperations: Array<Promise<unknown>> = [];
      const allDeleteOperations: Array<Promise<unknown>> = [];

      for (const state of Object.values(entryStates)) {
        if (!state) continue;

        const entryId = state.infoEntry.id;
        const customFields = state.customFields;
        const drafts = state.drafts;

        const draftEntriesToPersist = Object.entries(drafts)
          .filter(([, draft]) => draft.valueContent.trim().length > 0);

        const invalidGroupInstanceDrafts = draftEntriesToPersist
          .map(([, draft]) => draft)
          .filter((draft) => {
            const normalizedGroupInstanceId = normalizeGroupInstanceId(draft.groupInstanceId);
            return normalizedGroupInstanceId != null && !isValidUuid(normalizedGroupInstanceId);
          });

        if (invalidGroupInstanceDrafts.length > 0) {
          const templateLabelById = new Map(templateFields.map((field) => [field.id, field.label]));
          const customLabelById = new Map(customFields.map((field) => [field.id, field.label]));
          const invalidFieldLabels = Array.from(
            new Set(invalidGroupInstanceDrafts.map((draft) => getDraftFieldLabel(draft, templateLabelById, customLabelById)))
          );
          const detail = invalidFieldLabels.length > 0
            ? `Identificador inválido de agrupamento nos campos: ${invalidFieldLabels.join(", ")}. Recarregue a página e tente novamente.`
            : "Identificador inválido de agrupamento detectado. Recarregue a página e tente novamente.";

          dispatch(
            showToast({
              severity: "error",
              summary: "Falha de validação",
              detail,
            })
          );
          setSaving(false);
          return;
        }

        const customInputTypeById = new Map(
          customFields.map((field) => [field.id, normalizeInputType(field.inputType)])
        );

        draftEntriesToPersist.forEach(([draftKey, draft]) => {
          const normalizedGroupInstanceId = normalizeGroupInstanceId(draft.groupInstanceId);
          const isTemplateImageField =
            draft.templateFieldId != null &&
            templateInputTypeById.get(draft.templateFieldId) === "INPUT";
          const isCustomImageField =
            draft.customFieldId != null &&
            customInputTypeById.get(draft.customFieldId) === "INPUT";
          const isImageField = isTemplateImageField || isCustomImageField;

          if (isImageField) {
            const pendingImageUpload = pendingImageUploadsByDraftKey[draftKey];

            if (!pendingImageUpload) {
              return;
            }

            allUpsertOperations.push(
              fieldValueService.uploadMedia(operationId, targetId, entryId, {
                templateFieldId: draft.templateFieldId,
                customFieldId: draft.customFieldId,
                groupInstanceId: normalizedGroupInstanceId,
                file: pendingImageUpload.file,
              })
            );
            return;
          }

          const payload = buildDraftValuePayload(draft, templateInputTypeById, customInputTypeById);

          if (draft.fieldValueId != null) {
            allUpsertOperations.push(fieldValueService.update(operationId, targetId, entryId, draft.fieldValueId, payload));
            return;
          }

          allUpsertOperations.push(fieldValueService.create(operationId, targetId, entryId, payload));
        });

        const pendingDeleteIds = pendingFieldValueDeleteIdsByEntry[entryId] ?? [];
        pendingDeleteIds.forEach((fieldValueId) => {
          allDeleteOperations.push(fieldValueService.delete(operationId, targetId, entryId, fieldValueId));
        });
      }

      await Promise.all([...allDeleteOperations, ...allUpsertOperations]);
      
      // Cleanup
      Object.values(entryStates).forEach(state => {
        if (state) removePendingImageUploadsByEntry(state.infoEntry.id);
      });
      setPendingFieldValueDeleteIdsByEntry({});
      
      // Reload all
      await loadProntuario();

      dispatch(
        showToast({
          severity: "success",
          summary: "Prontuário salvo",
          detail: "Todos os dados do prontuário foram atualizados.",
        })
      );
    } catch (saveError) {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha ao salvar",
          detail: extractSaveErrorMessage(saveError, "Não foi possível salvar os dados do prontuário."),
        })
      );
    } finally {
      setSaving(false);
    }
  }, [canEdit, entryStates, templateFields, pendingImageUploadsByDraftKey, operationId, targetId, pendingFieldValueDeleteIdsByEntry, removePendingImageUploadsByEntry, loadProntuario, dispatch]);

  const categoryGroups = useMemo(() => {
    if (!templateFields.length) {
      return [];
    }

    return templateGroups;
  }, [templateGroups, templateFields.length]);

  const goToTargetEdit = useCallback(() => {
    router.push(`/operacoes/${operationId}/detalhes/alvo/${targetId}/editar`);
  }, [operationId, router, targetId]);

  return {
    target,
    template,
    categories,
    templateFields,
    loading,
    saving,
    errorMessage,
    selectedCategoryCode,
    selectedCategoryConfig,
    selectedEntryState,
    categoryTabs,
    categoryGroups,
    sections,
    customFieldDialogVisible,
    customFieldForm,
    goToOperationsDetails,
    goToTargetEdit,
    handleTemplateFieldChange,
    handleCustomFieldChange,
    handleAddGroupInstance,
    handleRemoveGroupInstance,
    handleOpenCustomFieldDialog,
    handleCloseCustomFieldDialog,
    handleCreateCustomField,
    handleRemoveCustomField,
    handleSaveSelectedCategory: handleSaveAllCategories,
    setSelectedCategoryCode,
    setCustomFieldForm,
    canEdit,
  };
}