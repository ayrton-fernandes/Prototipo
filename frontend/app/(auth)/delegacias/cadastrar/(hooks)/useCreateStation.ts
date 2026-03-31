"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { stationService } from "@/services/stationService";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { StationFormErrors, StationFormState } from "@/app/(auth)/delegacias/(types)/stationForm";

const INITIAL_FORM: StationFormState = {
  descName: "",
};

export function useCreateStation() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<StationFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<StationFormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = useCallback((data: StationFormState): StationFormErrors => {
    const nextErrors: StationFormErrors = {};
    if (!data.descName.trim()) nextErrors.descName = "Nome é obrigatório";
    return nextErrors;
  }, []);

  const isValid = useMemo(() => Object.keys(validate(form)).length === 0, [form, validate]);

  const handleChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, descName: value }));
  }, []);

  const submit = useCallback(async () => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await stationService.create({
        descName: form.descName.trim(),
      });

      dispatch(
        showToast({
          severity: "success",
          summary: "Delegacia cadastrada",
          detail: "Cadastro realizado com sucesso.",
        })
      );

      router.push("/delegacias");
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha no cadastro",
          detail: "Não foi possível cadastrar a delegacia.",
        })
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, form, router, validate]);

  return {
    form,
    errors,
    loading,
    isValid,
    handleChange,
    submit,
  };
}
