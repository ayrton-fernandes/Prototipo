"use client";

import { Card, Typography } from "@uigovpe/components";
import CourtForm from "@/app/(auth)/vara-judicial/(components)/CourtForm";
import { useCreateCourt } from "@/app/(auth)/vara-judicial/cadastrar/(hooks)/useCreateCourt";

export default function CourtRegisterPage() {
  const { form, errors, loading, handleChange, submit } = useCreateCourt();

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2 cpo-page-title">
          Cadastrar vara judicial
        </Typography>

        <Typography variant="p" className="cpo-page-subtitle">Crie uma nova vara judicial no sistema CPO Digital.</Typography>
      </section>

      <Card title="Nova vara judicial" elevation="low">
        <CourtForm
          title="Dados da vara judicial"
          submitLabel="Cadastrar vara judicial"
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
