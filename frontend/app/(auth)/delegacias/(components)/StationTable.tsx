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
        value={item.active ? "ATIVO" : "INATIVO"}
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

  const headerCellStyle = {
    headerCell: {
      className: "font-bold text-sm",
    },
  };

  return (
    <Table
      value={tableData}
      loading={loading}
      tableStyle={{ width: "100%" }}
      pt={{
        bodyRow: {
          className: "text-sm font-normal",
        },
      }}
    >
      <Column field="descName" header="Delegacia" style={{ width: "36%" }} pt={headerCellStyle} />
      <Column field="codeName" header="Código" style={{ width: "30%" }} pt={headerCellStyle} />
      <Column field="status" header="Status" style={{ width: "18%" }} pt={headerCellStyle} />
      <Column field="action" header="Ação" style={{ width: "16%" }} pt={headerCellStyle} />
    </Table>
  );
}
