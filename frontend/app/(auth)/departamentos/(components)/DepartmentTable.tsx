"use client";

import { Column, Table, Tag, Typography } from "@uigovpe/components";
import { BaseResponseDTO } from "@/domain/types/base";
import DepartmentActionMenu from "@/app/(auth)/departamentos/(components)/DepartmentActionMenu";

interface DepartmentTableProps {
  items: BaseResponseDTO[];
  loading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onReactivate: (id: number) => void;
}

export default function DepartmentTable({
  items,
  loading,
  onEdit,
  onDelete,
  onReactivate,
}: DepartmentTableProps) {
  if (!loading && items.length === 0) {
    return (
      <Typography variant="p" className="text-sm">
        Nenhum departamento encontrado.
      </Typography>
    );
  }

  const tableData = items.map((item) => ({
    ...item,
    status: (
      <Tag
        value={item.active ? "Ativo" : "Inativo"}
        severity={item.active ? "success" : "danger"}
      />
    ),
    action: (
      <DepartmentActionMenu
        active={item.active}
        onEdit={() => onEdit(item.id)}
        onDelete={() => onDelete(item.id)}
        onReactivate={() => onReactivate(item.id)}
      />
    ),
  }));

  return (
    <Table
      value={tableData}
      loading={loading}
      pt={{
        root: {
          className: "table-list table-list--standard-with-code",
        },
      }}
    >
      <Column field="descName" header="Departamento" />
      <Column field="codeName" header="Código" />
      <Column field="status" header="Status" />
      <Column field="action" header="Ação" />
    </Table>
  );
}
