'use client'

import { Button, Card, FlexContainer, Typography } from "@uigovpe/components";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImagePath } from "@/utils/getImagePath";
import { footerLogo, logoPrograma } from "@/config/constant/layout/layout.config";

export default function RecoverPassword() {
  const router = useRouter();

  return (
    <>
      <div className="p-8 md:p-12 max-w-md">
        <FlexContainer
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
        </FlexContainer>

        <Card title="Recuperar senha">
          <FlexContainer
            direction="col"
            gap="4"
            justify="center"
            align="center"
          >
            <Typography variant="p" textAlign="center">
              Esta funcionalidade estará disponível em breve.
            </Typography>

            <Button
              label="Voltar para o login"
              className="w-full"
              onClick={() => router.push('/login')}
            />
          </FlexContainer>
        </Card>
      </div>
    </>
  );
}
