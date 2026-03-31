"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { directorateService } from "@/services/directorateService";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { DirectorateFormErrors, DirectorateFormState } from "@/app/(auth)/diretorias/(types)/directorateForm";

const INITIAL_FORM: DirectorateFormState = {
  descName: "",
};

export function useCreateDirectorate() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<DirectorateFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<DirectorateFormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = useCallback((data: DirectorateFormState): DirectorateFormErrors => {
    const nextErrors: DirectorateFormErrors = {};
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
      await directorateService.create({
        descName: form.descName.trim(),
      });

      dispatch(
        showToast({
          severity: "success",
          summary: "Diretoria cadastrada",
          detail: "Cadastro realizado com sucesso.",
        })
      );

      router.push("/diretorias");
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha no cadastro",
          detail: "Não foi possível cadastrar a diretoria.",
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
