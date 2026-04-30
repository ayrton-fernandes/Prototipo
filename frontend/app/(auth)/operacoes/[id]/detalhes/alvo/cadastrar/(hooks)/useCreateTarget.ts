"use client";

import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { operationService } from "@/services/operationService";
import { targetService } from "@/services/targetService";
import { shareRequestService } from "@/services/shareRequestService";
import { showToast } from "@/store/slices/toastSlice";
import { RootState } from "@/store/store";
import { useAppDispatch } from "@/store/store";
import { TargetPayload, TargetResponse } from "@/domain/types/target";
import { extractPaginatedItems } from "@/utils/pagination";
import {
  TargetFormErrors,
  TargetFormState,
  createEmptyTargetForm,
} from "@/app/(auth)/operacoes/[id]/detalhes/alvo/(types)/targetForm";
import {
  buildTargetPayload,
  validateTargetForm,
} from "@/app/(auth)/operacoes/[id]/detalhes/alvo/(utils)/targetForm";
import { hasAnyProfile } from "@/utils/userProfiles";
import { unmaskCpf } from "@/utils/formatters";

type DuplicateTargetInfo = {
  target: TargetResponse;
  operationId: number;
};

export function useCreateTarget() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const dispatch = useAppDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const operationId = Number(params.id);

  const [form, setForm] = useState<TargetFormState>(createEmptyTargetForm);
  const [errors, setErrors] = useState<TargetFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [matchAlertVisible, setMatchAlertVisible] = useState(false);
  const [matchAlertLoading, setMatchAlertLoading] = useState(false);
  const [duplicateTarget, setDuplicateTarget] = useState<DuplicateTargetInfo | null>(null);
  const [pendingPayload, setPendingPayload] = useState<TargetPayload | null>(null);
  const canEdit = Boolean(currentUser && !hasAnyProfile(currentUser, ["PLANNING"]));

  const handleChange = useCallback(<K extends keyof TargetFormState>(field: K, value: TargetFormState[K]) => {
    setForm((state) => ({ ...state, [field]: value }));
  }, []);

  const findTargetByCpfInOperation = useCallback(async (targetOperationId: number, cpf: string): Promise<TargetResponse | null> => {
    const pageSize = 100;
    let page = 0;

    while (true) {
      const response = await targetService.findAllByOperation(targetOperationId, { page, size: pageSize });
      const targets = extractPaginatedItems(response.data);
      const found = targets.find((target: TargetResponse) => unmaskCpf(target.cpf) === cpf) ?? null;

      if (found) {
        return found;
      }

      if (response.data.last === true || targets.length < pageSize) {
        return null;
      }

      page += 1;
    }
  }, []);

  const findDuplicateTarget = useCallback(
    async (cpf: string) => {
      const operationsResponse = await operationService.findAll();
      const operations = operationsResponse.data.filter((operation) => operation.id !== operationId);

      for (const operation of operations) {
        const duplicate = await findTargetByCpfInOperation(operation.id, cpf);

        if (duplicate) {
          return {
            target: duplicate,
            operationId: operation.id,
          };
        }
      }

      return null;
    },
    [findTargetByCpfInOperation, operationId]
  );

  const createTargetRecord = useCallback(
    async (payload: TargetPayload) => {
      await targetService.create(operationId, payload);

      const createdTarget = await findTargetByCpfInOperation(operationId, payload.cpf);

      if (!createdTarget) {
        throw new Error("Não foi possível localizar o alvo recém-cadastrado.");
      }

      dispatch(
        showToast({
          severity: "success",
          summary: "Alvo cadastrado",
          detail: "Prontuário aberto para preenchimento.",
        })
      );

      router.push(`/operacoes/${operationId}/detalhes/alvo/${createdTarget.id}`);
    },
    [dispatch, findTargetByCpfInOperation, operationId, router]
  );

  const continueCreateAfterMatchAlert = useCallback(
    async (sendRequest: boolean) => {
      if (!duplicateTarget || !pendingPayload) {
        return;
      }

      const nextPayload = pendingPayload;

      setMatchAlertLoading(sendRequest);
      setLoading(true);

      try {
        if (sendRequest) {
          try {
            await shareRequestService.create({ targetId: duplicateTarget.target.id });

            dispatch(
              showToast({
                severity: "success",
                summary: "Solicitação enviada",
                detail: "O cadastro continuará normalmente.",
              })
            );
          } catch {
            dispatch(
              showToast({
                severity: "error",
                summary: "Falha na solicitação",
                detail: "Não foi possível solicitar os dados do alvo existente. O cadastro seguirá normalmente.",
              })
            );
          }
        }

        setMatchAlertVisible(false);
        setDuplicateTarget(null);
        setPendingPayload(null);

        await createTargetRecord(nextPayload);
      } catch {
        dispatch(
          showToast({
            severity: "error",
            summary: "Falha no cadastro",
            detail: "Não foi possível cadastrar o alvo.",
          })
        );
      } finally {
        setLoading(false);
        setMatchAlertLoading(false);
      }
    },
    [createTargetRecord, dispatch, duplicateTarget, pendingPayload]
  );

  const handleMatchAlertHide = useCallback(() => {
    void continueCreateAfterMatchAlert(false);
  }, [continueCreateAfterMatchAlert]);

  const handleMatchAlertConfirm = useCallback(() => {
    void continueCreateAfterMatchAlert(true);
  }, [continueCreateAfterMatchAlert]);

  const submit = useCallback(async () => {
    if (!canEdit) {
      dispatch(
        showToast({
          severity: "error",
          summary: "Acesso restrito",
          detail: "Seu perfil permite apenas visualização desta operação.",
        })
      );
      return;
    }

    if (!Number.isFinite(operationId)) {
      dispatch(
        showToast({
          severity: "error",
          summary: "Operação inválida",
          detail: "Não foi possível identificar a operação atual.",
        })
      );
      return;
    }

    const nextErrors = validateTargetForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const payload = buildTargetPayload(form);
      const duplicate = await findDuplicateTarget(payload.cpf);

      if (duplicate) {
        setDuplicateTarget(duplicate);
        setPendingPayload(payload);
        setMatchAlertVisible(true);
        return;
      }

      await createTargetRecord(payload);
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha no cadastro",
          detail: "Não foi possível cadastrar o alvo.",
        })
      );
    } finally {
      setLoading(false);
    }
  }, [canEdit, createTargetRecord, dispatch, findDuplicateTarget, form, operationId]);

  return {
    form,
    errors,
    loading,
    handleChange,
    submit,
    canEdit,
    matchAlertVisible,
    matchAlertLoading,
    duplicateTarget,
    handleMatchAlertHide,
    handleMatchAlertConfirm,
  };
}
