"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, Typography } from "@uigovpe/components";
import DepartmentForm from "@/app/(auth)/departamentos/(components)/DepartmentForm";
import { useEditDepartment } from "@/app/(auth)/departamentos/[id]/(hooks)/useEditDepartment";

export default function DepartmentEditPage() {
  const params = useParams();
  const departmentId = useMemo(() => Number(params.id), [params.id]);

  const {
    form,
    errors,
    loading,
    saving,
    statusLoading,
    isActive,
    handleChange,
    submit,
    setDepartmentStatus,
  } = useEditDepartment(departmentId);

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2">
          Editar departamento
        </Typography>

        <Typography variant="p">Atualize o nome e o status do departamento.</Typography>
      </section>

      <Card title="Editar departamento" elevation="low">
        {loading ? (
          <Typography variant="p">Carregando departamento...</Typography>
        ) : (
          <div className="flex flex-col gap-4">
            <DepartmentForm
              title="Dados do departamento"
              submitLabel="Salvar alterações"
              form={form}
              errors={errors}
              loading={saving}
              showStatusControls
              isActive={isActive}
              statusLoading={statusLoading}
              onStatusChange={setDepartmentStatus}
              onChange={handleChange}
              onSubmit={submit}
            />
          </div>
        )}
      </Card>
    </>
  );
}
