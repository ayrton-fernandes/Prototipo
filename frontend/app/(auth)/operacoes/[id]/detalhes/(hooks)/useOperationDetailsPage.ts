"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useParams, useRouter } from "next/navigation";
import { showToast } from "@/store/slices/toastSlice";
import { operationService } from "@/services/operationService";
import { operationMemberService } from "@/services/operationMemberService";
import { targetService } from "@/services/targetService";
import { userService } from "@/services/userService";
import { infoEntryService } from "@/services/infoEntryService";
import { fieldValueService } from "@/services/fieldValueService";
import { templateService } from "@/services/templateService";
import { templateFieldService } from "@/services/templateFieldService";
import { extractPaginatedItems } from "@/utils/pagination";
import { OperationResponse } from "@/domain/types/operation";
import { TemplateResponse } from "@/domain/types/template";
import { TemplateFieldResponse } from "@/domain/types/templateField";
import { FieldValueResponse } from "@/domain/types/fieldValue";
import { OperationMemberPermission, OperationMemberResponse } from "@/domain/types/operationMember";
import { TargetResponse } from "@/domain/types/target";
import { DomainProfile, UserListItem } from "@/domain/types/userManagement";
import { OperationMemberRow, OperationTarget } from "@/app/(auth)/operacoes/[id]/detalhes/(types)/operationDetails";
import { domainProfileService } from "@/services/domainProfileService";
import { useAppDispatch } from "@/store/store";
import { hasAnyProfile } from "@/utils/userProfiles";

const MEMBER_PERMISSION_LABEL: Record<OperationMemberPermission, string> = {
  READER: "Leitor",
  EDITOR: "Editor",
  COORDINATOR: "Coordenador",
  PLANNING: "Planejamento"
};

const EXCLUDED_MEMBER_PROFILE_CODES = new Set([""]);

const hasExcludedMemberProfile = (user: UserListItem): boolean => {
  return user.profileCodes.some((profileCode) => EXCLUDED_MEMBER_PROFILE_CODES.has(profileCode));
};

const normalizeText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const normalizeInputType = (inputType: string): string => {
  const normalized = inputType.trim().toUpperCase();

  if (normalized === "GRUPO") {
    return "GROUP";
  }

  if (normalized === "TEXTO") {
    return "TEXT";
  }

  if (normalized === "NUMERICO") {
    return "NUMBER";
  }

  if (normalized === "DATA") {
    return "DATE";
  }

  return normalized;
};

const getRecordTemplate = (templates: TemplateResponse[]): TemplateResponse | null => {
  const targetTemplate = templates.find(
    (template) => template.active && normalizeText(template.name) === "prontuario do alvo"
  );

  return targetTemplate ?? templates.find((template) => template.active) ?? null;
};

const getRecordPhotoFieldIds = (templateFields: TemplateFieldResponse[]): Set<number> => {
  const photoGroupIds = templateFields
    .filter(
      (field) =>
        normalizeInputType(field.inputType) === "GROUP" &&
        normalizeText(field.label) === "fotos do alvo"
    )
    .map((field) => field.id);

  const photoGroupIdSet = new Set(photoGroupIds);

  const photoFieldIds = templateFields
    .filter((field) => {
      const isInputField = normalizeInputType(field.inputType) === "INPUT";

      if (!isInputField) {
        return false;
      }

      if (field.parentFieldId != null && photoGroupIdSet.has(field.parentFieldId)) {
        return true;
      }

      return normalizeText(field.label).includes("foto");
    })
    .map((field) => field.id);

  return new Set(photoFieldIds);
};

const getLatestImageValueContent = (fieldValues: FieldValueResponse[]): string | undefined => {
  const imageValues = fieldValues.filter((fieldValue) => fieldValue.valueContent.trim().length > 0);

  if (imageValues.length === 0) {
    return undefined;
  }

  imageValues.sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );

  return imageValues[0].valueContent;
};

const buildProfileDescriptionByCode = (profiles: DomainProfile[]): Record<string, string> => {
  return profiles.reduce<Record<string, string>>((acc, profile) => {
    acc[profile.codeName] = profile.descName;
    return acc;
  }, {});
};

const getMemberRoleLabel = (user: UserListItem | undefined, profileDescriptionByCode: Record<string, string>): string => {
  if (!user) {
    return "Não identificado";
  }

  if (user.profileCodes.length === 0) {
    return "Não informado";
  }

  return user.profileCodes
    .map((code) => profileDescriptionByCode[code] ?? code)
    .join(", ");
};

const buildOperationMemberRows = (
  members: OperationMemberResponse[],
  users: UserListItem[],
  profileDescriptionByCode: Record<string, string>
): OperationMemberRow[] => {
  const userById = new Map<number, UserListItem>(users.map((user) => [user.id, user]));

  return members
    .filter((member) => {
      const user = userById.get(member.userId);

      if (!user) {
        return true;
      }

      return !hasExcludedMemberProfile(user);
    })
    .map((member) => {
      const user = userById.get(member.userId);

      return {
        id: member.userId,
        name: user?.name ?? `Usuário #${member.userId}`,
        email: user?.email ?? "-",
        role: getMemberRoleLabel(user, profileDescriptionByCode),
        permission: member.permission,
        permissionLabel: MEMBER_PERMISSION_LABEL[member.permission],
        active: member.active,
      } satisfies OperationMemberRow;
    })
    .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
};

export function useOperationDetailsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const operationId = useMemo(() => {
    const parsed = Number(params.id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [params.id]);

  const [operation, setOperation] = useState<OperationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [targets, setTargets] = useState<OperationTarget[]>([]);
  const [targetsLoading, setTargetsLoading] = useState(false);

  const [members, setMembers] = useState<OperationMemberRow[]>([]);
  const [memberUsers, setMemberUsers] = useState<UserListItem[]>([]);
  const [memberProfileDescriptionByCode, setMemberProfileDescriptionByCode] = useState<Record<string, string>>({});
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersProcessing, setMembersProcessing] = useState(false);
  const [membersErrorMessage, setMembersErrorMessage] = useState<string | null>(null);

  const loadOperation = useCallback(async () => {
    if (operationId == null) {
      setErrorMessage("Operação inválida.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await operationService.findById(operationId);
      setOperation(response.data);
    } catch {
      setErrorMessage("Não foi possível carregar os detalhes da operação.");
      setOperation(null);
    } finally {
      setLoading(false);
    }
  }, [operationId]);

  const loadTargets = useCallback(async () => {
    if (operationId == null) {
      setTargets([]);
      return;
    }

    setTargetsLoading(true);
    try {
      const [targetsResponse, templatesResponse] = await Promise.all([
        targetService.findAllByOperation(operationId),
        templateService.findAll(),
      ]);

      const items = extractPaginatedItems(targetsResponse.data);
      const recordTemplate = getRecordTemplate(templatesResponse.data);
      let recordPhotoFieldIds = new Set<number>();

      if (recordTemplate) {
        const templateFieldsResponse = await templateFieldService.findAll(recordTemplate.id);
        recordPhotoFieldIds = getRecordPhotoFieldIds(templateFieldsResponse.data);
      }

      const mapped = await Promise.all(
        items.map(async (target: TargetResponse) => {
          let imageUrl: string | undefined;

          if (recordTemplate && recordPhotoFieldIds.size > 0) {
            try {
              const infoEntriesResponse = await infoEntryService.findAllByTarget(operationId, target.id);
              const recordEntries = infoEntriesResponse.data.filter(
                (entry) => entry.templateId === recordTemplate.id
              );

              const valuesByEntry = await Promise.all(
                recordEntries.map(async (entry) => {
                  const fieldValuesResponse = await fieldValueService.findAll(
                    operationId,
                    target.id,
                    entry.id
                  );

                  return fieldValuesResponse.data.filter(
                    (fieldValue) =>
                      fieldValue.templateFieldId != null &&
                      recordPhotoFieldIds.has(fieldValue.templateFieldId)
                  );
                })
              );

              imageUrl = getLatestImageValueContent(valuesByEntry.flat());
            } catch {
              imageUrl = undefined;
            }
          }

          return {
            id: target.id,
            fullName: target.fullName,
            cpf: target.cpf,
            birthDate: target.birthDate ?? "",
            imageUrl,
          } satisfies OperationTarget;
        })
      );

      setTargets(mapped);
    } catch {
      setTargets([]);
    } finally {
      setTargetsLoading(false);
    }
  }, [operationId]);

  const loadMembers = useCallback(async () => {
    if (operationId == null) {
      setMembers([]);
      setMemberUsers([]);
      setMemberProfileDescriptionByCode({});
      setMembersErrorMessage("Operação inválida.");
      return;
    }

    setMembersLoading(true);
    setMembersErrorMessage(null);

    try {
      const [membersResponse, usersResponse, profilesResponse] = await Promise.all([
        operationMemberService.findAll(operationId),
        userService.findAll(),
        domainProfileService.findAll()
      ]);

      const allowedUsers = usersResponse.data.filter((user) => !hasExcludedMemberProfile(user));

      const nextProfileMap = buildProfileDescriptionByCode(profilesResponse.data);

      setMemberUsers(allowedUsers);
      setMemberProfileDescriptionByCode(nextProfileMap);
      setMembers(buildOperationMemberRows(membersResponse.data, usersResponse.data, nextProfileMap));
    } catch {
      setMembers([]);
      setMembersErrorMessage("Não foi possível carregar os membros da operação.");
    } finally {
      setMembersLoading(false);
    }
  }, [operationId]);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const isPlanning = useMemo(() => Boolean(currentUser && hasAnyProfile(currentUser, ["PLANNING"])), [currentUser]);

  const isCurrentUserCoordinator = useMemo(() => {
    return Boolean(currentUser && hasAnyProfile(currentUser, ["COOR_INTELLIGENCE", "COORDINATOR", "ADMIN"]));
  }, [currentUser]);

  const sendToPlanning = useCallback(async () => {
    if (operationId == null) return false;
    setProcessingAction(true);
    try {
      await operationService.inPlanningById(operationId);
      dispatch(
        showToast({
          severity: "success",
          summary: "Encaminhada para planejamento",
          detail: "A operação foi encaminhada para o planejamento com sucesso.",
        })
      );
      await loadOperation();
      return true;
    } catch (err) {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha ao encaminhar",
          detail: "Não foi possível encaminhar a operação para o planejamento.",
        })
      );
      return false;
    } finally {
      setProcessingAction(false);
    }
  }, [dispatch, loadOperation, operationId]);

  const createMember = useCallback(
    async (userId: number, permission: Extract<OperationMemberPermission, "READER" | "EDITOR">) => {
      if (operationId == null) {
        return false;
      }

      setMembersProcessing(true);
      try {
        await operationMemberService.create(operationId, { userId, permission });
        await loadMembers();
        dispatch(
          showToast({
            severity: "success",
            summary: "Membro adicionado",
            detail: "O membro foi vinculado à operação com sucesso.",
          })
        );
        return true;
      } catch {
        dispatch(
          showToast({
            severity: "error",
            summary: "Falha ao adicionar membro",
            detail: "Não foi possível vincular o membro à operação.",
          })
        );
        return false;
      } finally {
        setMembersProcessing(false);
      }
    },
    [dispatch, loadMembers, operationId]
  );

  const updateMemberPermission = useCallback(
    async (userId: number, permission: Extract<OperationMemberPermission, "READER" | "EDITOR">) => {
      if (operationId == null) {
        return false;
      }

      setMembersProcessing(true);
      try {
        await operationMemberService.updatePermission(operationId, userId, { permission });
        await loadMembers();
        dispatch(
          showToast({
            severity: "success",
            summary: "Permissão atualizada",
            detail: "A permissão do membro foi atualizada.",
          })
        );
        return true;
      } catch {
        dispatch(
          showToast({
            severity: "error",
            summary: "Falha ao atualizar permissão",
            detail: "Não foi possível atualizar a permissão do membro.",
          })
        );
        return false;
      } finally {
        setMembersProcessing(false);
      }
    },
    [dispatch, loadMembers, operationId]
  );

  const deleteMember = useCallback(
    async (userId: number) => {
      if (operationId == null) {
        return false;
      }

      setMembersProcessing(true);
      try {
        await operationMemberService.delete(operationId, userId);
        await loadMembers();
        dispatch(
          showToast({
            severity: "success",
            summary: "Membro removido",
            detail: "O membro foi removido da operação.",
          })
        );
        return true;
      } catch {
        dispatch(
          showToast({
            severity: "error",
            summary: "Falha ao remover membro",
            detail: "Não foi possível remover o membro da operação.",
          })
        );
        return false;
      } finally {
        setMembersProcessing(false);
      }
    },
    [dispatch, loadMembers, operationId]
  );

  const deleteTargetById = useCallback(
    async (targetId: number) => {
      if (operationId == null) return;
      setProcessingAction(true);
      try {
        await targetService.delete(operationId, targetId);
        dispatch(
          showToast({
            severity: "success",
            summary: "Alvo removido",
            detail: "O alvo foi removido com sucesso.",
          })
        );
        await loadTargets();
      } catch {
        dispatch(
          showToast({
            severity: "error",
            summary: "Falha ao remover",
            detail: "Não foi possível remover o alvo.",
          })
        );
      } finally {
        setProcessingAction(false);
      }
    },
    [dispatch, loadTargets, operationId]
  );

  useEffect(() => {
    void loadOperation();
  }, [loadOperation]);

  useEffect(() => {
    void loadTargets();
  }, [loadTargets]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const goToOperationsList = () => {
    router.push("/operacoes");
  };

  const editOperation = () => {
    if (!operation) {
      return;
    }

    router.push(`/operacoes?edit=${operation.id}`);
  };

  const toggleOperationStatus = async () => {
    if (!operation) {
      return;
    }

    setProcessingAction(true);
    try {
      if (operation.active) {
        await operationService.deleteById(operation.id);
        dispatch(
          showToast({
            severity: "success",
            summary: "ORQ inativada",
            detail: "A operação foi inativada com sucesso.",
          })
        );
      } else {
        await operationService.reactivateById(operation.id);
        dispatch(
          showToast({
            severity: "success",
            summary: "ORQ reativada",
            detail: "A operação foi reativada com sucesso.",
          })
        );
      }

      await loadOperation();
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: operation.active ? "Falha ao inativar" : "Falha ao reativar",
          detail: operation.active
            ? "Não foi possível inativar a ORQ."
            : "Não foi possível reativar a ORQ.",
        })
      );
    } finally {
      setProcessingAction(false);
    }
  };

  return {
    operation,
    loading,
    processingAction,
    errorMessage,
    targets,
    targetsLoading,
    members,
    memberUsers,
    memberProfileDescriptionByCode,
    membersLoading,
    membersProcessing,
    membersErrorMessage,
    goToOperationsList,
    editOperation,
    toggleOperationStatus,
    createMember,
    updateMemberPermission,
    deleteMember,
    reloadMembers: loadMembers,
    reload: loadOperation,
    reloadTargets: loadTargets,
    deleteTarget: deleteTargetById,
    isCurrentUserCoordinator,
    isPlanning,
    sendToPlanning,
  };
}
