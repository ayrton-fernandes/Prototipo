"use client";

import { useCallback, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { targetService } from "@/services/targetService";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { TargetResponse } from "@/domain/types/target";
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

export function useCreateTarget() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const dispatch = useAppDispatch();

  const operationId = Number(params.id);

  const [form, setForm] = useState<TargetFormState>(createEmptyTargetForm);
  const [errors, setErrors] = useState<TargetFormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(<K extends keyof TargetFormState>(field: K, value: TargetFormState[K]) => {
    setForm((state) => ({ ...state, [field]: value }));
  }, []);

  const submit = useCallback(async () => {
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
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const payload = buildTargetPayload(form);
      await targetService.create(operationId, payload);

      const response = await targetService.findAllByOperation(operationId);
      const targets = extractPaginatedItems(response.data);
      const createdTarget = targets.find((target: TargetResponse) => target.cpf === payload.cpf);

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
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha no cadastro",
          detail: "Não foi possível cadastrar o alvo",
        })
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, form, operationId, router]);

  return { form, errors, loading, handleChange, submit };
}
