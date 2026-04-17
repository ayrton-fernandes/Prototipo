"use client";

import { Card, Typography } from "@uigovpe/components";
import UserForm from "@/app/(auth)/acessos/(components)/UserForm";
import { useCreateUser } from "./(hooks)/useCreateUser";

export default function UserRegisterPage() {
  const { form, errors, loading, profiles, profilesLoading, handleChange, submit } = useCreateUser();

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2 cpo-page-title">
          Cadastrar usuário
        </Typography>

        <Typography variant="p" className="cpo-page-subtitle">Crie um novo acesso ao sistema CPO Digital.</Typography>
      </section>

      <Card title="Novo usuário" elevation="low">
        <UserForm
          title="Dados de acesso"
          submitLabel="Cadastrar usuário"
          form={form}
          errors={errors}
          loading={loading || profilesLoading}
          profileOptions={profiles}
          onChange={handleChange}
          onSubmit={submit}
        />
      </Card>
    </>
  );
}