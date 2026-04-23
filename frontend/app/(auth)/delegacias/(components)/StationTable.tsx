"use client";

import { Column, Table, Tag, Typography } from "@uigovpe/components";
import { BaseResponseDTO } from "@/domain/types/base";
import StationActionMenu from "@/app/(auth)/delegacias/(components)/StationActionMenu";

interface StationTableProps {
  items: BaseResponseDTO[];
  loading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onReactivate: (id: number) => void;
}

export default function StationTable({
  items,
  loading,
  onEdit,
  onDelete,
  onReactivate,
}: StationTableProps) {
  if (!loading && items.length === 0) {
    return (
      <Typography variant="p" className="text-sm">
        Nenhuma delegacia encontrada.
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
      <StationActionMenu
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
      <Column field="descName" header="Delegacia" />
      <Column field="codeName" header="Código" />
      <Column field="status" header="Status" />
      <Column field="action" header="Ação" />
    </Table>
  );
}
