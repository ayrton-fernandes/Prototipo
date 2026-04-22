"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { domainDelegateService } from "@/services/domainDelagateService";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { DelegateFormErrors, DelegateFormState } from "@/app/(auth)/delegados/(types)/delegateForm";

const INITIAL_FORM: DelegateFormState = {
  descName: "",
};

export function useCreateDelegate() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<DelegateFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<DelegateFormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = useCallback((data: DelegateFormState): DelegateFormErrors => {
    const nextErrors: DelegateFormErrors = {};
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
      await domainDelegateService.create({
        descName: form.descName.trim(),
      });

      dispatch(
        showToast({
          severity: "success",
          summary: "Delegado cadastrado",
          detail: "Cadastro realizado com sucesso.",
        })
      );

      router.push("/delegados");
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha no cadastro",
          detail: "Não foi possível cadastrar o delegado.",
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
