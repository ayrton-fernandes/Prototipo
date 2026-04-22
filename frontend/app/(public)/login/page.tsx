'use client'

import { Button, Card, FlexContainer, InputPassword, InputText, Typography, } from "@uigovpe/components";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from 'react-hook-form';
import { useMemo, useState } from "react";
import { authService } from "@/services/authService";
import { getImagePath } from "@/utils/getImagePath";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";


type LoginFormData = {
  email: string;
  senha: string;
};

// Função simples de validação de email
const validateEmail = (email: string): string | undefined => {
  if (!email) return "E-mail é obrigatório";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "E-mail inválido";
  return undefined;
};

// Função simples de validação de senha
const validatePassword = (password: string): string | undefined => {
  if (!password) return "Senha é obrigatória";
  if (password.length < 6) return "Senha deve ter pelo menos 6 caracteres";
  return undefined;
};

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const normalizeRedirectPath = (path: string): string => {
    if (!path || !path.startsWith('/')) return '/home';
    if (path === '/login' || path.startsWith('/verify-code')) return '/home';
    if (path.includes('verify-code')) return '/home';
    return path;
  };

  const redirectPath = useMemo(() => {
    return normalizeRedirectPath(searchParams.get("redirectTo") || "/home");
  }, [searchParams]);

  const { control, handleSubmit, formState: { errors }, setError, clearErrors } = useForm<LoginFormData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      senha: ''
    }
  });

  // Função de validação customizada
  const validateForm = (data: LoginFormData): boolean => {
    let isValid = true;

    // Limpa erros anteriores
    clearErrors();

    // Valida email
    const emailError = validateEmail(data.email);
    if (emailError) {
      setError('email', { type: 'manual', message: emailError });
      isValid = false;
    }

    // Valida senha
    const passwordError = validatePassword(data.senha);
    if (passwordError) {
      setError('senha', { type: 'manual', message: passwordError });
      isValid = false;
    }

    return isValid;
  };

  const onSubmit = async (data: LoginFormData) => {
    // Valida os dados antes de enviar
    if (!validateForm(data)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      await authService.requestOtp({
        email: data.email,
        password: data.senha,
      });

      dispatch(
        showToast({
          severity: "success",
          summary: "Código enviado",
          detail: "Enviamos o código OTP para o seu e-mail.",
        })
      );

      sessionStorage.setItem("pendingLoginEmail", data.email);
      const target = `/verify-code?redirectTo=${encodeURIComponent(redirectPath)}`;
      window.location.assign(target);

    } catch (error) {
      dispatch(
        showToast({
          severity: "error",
          summary: "Não foi possível solicitar o código",
          detail: "Verifique suas credenciais e tente novamente.",
        })
      );
      console.error("Erro ao fazer login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="auth-page-shell login-page">
        <div className="auth-page-panel p-6 md:p-10">
          <Card>
            <FlexContainer
              direction="col"
              gap="2"
              align='center'
              className="w-full"
            >
              <Typography variant="span" className="text-black" fontWeight="bold">
                CPO DIGITAL
              </Typography>
              <Typography variant="span" className="text-sm text-black" textAlign="center">
                Controle de Operações Policiais - Governo de Pernambuco
              </Typography>
            </FlexContainer>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FlexContainer
                direction="col"
                gap="4"
                justify="center"
                align="start"
              >
                <div className="w-full text-black">
                  <Controller
                    name="email"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <InputText
                        {...field}
                        label="E-mail"
                        invalid={!!errors.email}
                        placeholder="Ex: exemplo@gmail.com"
                        supportText={errors.email?.message}
                      />
                    )}
                  />
                </div>

                <div className="w-full">
                  <Controller
                    name="senha"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <InputPassword
                        {...field}
                        label="Senha"
                        placeholder="Digite sua senha"
                        invalid={!!errors.senha}
                        supportText={errors.senha?.message}
                        keyfilter={/^\S+$/}
                      />
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  label="Entrar"
                  className="w-full"
                  loading={isLoading}
                />
              </FlexContainer>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
