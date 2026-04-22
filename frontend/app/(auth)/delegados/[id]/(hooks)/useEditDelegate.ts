"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { domainDelegateService } from "@/services/domainDelagateService";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { DelegateFormErrors, DelegateFormState } from "@/app/(auth)/delegados/(types)/delegateForm";

export function useEditDelegate(delegateId: number) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<DelegateFormState>({
    descName: "",
  });
  const [errors, setErrors] = useState<DelegateFormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [originalIsActive, setOriginalIsActive] = useState(true);
  const [selectedIsActive, setSelectedIsActive] = useState(true);

  const validate = useCallback((data: DelegateFormState): DelegateFormErrors => {
    const nextErrors: DelegateFormErrors = {};
    if (!data.descName.trim()) nextErrors.descName = "Nome é obrigatório";
    return nextErrors;
  }, []);

  const loadDelegate = useCallback(async () => {
    setLoading(true);
    try {
      const response = await domainDelegateService.findById(delegateId);
      const delegate = response.data;

      setForm({
        descName: delegate.descName,
      });
      setOriginalIsActive(delegate.active);
      setSelectedIsActive(delegate.active);
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha ao carregar delegado",
          detail: "Não foi possível carregar os dados para edição.",
        })
      );
      router.push("/delegados");
    } finally {
      setLoading(false);
    }
  }, [delegateId, dispatch, router]);

  useEffect(() => {
    if (!Number.isNaN(delegateId)) {
      loadDelegate();
    }
  }, [loadDelegate, delegateId]);

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
        await domainDelegateService.reactivateById(delegateId);
        setOriginalIsActive(true);
      }

      await domainDelegateService.update(delegateId, {
        descName: form.descName.trim(),
      });

      if (hasStatusChange && !needsReactivateBefore) {
        if (selectedIsActive) {
          await domainDelegateService.reactivateById(delegateId);
        } else {
          await domainDelegateService.deleteById(delegateId);
        }
        setOriginalIsActive(selectedIsActive);
      }

      dispatch(
        showToast({
          severity: "success",
          summary: "Delegado atualizado",
          detail: "As alterações foram salvas com sucesso.",
        })
      );

      router.push("/delegados");
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha na atualização",
          detail: "Não foi possível atualizar a delegacia.",
        })
      );
    } finally {
      setSaving(false);
      setStatusLoading(false);
    }
  }, [delegateId, dispatch, form, originalIsActive, router, selectedIsActive, validate]);

  const setDelegateStatus = useCallback((nextActive: boolean) => {
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
    setDelegateStatus,
  };
}
