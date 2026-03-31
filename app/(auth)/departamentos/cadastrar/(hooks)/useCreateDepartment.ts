"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { departmentService } from "@/services/departmentService";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { DepartmentFormErrors, DepartmentFormState } from "@/app/(auth)/departamentos/(types)/departmentForm";

const INITIAL_FORM: DepartmentFormState = {
  descName: "",
};

export function useCreateDepartment() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<DepartmentFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<DepartmentFormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = useCallback((data: DepartmentFormState): DepartmentFormErrors => {
    const nextErrors: DepartmentFormErrors = {};
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
      await departmentService.create({
        descName: form.descName.trim(),
      });

      dispatch(
        showToast({
          severity: "success",
          summary: "Departamento cadastrado",
          detail: "Cadastro realizado com sucesso.",
        })
      );

      router.push("/departamentos");
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha no cadastro",
          detail: "Não foi possível cadastrar o departamento.",
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
