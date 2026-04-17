"use client";

import { Card, Typography } from "@uigovpe/components";
import StationForm from "@/app/(auth)/delegacias/(components)/StationForm";
import { useCreateStation } from "@/app/(auth)/delegacias/cadastrar/(hooks)/useCreateStation";

export default function StationRegisterPage() {
  const { form, errors, loading, handleChange, submit } = useCreateStation();

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2 cpo-page-title">
          Cadastrar delegacia
        </Typography>

        <Typography variant="p" className="cpo-page-subtitle">Crie uma nova delegacia no sistema CPO Digital.</Typography>
      </section>

      <Card title="Nova delegacia" elevation="low">
        <StationForm
          title="Dados da delegacia"
          submitLabel="Cadastrar delegacia"
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
