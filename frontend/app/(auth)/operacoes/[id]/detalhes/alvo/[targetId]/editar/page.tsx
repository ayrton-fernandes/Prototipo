"use client";

import { Card, Typography } from "@uigovpe/components";
import TargetSectionsHeader from "@/app/(auth)/operacoes/[id]/detalhes/alvo/(components)/TargetSectionsHeader";
import TargetForm from "@/app/(auth)/operacoes/[id]/detalhes/alvo/cadastrar/(components)/TargetForm";
import { useEditTarget } from "@/app/(auth)/operacoes/[id]/detalhes/alvo/[targetId]/editar/(hooks)/useEditTarget";

export default function EditTargetPage() {
  const { form, errors, loading, handleChange, submit } = useEditTarget();

  return (
    <>
      <TargetSectionsHeader />

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
