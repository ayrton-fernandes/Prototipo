"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, Typography } from "@uigovpe/components";
import CourtForm from "@/app/(auth)/vara-judicial/(components)/CourtForm";
import { useEditCourt } from "@/app/(auth)/vara-judicial/[id]/(hooks)/useEditCourt";

export default function CourtEditPage() {
  const params = useParams();
  const courtId = useMemo(() => Number(params.id), [params.id]);

  const {
    form,
    errors,
    loading,
    saving,
    statusLoading,
    isActive,
    handleChange,
    submit,
    setCourtStatus,
  } = useEditCourt(courtId);

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2 cpo-page-title">
          Editar vara judicial
        </Typography>

        <Typography variant="p" className="cpo-page-subtitle">
          Atualize o nome e o status da vara judicial.
        </Typography>
      </section>

      <Card title="Editar vara judicial" elevation="low">
        {loading ? (
          <Typography variant="p">Carregando vara judicial...</Typography>
        ) : (
          <div className="flex flex-col gap-4">
            <CourtForm
              title="Dados da vara judicial"
              submitLabel="Salvar alterações"
              form={form}
              errors={errors}
              loading={saving}
              showStatusControls
              isActive={isActive}
              statusLoading={statusLoading}
              onStatusChange={setCourtStatus}
              onChange={handleChange}
              onSubmit={submit}
            />
          </div>
        )}
      </Card>
    </>
  );
}
