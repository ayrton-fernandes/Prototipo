'use client'

import { Button, Card, FlexContainer, InputText, Typography, TextLink } from "@uigovpe/components";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import Image from "next/image";
import { authService } from "@/services/authService";
import { setToken } from "@/services/utils/cookie";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { getImagePath } from "@/utils/getImagePath";
import { footerLogo, logoPrograma } from "@/config/constant/layout/layout.config";

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

      router.push(redirectTo);
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
    <>
      <div className="verify-code-page flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
        {/* <FlexContainer
          direction="row"
          gap="12"
          justify="center"
          align="center"
          className="mb-12 max-w-96"
        >
          <div>
            <Image
              src={getImagePath(logoPrograma.src)}
              width={200}
              height={100}
              alt={logoPrograma.alt}
              className="responsive-img rounded"
            />
          </div>
          <div>
            <Image
              src={getImagePath(footerLogo.src)}
              width={200}
              height={100}
              alt={footerLogo.alt}
              className="contrast-img responsive-img rounded"
            />
          </div>
        </FlexContainer> */}

        <Card title="Verificar código">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FlexContainer
              direction="col"
              gap="4"
              justify="center"
              align="start"
            >
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

              <Button
                type="submit"
                label="Validar código"
                className="w-full"
                loading={isLoading}
              />

              <Typography
                variant="div"
                textAlign="center"
                className="w-full flex-1"
              >
                <TextLink onClick={() => router.push('/login')} style={{ color: '#000000' }}>
                  Voltar para o login
                </TextLink>
              </Typography>
            </FlexContainer>
          </form>
        </Card>
        </div>
      </div>
    </>
  );
}
