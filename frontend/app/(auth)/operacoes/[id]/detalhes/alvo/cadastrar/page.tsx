"use client";

import { Card, Typography } from "@uigovpe/components";
import TargetSectionsHeader from "@/app/(auth)/operacoes/[id]/detalhes/alvo/(components)/TargetSectionsHeader";
import TargetForm from "@/app/(auth)/operacoes/[id]/detalhes/alvo/cadastrar/(components)/TargetForm";
import { useCreateTarget } from "@/app/(auth)/operacoes/[id]/detalhes/alvo/cadastrar/(hooks)/useCreateTarget";

export default function CreateTargetPage() {
  const { form, errors, loading, handleChange, submit } = useCreateTarget();

  return (
    <>
      <TargetSectionsHeader />

      <section className="mb-6 ">
        <Typography variant="h1" className="mb-2 cpo-page-title">
          Cadastrar Alvo
        </Typography>
        <Typography variant="p" className="cpo-page-subtitle">
          Cadastre e visualize novos alvos a operação.
        </Typography>
      </section>

      <Card title="Novo alvo" className="text-white" elevation="low">
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
    </>
  );
}
