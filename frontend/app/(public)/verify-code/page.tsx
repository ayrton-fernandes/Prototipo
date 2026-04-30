'use client'

import { Button, Card, FlexContainer, InputText, Typography, TextLink } from "@uigovpe/components";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { authService } from "@/services/authService";
import { setToken } from "@/services/utils/cookie";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";

type VerifyCodeFormData = {
  otpCode: string;
};

export default function VerifyCode() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const redirectTo = useMemo(() => searchParams.get("redirectTo") || "/general", [searchParams]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("pendingLoginEmail") || "";
    setEmail(storedEmail);

    if (!storedEmail) {
      router.replace("/login");
    }
  }, [router]);

  const { control, handleSubmit, formState: { errors } } = useForm<VerifyCodeFormData>({
    mode: "onChange",
    defaultValues: {
      otpCode: "",
    },
  });

  const onSubmit = async (data: VerifyCodeFormData) => {
    if (!email) {
      dispatch(
        showToast({
          severity: "error",
          summary: "E-mail não encontrado",
          detail: "Volte para a tela de login e solicite um novo código.",
        })
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyOtp({
        email,
        otpCode: data.otpCode,
      });

      setToken(response.data.token, response.data.expiresIn);
      sessionStorage.removeItem("pendingLoginEmail");

      dispatch(
        showToast({
          severity: "success",
          summary: "Login realizado",
          detail: "Autenticação concluída com sucesso.",
        })
      );

      // Use full navigation to ensure cookies are sent to the server and middleware
      window.location.assign(redirectTo);
    } catch (error) {
      dispatch(
        showToast({
          severity: "error",
          summary: "Código inválido",
          detail: "Não foi possível validar o OTP. Tente novamente.",
        })
      );
      console.error("Erro ao validar OTP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full">
      <section className="p-8 md:p-12 max-w-lg m-auto">
        <Card title="Verificar código">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FlexContainer direction="col" gap="4" justify="center" align="start">
              <div className="w-full">
                <Controller
                  name="otpCode"
                  control={control}
                  rules={{ required: "Código OTP é obrigatório" }}
                  render={({ field }) => (
                    <InputText
                      {...field}
                      label="Código OTP"
                      invalid={!!errors.otpCode}
                      placeholder="Ex.: 957242"
                      supportText={errors.otpCode?.message}
                    />
                  )}
                />
              </div>

              <Button type="submit" label="Validar código" className="w-full" loading={isLoading} />

              <Typography variant="div" textAlign="center" className="w-full flex-1">
                <TextLink onClick={() => router.push("/login")}>Voltar para o login</TextLink>
              </Typography>
            </FlexContainer>
          </form>
        </Card>
      </section>
    </div>
  );
}
