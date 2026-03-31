"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { userService } from "@/services/userService";
import { ProfileOption, UserFormErrors, UserFormState } from "@/app/(auth)/acessos/(types)/userForm";
import { UserRole } from "@/domain/types/userManagement";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useEditUser(userId: number) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<UserFormState>({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [originalIsActive, setOriginalIsActive] = useState(true);
  const [selectedIsActive, setSelectedIsActive] = useState(true);

  const validate = useCallback((data: UserFormState): UserFormErrors => {
    const nextErrors: UserFormErrors = {};

    if (!data.name.trim()) nextErrors.name = "Nome é obrigatório";
    if (!data.email.trim()) nextErrors.email = "E-mail é obrigatório";
    if (data.email.trim() && !EMAIL_REGEX.test(data.email)) nextErrors.email = "E-mail inválido";
    if (data.password.trim().length > 0 && data.password.trim().length < 6) {
      nextErrors.password = "A nova senha deve ter pelo menos 6 caracteres";
    }
    if (!data.role) nextErrors.role = "Perfil é obrigatório";

    return nextErrors;
  }, []);

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const [userResponse, profilesResponse] = await Promise.all([
        userService.findById(userId),
        userService.findAllProfiles(),
      ]);

      const user = userResponse.data;
      const availableProfiles = profilesResponse.data
        .filter((profile) => profile.active)
        .map((profile) => ({
          value: profile.codeName,
          label: profile.descName,
        }));

      const currentRole = (user.profileCodes[0] as UserRole) || "";
      const roleExistsInList = availableProfiles.some((profile) => profile.value === currentRole);
      setProfiles(
        roleExistsInList || !currentRole
          ? availableProfiles
          : [{ value: currentRole, label: currentRole }, ...availableProfiles]
      );

      setForm({
        name: user.name,
        email: user.email,
        password: "",
        role: currentRole,
      });
      setOriginalIsActive(user.active);
      setSelectedIsActive(user.active);
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha ao carregar usuário",
          detail: "Não foi possível carregar os dados para edição.",
        })
      );
      router.push("/acessos");
    } finally {
      setLoading(false);
    }
  }, [dispatch, router, userId]);

  useEffect(() => {
    if (!Number.isNaN(userId)) {
      loadUser();
    }
  }, [loadUser, userId]);

  const roleOptions: ProfileOption[] = useMemo(() => profiles, [profiles]);

  const handleChange = useCallback(<K extends keyof UserFormState>(field: K, value: UserFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
        await userService.reactivateById(userId);
        setOriginalIsActive(true);
      }

      await userService.update(userId, {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role as UserRole,
        ...(form.password.trim() ? { password: form.password } : {}),
      });

      if (hasStatusChange && !needsReactivateBefore) {
        if (selectedIsActive) {
          await userService.reactivateById(userId);
        } else {
          await userService.deleteById(userId);
        }
        setOriginalIsActive(selectedIsActive);
      }

      dispatch(
        showToast({
          severity: "success",
          summary: "Usuário atualizado",
          detail: "As alterações foram salvas com sucesso.",
        })
      );

      router.push("/acessos");
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha na atualização",
          detail: "Não foi possível atualizar o usuário.",
        })
      );
    } finally {
      setSaving(false);
      setStatusLoading(false);
    }
  }, [dispatch, form, router, selectedIsActive, originalIsActive, userId, validate]);

  const setUserStatus = useCallback((nextActive: boolean) => {
    setSelectedIsActive(nextActive);
  }, []);

  return {
    form,
    errors,
    loading,
    saving,
    statusLoading,
    isActive: selectedIsActive,
    roleOptions,
    handleChange,
    submit,
    setUserStatus,
  };
}
