"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, Typography } from "@uigovpe/components";
import UserForm from "@/app/(auth)/acessos/(components)/UserForm";
import { useEditUser } from "./(hooks)/useEditUser";

export default function UserEditPage() {
  const params = useParams();
  const userId = useMemo(() => Number(params.id), [params.id]);

  const {
    form,
    errors,
    loading,
    saving,
    statusLoading,
    isActive,
    roleOptions,
    handleChange,
    submit,
    setUserStatus,
  } = useEditUser(userId);

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2 cpo-page-title">
          Editar usuário
        </Typography>

        <Typography variant="p" className="cpo-page-subtitle">
          Atualize nome, e-mail, senha e perfil. Você também pode ativar ou inativar este usuário.
        </Typography>
      </section>

      <Card title="Editar usuário" elevation="low">
        {loading ? (
          <Typography variant="p">Carregando usuário...</Typography>
        ) : (
          <div className="flex flex-col gap-4">
            <UserForm
              title="Dados de acesso"
              submitLabel="Salvar alterações"
              form={form}
              errors={errors}
              loading={saving}
              profileOptions={roleOptions}
              showStatusControls
              isActive={isActive}
              statusLoading={statusLoading}
              onStatusChange={setUserStatus}
              onChange={handleChange}
              onSubmit={submit}
            />
          </div>
        )}
      </Card>
    </>
  );
}
