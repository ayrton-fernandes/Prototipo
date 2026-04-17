"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, Typography } from "@uigovpe/components";
import DirectorateForm from "@/app/(auth)/diretorias/(components)/DirectorateForm";
import { useEditDirectorate } from "@/app/(auth)/diretorias/[id]/(hooks)/useEditDirectorate";

export default function DirectorateEditPage() {
  const params = useParams();
  const directorateId = useMemo(() => Number(params.id), [params.id]);

  const {
    form,
    errors,
    loading,
    saving,
    statusLoading,
    isActive,
    handleChange,
    submit,
    setDirectorateStatus,
  } = useEditDirectorate(directorateId);

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2 cpo-page-title">
          Editar diretoria
        </Typography>

        <Typography variant="p" className="cpo-page-subtitle">Atualize o nome e o status da diretoria.</Typography>
      </section>

      <Card title="Editar diretoria" elevation="low">
        {loading ? (
          <Typography variant="p">Carregando diretoria...</Typography>
        ) : (
          <div className="flex flex-col gap-4">
            <DirectorateForm
              title="Dados da diretoria"
              submitLabel="Salvar alterações"
              form={form}
              errors={errors}
              loading={saving}
              showStatusControls
              isActive={isActive}
              statusLoading={statusLoading}
              onStatusChange={setDirectorateStatus}
              onChange={handleChange}
              onSubmit={submit}
            />
          </div>
        )}
      </Card>
    </>
  );
}
