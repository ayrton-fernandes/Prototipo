"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, Typography } from "@uigovpe/components";
import StationForm from "@/app/(auth)/delegacias/(components)/StationForm";
import { useEditStation } from "@/app/(auth)/delegacias/[id]/(hooks)/useEditStation";

export default function StationEditPage() {
  const params = useParams();
  const stationId = useMemo(() => Number(params.id), [params.id]);

  const {
    form,
    errors,
    loading,
    saving,
    statusLoading,
    isActive,
    handleChange,
    submit,
    setStationStatus,
  } = useEditStation(stationId);

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2">
          Editar delegacia
        </Typography>

        <Typography variant="p">Atualize o nome e o status da delegacia.</Typography>
      </section>

      <Card title="Editar delegacia" elevation="low">
        {loading ? (
          <Typography variant="p">Carregando delegacia...</Typography>
        ) : (
          <div className="flex flex-col gap-4">
            <StationForm
              title="Dados da delegacia"
              submitLabel="Salvar alterações"
              form={form}
              errors={errors}
              loading={saving}
              showStatusControls
              isActive={isActive}
              statusLoading={statusLoading}
              onStatusChange={setStationStatus}
              onChange={handleChange}
              onSubmit={submit}
            />
          </div>
        )}
      </Card>
    </>
  );
}
