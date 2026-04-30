"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { operationService } from "@/services/operationService";
import { domainCourtService } from "@/services/domainCourtService";
import { domainDepartmentService } from "@/services/domainDepartmentService";
import { domainDelegateService } from "@/services/domainDelagateService";
import { domainDirectorateService } from "@/services/domainDirectorateService";
import { domainStationService } from "@/services/domainStationService";
import { userService } from "@/services/userService";
import { OperationResponse, OperationPayload } from "@/domain/types/operation";
import { UserListItem } from "@/domain/types/userManagement";
import { hasAnyProfile } from "@/utils/userProfiles";
import {
  emptyOperationFormState,
  OperationDropdownOption,
  OperationFormErrors,
  OperationFormState,
  OperationOptionGroups,
} from "@/app/(auth)/operacoes/(types)/operationForm";

const PAGE_SIZE = 6;

const buildDropdownOptions = (items: Array<{ id: number; descName: string }>): OperationDropdownOption[] => {
  return items.map((item) => ({
    label: item.descName,
    value: item.id,
  }));
};

const isAnalystUser = (user: UserListItem) => hasAnyProfile(user, ["INTELLIGENCE"]);

const isInvestigatorUser = (user: UserListItem) => hasAnyProfile(user, ["INVESTIGATION"]);

const isPlanningUser = (user: UserListItem) => hasAnyProfile(user, ["PLANNING"]);

const isCoordinatorUser = (user: UserListItem) => hasAnyProfile(user, ["COOR_INTELLIGENCE", "COORDINATOR", "ADMIN"]);

const initialOptionGroups: OperationOptionGroups = {
  departments: [],
  delegates: [],
  directorates: [],
  stations: [],
  courts: [],
  analystUsers: [],
  investigatorUsers: [],
  plannings: [],
  planningUsers: [],
};

const mapOperationToForm = (operation: OperationResponse): OperationFormState => ({
  name: operation.name ?? "",
  description: operation.description ?? "",
  departmentId: operation.department?.id ?? null,
  delegateId: operation.delegate?.id ?? null,
  directorateId: operation.directorate?.id ?? null,
  stationId: operation.station?.id ?? null,
  courtId: operation.court?.id ?? null,
  analystIntelligenceId: operation.analystIntelligence?.id ?? null,
  investigatorId: operation.investigator?.id ?? null,
  operationPlanningId: operation.operationPlanning?.id ?? null,
  planningMemberId: null,
});

const mapFormToPayload = (form: OperationFormState): OperationPayload => ({
  descName: form.name.trim(),
  description: form.description.trim(),
  departmentId: form.departmentId,
  delegateId: form.delegateId,
  directorateId: form.directorateId,
  stationId: form.stationId,
  courtId: form.courtId,
  analystIntelligenceId: form.analystIntelligenceId,
  investigatorId: form.investigatorId,
  // backend expects operationPlanningId — if we only have a planning user selected,
  // send that id as operationPlanningId so the server receives the planner reference.
  operationPlanningId: form.operationPlanningId ?? form.planningMemberId,
  planningMemberId: form.planningMemberId,
});

const validateForm = (form: OperationFormState): OperationFormErrors => {
  const nextErrors: OperationFormErrors = {};

  if (!form.name.trim()) {
    nextErrors.name = "Informe o nome da operação.";
  }

  if (!form.departmentId) nextErrors.departmentId = "Selecione o departamento.";
  if (!form.delegateId) nextErrors.delegateId = "Selecione o delegado.";
  if (!form.directorateId) nextErrors.directorateId = "Selecione a diretoria.";
  if (!form.stationId) nextErrors.stationId = "Selecione a delegacia.";
  if (!form.courtId) nextErrors.courtId = "Selecione a vara judicial.";
  if (!form.analystIntelligenceId) nextErrors.analystIntelligenceId = "Selecione o analista.";
  if (!form.investigatorId) nextErrors.investigatorId = "Selecione o investigador.";
  if (!form.planningMemberId) nextErrors.planningMemberId = "Selecione o planejador.";

  return nextErrors;
};

export function useOperationsPage(initialEditOperationId: number | null = null) {
  const dispatch = useAppDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [operations, setOperations] = useState<OperationResponse[]>([]);
  const [operationLoading, setOperationLoading] = useState(true);
  const [optionLoading, setOptionLoading] = useState(true);
  const [optionGroups, setOptionGroups] = useState<OperationOptionGroups>(initialOptionGroups);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingOperation, setEditingOperation] = useState<OperationResponse | null>(null);
  const [form, setForm] = useState<OperationFormState>(emptyOperationFormState());
  const [errors, setErrors] = useState<OperationFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OperationResponse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [handledInitialEditId, setHandledInitialEditId] = useState<number | null>(null);

  const isPlanning = useMemo(() => Boolean(currentUser && hasAnyProfile(currentUser, ["PLANNING"])), [currentUser]);
  const isCoordinator = useMemo(() => Boolean(currentUser && hasAnyProfile(currentUser, ["COOR_INTELLIGENCE", "COORDINATOR", "ADMIN"])), [currentUser]);

  const fetchOperations = useCallback(async () => {
    setOperationLoading(true);
    try {
      const response = await operationService.findAll();
      // Exibe apenas operações ativas (soft-deleted não devem aparecer)
      setOperations((current) => {
        const sharedAtById = new Map(current.map((operation) => [operation.id, operation.sharedAt ?? null]));

        return response.data
          .filter((op) => op.active)
          .map((op) => ({
            ...op,
            sharedAt: op.sharedAt ?? sharedAtById.get(op.id) ?? null,
          }));
      });
    } finally {
      setOperationLoading(false);
    }
  }, []);

  const sendToPlanning = useCallback(async (operationId: number) => {
    setSubmitting(true);
    try {
      await operationService.inPlanningById(operationId);
      setOperations((current) =>
        current.map((operation) =>
          operation.id === operationId
            ? {
                ...operation,
                sharedAt: operation.sharedAt ?? new Date().toISOString(),
              }
            : operation
        )
      );
      dispatch(
        showToast({
          severity: "success",
          summary: "Encaminhada para planejamento",
          detail: "A operação foi encaminhada para o planejamento com sucesso.",
        })
      );
      await fetchOperations();
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha ao encaminhar",
          detail: "Não foi possível encaminhar a operação para o planejamento.",
        })
      );
    } finally {
      setSubmitting(false);
    }
  }, [dispatch, fetchOperations]);

  const fetchOptionGroups = useCallback(async () => {
    setOptionLoading(true);
    try {
      const [
        departmentsResponse,
        delegatesResponse,
        directoratesResponse,
        stationsResponse,
        courtsResponse,
        usersResponse,
      ] = await Promise.all([
        domainDepartmentService.findAll(),
        domainDelegateService.findAll(),
        domainDirectorateService.findAll(),
        domainStationService.findAll(),
        domainCourtService.findAll(),
        userService.findAll(),
      ]);


      const users = usersResponse.data as UserListItem[];

      setOptionGroups({
        departments: buildDropdownOptions(departmentsResponse.data),
        delegates: buildDropdownOptions(delegatesResponse.data),
        directorates: buildDropdownOptions(directoratesResponse.data),
        stations: buildDropdownOptions(stationsResponse.data),
        courts: buildDropdownOptions(courtsResponse.data),
        analystUsers: users.filter((user: UserListItem) => isAnalystUser(user)).map((user: UserListItem) => ({
          label: user.name,
          value: user.id,
        })),
        investigatorUsers: users.filter((user: UserListItem) => isInvestigatorUser(user)).map((user: UserListItem) => ({
          label: user.name,
          value: user.id,
        })),
        plannings: users.filter((user: UserListItem) => isPlanningUser(user)).map((user: UserListItem) => ({
          label: user.name,
          value: user.id,
        })),
        planningUsers: users.filter((user: UserListItem) => isPlanningUser(user)).map((user: UserListItem) => ({
          label: user.name,
          value: user.id,
        })),
      });
    } finally {
      setOptionLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOperations();
    void fetchOptionGroups();
  }, [fetchOperations, fetchOptionGroups]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredOperations = useMemo(() => {
    const term = search.trim().toLowerCase();

    const planningOperations = isPlanning
      ? operations.filter((operation) => operation.status?.codeName === "IN_PLANNING")
      : operations;

    let result = planningOperations;

    if (!term) {
      return result;
    }

    return result.filter((operation) => {
      return [
        operation.name,
        operation.operationCode,
        operation.department?.descName,
        operation.delegate?.descName,
        operation.directorate?.descName,
        operation.station?.descName,
        operation.court?.descName,
      ]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [isPlanning, operations, search]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredOperations.length / PAGE_SIZE)), [filteredOperations.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visibleOperations = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredOperations.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredOperations]);

  const openCreateDialog = () => {
    setEditingOperation(null);
    setErrors({});
    setForm(emptyOperationFormState());
    setDialogVisible(true);
  };

  const openEditDialog = (operation: OperationResponse) => {
    setEditingOperation(operation);
    setErrors({});
    setForm(mapOperationToForm(operation));
    setDialogVisible(true);
  };

  useEffect(() => {
    if (initialEditOperationId == null) {
      return;
    }

    if (handledInitialEditId === initialEditOperationId) {
      return;
    }

    if (operationLoading || dialogVisible) {
      return;
    }

    const operation = operations.find((item) => item.id === initialEditOperationId);

    if (!operation) {
      setHandledInitialEditId(initialEditOperationId);
      return;
    }

    openEditDialog(operation);
    setHandledInitialEditId(initialEditOperationId);
  }, [initialEditOperationId, handledInitialEditId, operationLoading, dialogVisible, operations]);

  const resetDialogState = () => {
    setDialogVisible(false);
    setEditingOperation(null);
    setErrors({});
    setForm(emptyOperationFormState());
  };

  const closeDialog = () => {
    if (submitting) return;
    resetDialogState();
  };

  const updateField = <K extends keyof OperationFormState>(field: K, value: OperationFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitDialog = async () => {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload = mapFormToPayload(form);
    setSubmitting(true);

    try {
      if (editingOperation) {
        await operationService.update(editingOperation.id, payload);
        dispatch(
          showToast({
            severity: "success",
            summary: "ORQ atualizada",
            detail: "A operação foi atualizada com sucesso.",
          })
        );
      } else {
        await operationService.create(payload);
        dispatch(
          showToast({
            severity: "success",
            summary: "ORQ criada",
            detail: "A operação foi criada com sucesso.",
          })
        );
      }

      resetDialogState();
      await fetchOperations();
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: editingOperation ? "Falha ao atualizar" : "Falha ao criar",
          detail: editingOperation
            ? "Não foi possível atualizar a ORQ."
            : "Não foi possível criar a ORQ.",
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  const requestDelete = (operation: OperationResponse) => {
    setDeleteTarget(operation);
  };

  const closeDeleteDialog = () => {
    if (deleteLoading) return;
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      await operationService.deleteById(deleteTarget.id);
      dispatch(
        showToast({
          severity: "success",
          summary: "ORQ inativada",
          detail: "A operação foi inativada com sucesso.",
        })
      );
      setDeleteTarget(null);
      await fetchOperations();
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha ao inativar",
          detail: "Não foi possível inativar a ORQ.",
        })
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const reactivateOperation = async (operation: OperationResponse) => {
    setSubmitting(true);
    try {
      await operationService.reactivateById(operation.id);
      dispatch(
        showToast({
          severity: "success",
          summary: "ORQ reativada",
          detail: "A operação foi reativada com sucesso.",
        })
      );
      await fetchOperations();
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha ao reativar",
          detail: "Não foi possível reativar a ORQ.",
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  return {
    operationLoading,
    optionLoading,
    optionGroups,
    search,
    setSearch,
    visibleOperations,
    currentPage,
    totalPages,
    dialogVisible,
    editingOperation,
    form,
    errors,
    submitting,
    deleteTarget,
    deleteLoading,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    updateField,
    submitDialog,
    setCurrentPage,
    requestDelete,
    closeDeleteDialog,
    confirmDelete,
    reactivateOperation,
    refreshOperations: fetchOperations,
    sendToPlanning,
    isPlanning,
    isCoordinator,
  };
}