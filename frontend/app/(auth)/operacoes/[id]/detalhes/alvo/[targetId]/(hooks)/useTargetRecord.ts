"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { showToast } from "@/store/slices/toastSlice";
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
  getCategoryConfig,
  getOrderedCategories,
  hasVisibleDraftValue,
  isValidUuid,
  normalizeGroupInstanceId,
  PRONTUARIO_CATEGORY_CONFIGS,
  ProntuarioCategoryCode,
  ProntuarioCategoryConfig,
  ProntuarioFieldDraft,
  TemplateGroupNode,
} from "@/app/(auth)/operacoes/[id]/detalhes/alvo/[targetId]/(utils)/record";
import { infoEntryService as infoEntryApi } from "@/services/infoEntryService";

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
  const visibleFieldIds = categoryGroups.flatMap((group) => group.children.map((field) => field.id));

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

const getSelectedTemplate = (templates: TemplateResponse[]): TemplateResponse | null => {
  const prontuarioTemplate = templates.find((template) => template.active && template.name.toLowerCase() === "prontuário do alvo");

  return prontuarioTemplate ?? templates.find((template) => template.active) ?? null;
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

export function useTargetProntuario() {
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
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<ProntuarioCategoryCode>("IDENTIFICACAO");
  const [customFieldDialogVisible, setCustomFieldDialogVisible] = useState(false);
  const [customFieldForm, setCustomFieldForm] = useState<ProntuarioCustomFieldFormState>(DEFAULT_CUSTOM_FIELD_FORM);

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

      const selectedTemplate = getSelectedTemplate(templatesResponse.data);

      if (!selectedTemplate) {
        throw new Error("Template do prontuário não encontrado.");
      }

      const templateFieldsResponse = await templateFieldService.findAll(selectedTemplate.id);
      const orderedCategories = getOrderedCategories(categoriesResponse.data)
        .map((category) => getCategoryConfig(category) ? category : null)
        .filter((category): category is BaseResponseDTO => category != null);

      if (orderedCategories.length === 0) {
        throw new Error("Categorias do prontuário não encontradas.");
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
      setSelectedCategoryCode((current) => (nextEntryStates[current] ? current : orderedCategories[0].codeName as ProntuarioCategoryCode));
    } catch (loadError) {
      setErrorMessage(loadError instanceof Error ? loadError.message : "Não foi possível carregar o prontuário do alvo.");
      setTarget(null);
      setTemplate(null);
      setCategories([]);
      setTemplateFields([]);
      setEntryStates(EMPTY_ENTRY_STATES());
      setPendingFieldValueDeleteIdsByEntry({});
    } finally {
      setLoading(false);
    }
  }, [operationId, targetId]);

  useEffect(() => {
    void loadProntuario();
  }, [loadProntuario]);

  const updateSelectedEntryState = useCallback(
    (updater: (current: ProntuarioEntryState) => ProntuarioEntryState) => {
      setEntryStates((current) => {
        const activeEntry = current[selectedCategoryCode];

        if (!activeEntry) {
          return current;
        }

        return {
          ...current,
          [selectedCategoryCode]: updater(activeEntry),
        };
      });
    },
    [selectedCategoryCode]
  );

  const handleTemplateFieldChange = useCallback(
    (field: TemplateFieldResponse, groupInstanceId: string | null, nextValue: string) => {
      updateSelectedEntryState((entryState) => {
        const draftKey = buildTemplateFieldDraftKey(entryState.infoEntry.id, field.id, groupInstanceId);
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
    },
    [updateSelectedEntryState]
  );

  const handleCustomFieldChange = useCallback(
    (customField: CustomFieldResponse, nextValue: string) => {
      updateSelectedEntryState((entryState) => {
        const draftKey = buildCustomFieldDraftKey(entryState.infoEntry.id, customField.id);
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
    },
    [updateSelectedEntryState]
  );

  const handleAddGroupInstance = useCallback(
    (groupNode: TemplateGroupNode) => {
      updateSelectedEntryState((entryState) => {
        const instanceId = crypto.randomUUID();

        return {
          ...entryState,
          drafts: buildEntryDraftForNewGroupInstance(entryState.infoEntry.id, groupNode, instanceId, entryState.drafts),
        };
      });
    },
    [updateSelectedEntryState]
  );

  const handleRemoveGroupInstance = useCallback(
    (groupNode: TemplateGroupNode, groupInstanceId: string | null) => {
      const activeEntry = selectedEntryState;
      const normalizedGroupInstanceId = normalizeGroupInstanceId(groupInstanceId);

      if (!activeEntry) {
        return;
      }

      const removableFieldIds = new Set(groupNode.children.map((field) => field.id));
      const fieldValueIdsToDelete = Object.values(activeEntry.drafts)
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

      updateSelectedEntryState((entryState) => {
        const nextDraftEntries = Object.entries(entryState.drafts).filter(([, draft]) => {
          const draftGroupInstanceId = normalizeGroupInstanceId(draft.groupInstanceId);

          return !(
            draftGroupInstanceId === normalizedGroupInstanceId &&
            draft.templateFieldId != null &&
            removableFieldIds.has(draft.templateFieldId)
          );
        });

        return {
          ...entryState,
          drafts: Object.fromEntries(nextDraftEntries),
        };
      });

      if (fieldValueIdsToDelete.length > 0) {
        setPendingFieldValueDeleteIdsByEntry((current) => {
          const currentEntryDeletes = current[activeEntry.infoEntry.id] ?? [];

          return {
            ...current,
            [activeEntry.infoEntry.id]: Array.from(new Set([...currentEntryDeletes, ...fieldValueIdsToDelete])),
          };
        });
      }
    },
    [selectedEntryState, updateSelectedEntryState]
  );

  const handleOpenCustomFieldDialog = useCallback(() => {
    setCustomFieldDialogVisible(true);
  }, []);

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
  }, [refreshEntryState, selectedCategoryCode, selectedEntryState]);

  const handleRemoveCustomField = useCallback(async (customField: CustomFieldResponse) => {
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

    setSaving(true);
    try {
      await customFieldService.delete(operationId, targetId, activeEntry.infoEntry.id, customField.id);
      await reloadSelectedEntry();

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
  }, [dispatch, operationId, reloadSelectedEntry, selectedEntryState, targetId]);

  const handleCreateCustomField = useCallback(async () => {
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

      await reloadSelectedEntry();

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
  }, [customFieldForm.inputType, customFieldForm.label, dispatch, handleCloseCustomFieldDialog, operationId, reloadSelectedEntry, selectedEntryState, targetId]);

  const handleSaveSelectedCategory = useCallback(async () => {
    const activeEntry = selectedEntryState;

    if (!activeEntry) {
      return;
    }

    const draftsToPersist = Object.values(activeEntry.drafts).filter((draft) => draft.valueContent.trim().length > 0);
    const invalidGroupInstanceDrafts = draftsToPersist.filter((draft) => {
      const normalizedGroupInstanceId = normalizeGroupInstanceId(draft.groupInstanceId);
      return normalizedGroupInstanceId != null && !isValidUuid(normalizedGroupInstanceId);
    });

    if (invalidGroupInstanceDrafts.length > 0) {
      const templateLabelById = new Map(templateFields.map((field) => [field.id, field.label]));
      const customLabelById = new Map(activeEntry.customFields.map((field) => [field.id, field.label]));
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
      return;
    }

    const pendingDeleteIds = pendingFieldValueDeleteIdsByEntry[activeEntry.infoEntry.id] ?? [];

    setSaving(true);
    try {
      const upsertOperations = draftsToPersist
        .map(async (draft) => {
          const payload = buildDraftValuePayload(draft);

          if (draft.fieldValueId != null) {
            return fieldValueService.update(operationId, targetId, activeEntry.infoEntry.id, draft.fieldValueId, payload);
          }

          return fieldValueService.create(operationId, targetId, activeEntry.infoEntry.id, payload);
        });

      const deleteOperations = pendingDeleteIds.map((fieldValueId) =>
        fieldValueService.delete(operationId, targetId, activeEntry.infoEntry.id, fieldValueId)
      );

      await Promise.all([...deleteOperations, ...upsertOperations]);
      setPendingFieldValueDeleteIdsByEntry((current) => {
        if (!(activeEntry.infoEntry.id in current)) {
          return current;
        }

        const next = { ...current };
        delete next[activeEntry.infoEntry.id];
        return next;
      });
      await reloadSelectedEntry();

      dispatch(
        showToast({
          severity: "success",
          summary: "Prontuário salvo",
          detail: "Os dados da seção foram atualizados.",
        })
      );
      goToOperationsDetails();
    } catch (saveError) {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha ao salvar",
          detail: extractSaveErrorMessage(saveError, "Não foi possível salvar os dados da seção."),
        })
      );
    } finally {
      setSaving(false);
    }
  }, [dispatch, goToOperationsDetails, operationId, pendingFieldValueDeleteIdsByEntry, reloadSelectedEntry, selectedEntryState, targetId, templateFields]);

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
    handleSaveSelectedCategory,
    setSelectedCategoryCode,
    setCustomFieldForm,
  };
}