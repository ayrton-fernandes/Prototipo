"use client";

import { Card, Typography } from "@uigovpe/components";
import DelegateForm from "@/app/(auth)/delegados/(components)/DelegateForm";
import { useCreateDelegate } from "@/app/(auth)/delegados/cadastrar/(hooks)/useCreateDelegate";

export default function DelegateRegisterPage() {
  const { form, errors, loading, handleChange, submit } = useCreateDelegate();

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2 cpo-page-title">
          Cadastrar delegado
        </Typography>

        <Typography variant="p" className="cpo-page-subtitle">Crie uma novo delegado no sistema CPO Digital.</Typography>
      </section>

      <Card title="Novo delegado" elevation="low">
        <DelegateForm
          title="Dados do delegado"
          submitLabel="Cadastrar delegado"
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
