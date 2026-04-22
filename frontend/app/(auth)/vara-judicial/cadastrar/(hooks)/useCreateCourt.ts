"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { domainCourtService } from "@/services/domainCourtService";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { CourtFormErrors, CourtFormState } from "@/app/(auth)/vara-judicial/(types)/courtForm";

const INITIAL_FORM: CourtFormState = {
  descName: "",
};

export function useCreateCourt() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<CourtFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<CourtFormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = useCallback((data: CourtFormState): CourtFormErrors => {
    const nextErrors: CourtFormErrors = {};
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
      await domainCourtService.create({
        descName: form.descName.trim(),
      });

      dispatch(
        showToast({
          severity: "success",
          summary: "Vara judicial cadastrada",
          detail: "Cadastro realizado com sucesso.",
        })
      );

      router.push("/vara-judicial");
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha no cadastro",
          detail: "Não foi possível cadastrar a vara judicial.",
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
