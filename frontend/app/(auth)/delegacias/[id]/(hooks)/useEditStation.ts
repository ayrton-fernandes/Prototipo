"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { domainStationService } from "@/services/domainStationService";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { StationFormErrors, StationFormState } from "@/app/(auth)/delegacias/(types)/stationForm";

export function useEditStation(stationId: number) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<StationFormState>({
    descName: "",
  });
  const [errors, setErrors] = useState<StationFormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [originalIsActive, setOriginalIsActive] = useState(true);
  const [selectedIsActive, setSelectedIsActive] = useState(true);

  const validate = useCallback((data: StationFormState): StationFormErrors => {
    const nextErrors: StationFormErrors = {};
    if (!data.descName.trim()) nextErrors.descName = "Nome é obrigatório";
    return nextErrors;
  }, []);

  const loadStation = useCallback(async () => {
    setLoading(true);
    try {
      const response = await domainStationService.findById(stationId);
      const station = response.data;

      setForm({
        descName: station.descName,
      });
      setOriginalIsActive(station.active);
      setSelectedIsActive(station.active);
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha ao carregar delegacia",
          detail: "Não foi possível carregar os dados para edição.",
        })
      );
      router.push("/delegacias");
    } finally {
      setLoading(false);
    }
  }, [stationId, dispatch, router]);

  useEffect(() => {
    if (!Number.isNaN(stationId)) {
      loadStation();
    }
  }, [loadStation, stationId]);

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
        await domainStationService.reactivateById(stationId);
        setOriginalIsActive(true);
      }

      await domainStationService.update(stationId, {
        descName: form.descName.trim(),
      });

      if (hasStatusChange && !needsReactivateBefore) {
        if (selectedIsActive) {
          await domainStationService.reactivateById(stationId);
        } else {
          await domainStationService.deleteById(stationId);
        }
        setOriginalIsActive(selectedIsActive);
      }

      dispatch(
        showToast({
          severity: "success",
          summary: "Delegacia atualizada",
          detail: "As alterações foram salvas com sucesso.",
        })
      );

      router.push("/delegacias");
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
  }, [dispatch, form, originalIsActive, router, selectedIsActive, stationId, validate]);

  const setStationStatus = useCallback((nextActive: boolean) => {
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
    setStationStatus,
  };
}
