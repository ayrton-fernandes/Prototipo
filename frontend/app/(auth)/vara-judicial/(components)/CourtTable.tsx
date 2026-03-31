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
        value={item.active ? "ATIVO" : "INATIVO"}
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
      <Column field="descName" header="Vara judicial" style={{ width: "36%" }} pt={headerCellStyle} />
      <Column field="codeName" header="Código" style={{ width: "30%" }} pt={headerCellStyle} />
      <Column field="status" header="Status" style={{ width: "18%" }} pt={headerCellStyle} />
      <Column field="action" header="Ação" style={{ width: "16%" }} pt={headerCellStyle} />
    </Table>
  );
}
