"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { userService } from "@/services/userService";
import { ProfileOption, UserFormErrors, UserFormState } from "@/app/(auth)/acessos/(types)/userForm";
import { UserRole } from "@/domain/types/userManagement";

const INITIAL_FORM: UserFormState = {
  name: "",
  email: "",
  password: "",
  role: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useCreateUser() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<UserFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);

  const validate = useCallback((data: UserFormState): UserFormErrors => {
    const nextErrors: UserFormErrors = {};

    if (!data.name.trim()) nextErrors.name = "Nome é obrigatório";
    if (!data.email.trim()) nextErrors.email = "E-mail é obrigatório";
    if (data.email.trim() && !EMAIL_REGEX.test(data.email)) nextErrors.email = "E-mail inválido";
    if (!data.password.trim()) nextErrors.password = "Senha é obrigatória";
    if (data.password.trim().length > 0 && data.password.trim().length < 6) {
      nextErrors.password = "A senha deve ter pelo menos 6 caracteres";
    }
    if (!data.role) nextErrors.role = "Perfil é obrigatório";

    return nextErrors;
  }, []);

  const loadProfiles = useCallback(async () => {
    setProfilesLoading(true);
    try {
      const response = await userService.findAllProfiles();
      const mappedProfiles = response.data
        .filter((profile) => profile.active)
        .map((profile) => ({
          label: profile.descName,
          value: profile.codeName,
        }));
      setProfiles(mappedProfiles);
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha ao carregar perfis",
          detail: "Não foi possível obter os perfis disponíveis.",
        })
      );
    } finally {
      setProfilesLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const isValid = useMemo(() => Object.keys(validate(form)).length === 0, [form, validate]);

  const handleChange = useCallback(<K extends keyof UserFormState>(field: K, value: UserFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const submit = useCallback(async () => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await userService.create({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role as UserRole,
      });

      dispatch(
        showToast({
          severity: "success",
          summary: "Usuário cadastrado",
          detail: "Cadastro realizado com sucesso.",
        })
      );

      router.push("/acessos");
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha no cadastro",
          detail: "Não foi possível cadastrar o usuário.",
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
    profiles,
    profilesLoading,
    isValid,
    handleChange,
    submit,
  };
}
