"use client";

import { Button, Card, Icon, Typography } from "@uigovpe/components";
import { useParams, useRouter } from "next/navigation";
import TargetSectionsHeader from "@/app/(auth)/operacoes/[id]/detalhes/alvo/(components)/TargetSectionsHeader";
import TargetForm from "@/app/(auth)/operacoes/[id]/detalhes/alvo/cadastrar/(components)/TargetForm";
import { useEditTarget } from "@/app/(auth)/operacoes/[id]/detalhes/alvo/[targetId]/editar/(hooks)/useEditTarget";

export default function EditTargetPage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const { form, errors, loading, handleChange, submit, canEdit } = useEditTarget();

  if (!canEdit) {
    return (
      <>
        <TargetSectionsHeader activeTabId="PRONTUARIO_DO_ALVO" />

        <section className="mb-6">
          <Typography variant="h1" className="mb-2 cpo-page-title">
            Editar Alvo
          </Typography>
          <Typography variant="p" className="cpo-page-subtitle">
            Seu perfil possui apenas acesso de visualização para este alvo.
          </Typography>
        </section>

        <Card elevation="low">
          <div className="flex flex-col gap-4">
            <Typography variant="p">
              As informações continuam disponíveis na página de prontuário, mas não podem ser alteradas por este perfil.
            </Typography>
            <div className="flex justify-end">
              <Button label="Voltar para a operação" outlined className="prontuario-dialog-cancel-button" icon={<Icon icon="arrow_back" />} onClick={() => router.push(`/operacoes/${params.id}/detalhes`)} />
            </div>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <TargetSectionsHeader activeTabId="PRONTUARIO_DO_ALVO" />

      <section className="mb-6">
        <Typography variant="h1" className="mb-2 cpo-page-title">
          Editar Alvo
        </Typography>
        <Typography variant="p" className="cpo-page-subtitle">
          Edite os dados do alvo:
        </Typography>
      </section>

      <Card title="Editar alvo" elevation="low">
        <TargetForm
          title="Dados do alvo"
          submitLabel="Salvar"
          form={form}
          errors={errors}
          loading={loading}
          onChange={handleChange}
          onSubmit={submit}
        />
      </Card>
    </>
  );
}
