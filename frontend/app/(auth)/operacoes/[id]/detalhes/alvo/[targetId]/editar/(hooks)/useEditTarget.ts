"use client";

import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { targetService } from "@/services/targetService";
import { showToast } from "@/store/slices/toastSlice";
import { RootState } from "@/store/store";
import { useAppDispatch } from "@/store/store";
import {
  TargetFormErrors,
  TargetFormState,
  createEmptyTargetForm,
} from "@/app/(auth)/operacoes/[id]/detalhes/alvo/(types)/targetForm";
import {
  buildTargetPayload,
  normalizeTargetResponseToForm,
  validateTargetForm,
} from "@/app/(auth)/operacoes/[id]/detalhes/alvo/(utils)/targetForm";
import { hasAnyProfile } from "@/utils/userProfiles";

export function useEditTarget() {
  const params = useParams() as { id: string; targetId: string };
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const operationId = Number(params.id);
  const targetId = Number(params.targetId);

  const [form, setForm] = useState<TargetFormState>(createEmptyTargetForm);
  const [errors, setErrors] = useState<TargetFormErrors>({});
  const [loading, setLoading] = useState(false);
  const canEdit = Boolean(currentUser && !hasAnyProfile(currentUser, ["PLANNING"]));

  const load = useCallback(async () => {
    if (!operationId || !targetId) return;
    setLoading(true);
    try {
      const resp = await targetService.findById(operationId, targetId);
      setForm(normalizeTargetResponseToForm(resp.data));
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha",
          detail: "Não foi possível carregar o alvo.",
        })
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, operationId, targetId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleChange = useCallback(<K extends keyof TargetFormState>(field: K, value: TargetFormState[K]) => {
    setForm((state) => ({ ...state, [field]: value }));
  }, []);

  const submit = useCallback(async () => {
    if (!canEdit) {
      dispatch(
        showToast({
          severity: "error",
          summary: "Acesso restrito",
          detail: "Seu perfil permite apenas visualização deste alvo.",
        })
      );
      return;
    }

    if (!Number.isFinite(operationId) || !Number.isFinite(targetId)) {
      dispatch(
        showToast({
          severity: "error",
          summary: "Dados inválidos",
          detail: "Não foi possível identificar o alvo para edição.",
        })
      );
      return;
    }

    const nextErrors = validateTargetForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await targetService.update(operationId, targetId, buildTargetPayload(form));

      dispatch(
        showToast({
          severity: "success",
          summary: "Alvo atualizado",
          detail: "Alvo atualizado com sucesso",
        })
      );

      router.push(`/operacoes/${operationId}/detalhes`);
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha",
          detail: "Não foi possível atualizar o alvo",
        })
      );
    } finally {
      setLoading(false);
    }
  }, [canEdit, dispatch, form, operationId, router, targetId]);

  return { form, errors, loading, handleChange, submit, canEdit };
}
