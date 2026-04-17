"use client";

import { Column, Table, Tag, Typography } from "@uigovpe/components";
import { BaseResponseDTO } from "@/domain/types/base";
import DirectorateActionMenu from "@/app/(auth)/diretorias/(components)/DirectorateActionMenu";

interface DirectorateTableProps {
  items: BaseResponseDTO[];
  loading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onReactivate: (id: number) => void;
}

export default function DirectorateTable({
  items,
  loading,
  onEdit,
  onDelete,
  onReactivate,
}: DirectorateTableProps) {
  if (!loading && items.length === 0) {
    return (
      <Typography variant="p" className="text-sm">
        Nenhuma diretoria encontrada.
      </Typography>
    );
  }

  const tableData = items.map((item) => ({
    ...item,
    status: (
      <Tag
        value={item.active ? "ATIVO" : "INATIVO"}
        severity={item.active ? "success" : "danger"}
      />
    ),
    action: (
      <DirectorateActionMenu
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
      <Column field="descName" header="Diretoria" />
      <Column field="codeName" header="Código" />
      <Column field="status" header="Status" />
      <Column field="action" header="Ação" />
    </Table>
  );
}
