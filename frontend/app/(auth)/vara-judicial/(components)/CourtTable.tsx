"use client";

import { Column, Table, Tag, Typography } from "@uigovpe/components";
import { BaseResponseDTO } from "@/domain/types/base";
import CourtActionMenu from "@/app/(auth)/vara-judicial/(components)/CourtActionMenu";

interface CourtTableProps {
  items: BaseResponseDTO[];
  loading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onReactivate: (id: number) => void;
}

export default function CourtTable({
  items,
  loading,
  onEdit,
  onDelete,
  onReactivate,
}: CourtTableProps) {
  if (!loading && items.length === 0) {
    return (
      <Typography variant="p" className="text-sm">
        Nenhuma vara judicial encontrada.
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
      <CourtActionMenu
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
      <Column field="descName" header="Vara judicial" />
      <Column field="codeName" header="Código" />
      <Column field="status" header="Status" />
      <Column field="action" header="Ação" />
    </Table>
  );
}
