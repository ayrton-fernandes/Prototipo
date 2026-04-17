"use client";

import { Card, Typography } from "@uigovpe/components";
import DirectorateForm from "@/app/(auth)/diretorias/(components)/DirectorateForm";
import { useCreateDirectorate } from "@/app/(auth)/diretorias/cadastrar/(hooks)/useCreateDirectorate";

export default function DirectorateRegisterPage() {
  const { form, errors, loading, handleChange, submit } = useCreateDirectorate();

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2 cpo-page-title">
          Cadastrar diretoria
        </Typography>

        <Typography variant="p" className="cpo-page-subtitle">Crie uma nova diretoria no sistema CPO Digital.</Typography>
      </section>

      <Card title="Nova diretoria" elevation="low">
        <DirectorateForm
          title="Dados da diretoria"
          submitLabel="Cadastrar diretoria"
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
