"use client";

import { Button, Card, Icon, Typography } from "@uigovpe/components";
import { useParams, useRouter } from "next/navigation";
import MatchAlertModal from "@/components/MatchAlertModal";
import TargetSectionsHeader from "@/app/(auth)/operacoes/[id]/detalhes/alvo/(components)/TargetSectionsHeader";
import TargetForm from "@/app/(auth)/operacoes/[id]/detalhes/alvo/cadastrar/(components)/TargetForm";
import { useCreateTarget } from "@/app/(auth)/operacoes/[id]/detalhes/alvo/cadastrar/(hooks)/useCreateTarget";

export default function CreateTargetPage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const {
    form,
    errors,
    loading,
    handleChange,
    submit,
    canEdit,
    matchAlertVisible,
    matchAlertLoading,
    duplicateTarget,
    handleMatchAlertHide,
    handleMatchAlertConfirm,
  } = useCreateTarget();

  if (!canEdit) {
    return (
      <>
        <TargetSectionsHeader activeTabId="PRONTUARIO_DO_ALVO" />

        <section className="mb-6 ">
          <Typography variant="h1" className="mb-2 cpo-page-title">
            Cadastrar Alvo
          </Typography>
          <Typography variant="p" className="cpo-page-subtitle">
            Seu perfil possui apenas acesso de visualização para esta operação.
          </Typography>
        </section>

        <Card elevation="low">
          <div className="flex flex-col gap-4">
            <Typography variant="p">
              O cadastro de novos alvos não está disponível para o perfil planejamento.
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

      <section className="mb-6 ">
        <Typography variant="h1" className="mb-2 cpo-page-title">
          Cadastrar Alvo
        </Typography>
        <Typography variant="p" className="cpo-page-subtitle">
          Cadastre e visualize novos alvos a operação.
        </Typography>
      </section>

      <Card title="Novo alvo" elevation="low">
        <TargetForm
          title="Dados do alvo"
          submitLabel="Avançar"
          form={form}
          errors={errors}
          loading={loading}
          onChange={handleChange}
          onSubmit={submit}
        />
      </Card>

      <MatchAlertModal
        visible={matchAlertVisible}
        loading={matchAlertLoading}
        onHide={handleMatchAlertHide}
        onConfirm={handleMatchAlertConfirm}
      />
    </>
  );
}
