"use client";

import { Card, Typography } from "@uigovpe/components";
import DepartmentForm from "@/app/(auth)/departamentos/(components)/DepartmentForm";
import { useCreateDepartment } from "@/app/(auth)/departamentos/cadastrar/(hooks)/useCreateDepartment";

export default function DepartmentRegisterPage() {
  const { form, errors, loading, handleChange, submit } = useCreateDepartment();

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2 cpo-page-title">
          Cadastrar departamento
        </Typography>

        <Typography variant="p" className="cpo-page-subtitle">Crie um novo departamento no sistema CPO Digital.</Typography>
      </section>

      <Card title="Novo departamento" elevation="low">
        <DepartmentForm
          title="Dados do departamento"
          submitLabel="Cadastrar departamento"
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
