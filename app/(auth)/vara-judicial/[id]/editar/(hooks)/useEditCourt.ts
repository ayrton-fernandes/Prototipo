"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { courtService } from "@/services/courtService";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { CourtFormErrors, CourtFormState } from "@/app/(auth)/vara-judicial/(types)/courtForm";

export function useEditCourt(courtId: number) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<CourtFormState>({
    descName: "",
  });
  const [errors, setErrors] = useState<CourtFormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [originalIsActive, setOriginalIsActive] = useState(true);
  const [selectedIsActive, setSelectedIsActive] = useState(true);

  const validate = useCallback((data: CourtFormState): CourtFormErrors => {
    const nextErrors: CourtFormErrors = {};
    if (!data.descName.trim()) nextErrors.descName = "Nome é obrigatório";
    return nextErrors;
  }, []);

  const loadCourt = useCallback(async () => {
    setLoading(true);
    try {
      const response = await courtService.findById(courtId);
      const court = response.data;

      setForm({
        descName: court.descName,
      });
      setOriginalIsActive(court.active);
      setSelectedIsActive(court.active);
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha ao carregar vara judicial",
          detail: "Não foi possível carregar os dados para edição.",
        })
      );
      router.push("/vara-judicial");
    } finally {
      setLoading(false);
    }
  }, [courtId, dispatch, router]);

  useEffect(() => {
    if (!Number.isNaN(courtId)) {
      loadCourt();
    }
  }, [loadCourt, courtId]);

  const handleChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, descName: value }));
  }, []);

  const submit = useCallback(async () => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    const hasStatusChange = selectedIsActive !== originalIsActive;
    if (hasStatusChange) setStatusLoading(true);

    try {
      await courtService.update(courtId, {
        descName: form.descName.trim(),
      });

      if (hasStatusChange) {
        if (selectedIsActive) {
          await courtService.reactivateById(courtId);
        } else {
          await courtService.deleteById(courtId);
        }
        setOriginalIsActive(selectedIsActive);
      }

      dispatch(
        showToast({
          severity: "success",
          summary: "Vara judicial atualizada",
          detail: "As alterações foram salvas com sucesso.",
        })
      );

      router.push("/vara-judicial");
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha na atualização",
          detail: "Não foi possível atualizar a vara judicial.",
        })
      );
    } finally {
      setSaving(false);
      setStatusLoading(false);
    }
  }, [courtId, dispatch, form, originalIsActive, router, selectedIsActive, validate]);

  const setCourtStatus = useCallback((nextActive: boolean) => {
    setSelectedIsActive(nextActive);
  }, []);

  return {
    form,
    errors,
    loading,
    saving,
    statusLoading,
    isActive: selectedIsActive,
    handleChange,
    submit,
    setCourtStatus,
  };
}
