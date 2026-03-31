"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { directorateService } from "@/services/directorateService";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { DirectorateFormErrors, DirectorateFormState } from "@/app/(auth)/diretorias/(types)/directorateForm";

export function useEditDirectorate(directorateId: number) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<DirectorateFormState>({
    descName: "",
  });
  const [errors, setErrors] = useState<DirectorateFormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [originalIsActive, setOriginalIsActive] = useState(true);
  const [selectedIsActive, setSelectedIsActive] = useState(true);

  const validate = useCallback((data: DirectorateFormState): DirectorateFormErrors => {
    const nextErrors: DirectorateFormErrors = {};
    if (!data.descName.trim()) nextErrors.descName = "Nome é obrigatório";
    return nextErrors;
  }, []);

  const loadDirectorate = useCallback(async () => {
    setLoading(true);
    try {
      const response = await directorateService.findById(directorateId);
      const directorate = response.data;

      setForm({
        descName: directorate.descName,
      });
      setOriginalIsActive(directorate.active);
      setSelectedIsActive(directorate.active);
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha ao carregar diretoria",
          detail: "Não foi possível carregar os dados para edição.",
        })
      );
      router.push("/diretorias");
    } finally {
      setLoading(false);
    }
  }, [directorateId, dispatch, router]);

  useEffect(() => {
    if (!Number.isNaN(directorateId)) {
      loadDirectorate();
    }
  }, [loadDirectorate, directorateId]);

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
      const needsReactivateBefore = !originalIsActive && selectedIsActive;

      if (needsReactivateBefore) {
        await directorateService.reactivateById(directorateId);
        setOriginalIsActive(true);
      }

      await directorateService.update(directorateId, {
        descName: form.descName.trim(),
      });

      if (hasStatusChange && !needsReactivateBefore) {
        if (selectedIsActive) {
          await directorateService.reactivateById(directorateId);
        } else {
          await directorateService.deleteById(directorateId);
        }
        setOriginalIsActive(selectedIsActive);
      }

      dispatch(
        showToast({
          severity: "success",
          summary: "Diretoria atualizada",
          detail: "As alterações foram salvas com sucesso.",
        })
      );

      router.push("/diretorias");
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha na atualização",
          detail: "Não foi possível atualizar a diretoria.",
        })
      );
    } finally {
      setSaving(false);
      setStatusLoading(false);
    }
  }, [directorateId, dispatch, form, originalIsActive, router, selectedIsActive, validate]);

  const setDirectorateStatus = useCallback((nextActive: boolean) => {
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
    setDirectorateStatus,
  };
}
