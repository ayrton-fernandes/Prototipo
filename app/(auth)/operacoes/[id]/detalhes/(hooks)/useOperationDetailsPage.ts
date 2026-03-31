"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { operationService } from "@/services/operationService";
import { OperationResponse, OperationUserReference } from "@/domain/types/operation";
import { OperationMemberRow, OperationTarget } from "@/app/(auth)/operacoes/[id]/detalhes/(types)/operationDetails";

const PHONE_PLACEHOLDER = "-";

type MemberRole = "Analista de Inteligência" | "Investigador";

interface MemberSource {
  user: OperationUserReference;
  role: MemberRole;
}

const buildMembersFromOperation = (operation: OperationResponse | null): OperationMemberRow[] => {
  if (!operation) {
    return [];
  }

  const sources: MemberSource[] = [];

  if (operation.analystIntelligence) {
    sources.push({
      user: operation.analystIntelligence,
      role: "Analista de Inteligência",
    });
  }

  if (operation.investigator) {
    sources.push({
      user: operation.investigator,
      role: "Investigador",
    });
  }

  const memberById = new Map<number, OperationMemberRow>();

  sources.forEach(({ user, role }) => {
    const currentMember = memberById.get(user.id);

    if (!currentMember) {
      memberById.set(user.id, {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        phone: PHONE_PLACEHOLDER,
        active: user.active,
      });
      return;
    }

    const hasRole = currentMember.role.split(" / ").includes(role);
    if (!hasRole) {
      currentMember.role = `${currentMember.role} / ${role}`;
    }
  });

  return Array.from(memberById.values());
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

  // Estrutura prevista para integração futura do endpoint de alvos.
  const [targets] = useState<OperationTarget[]>([]);

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

  useEffect(() => {
    void loadOperation();
  }, [loadOperation]);

  const members = useMemo(() => buildMembersFromOperation(operation), [operation]);

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
    members,
    goToOperationsList,
    editOperation,
    toggleOperationStatus,
    reload: loadOperation,
  };
}
