"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, Typography } from "@uigovpe/components";
import DelegateForm from "@/app/(auth)/delegados/(components)/DelegateForm";
import { useEditDelegate } from "@/app/(auth)/delegados/[id]/(hooks)/useEditDelegate";

export default function DelegateEditPage() {
  const params = useParams();
  const delegateId = useMemo(() => Number(params.id), [params.id]);

  const {
    form,
    errors,
    loading,
    saving,
    statusLoading,
    isActive,
    handleChange,
    submit,
    setDelegateStatus,
  } = useEditDelegate(delegateId);

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2">
          Editar delegado
        </Typography>

        <Typography variant="p">Atualize o nome e o status do delegado.</Typography>
      </section>

      <Card title="Editar delegado" elevation="low">
        {loading ? (
          <Typography variant="p">Carregando delegado...</Typography>
        ) : (
          <div className="flex flex-col gap-4">
            <DelegateForm
              title="Dados do delegado"
              submitLabel="Salvar alterações"
              form={form}
              errors={errors}
              loading={saving}
              showStatusControls
              isActive={isActive}
              statusLoading={statusLoading}
              onStatusChange={setDelegateStatus}
              onChange={handleChange}
              onSubmit={submit}
            />
          </div>
        )}
      </Card>
    </>
  );
}
