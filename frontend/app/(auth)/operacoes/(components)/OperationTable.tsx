"use client";

import { Column, Table, Typography } from "@uigovpe/components";
import { OperationResponse } from "@/domain/types/operation";
import EntityActionMenu from "@/components/EntityActionMenu";

interface OperationTableProps {
  operations: OperationResponse[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onEdit: (operation: OperationResponse) => void;
  onViewDetails: (operation: OperationResponse) => void;
  onDelete: (operation: OperationResponse) => void;
  onReactivate: (operation: OperationResponse) => void;
  onPageChange: (page: number) => void;
}

const formatPageLabel = (page: number) => page.toString().padStart(2, "0");

export default function OperationTable({
  operations,
  loading,
  currentPage,
  totalPages,
  onEdit,
  onViewDetails,
  onDelete,
  onReactivate,
  onPageChange,
}: OperationTableProps) {
  if (!loading && operations.length === 0) {
    return (
      <div>
        <Typography variant="p" className="text-sm ">
          Nenhuma operação encontrada.
        </Typography>
      </div>
    );
  }

  const tableData = operations.map((operation) => ({
    name: operation.name ?? "-",
    code: operation.operationCode ?? "-",
    stationName: operation.station?.descName ?? "-",
    delegateName: operation.delegate?.descName ?? "-",
    action: (
      <EntityActionMenu
        active={operation.active}
        onEdit={() => onEdit(operation)}
        onViewDetails={() => onViewDetails(operation)}
        onDelete={() => onDelete(operation)}
        onReactivate={() => onReactivate(operation)}
        showViewDetails
      />
    ),
  }));

  const visiblePages = () => {
    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 2) {
      return [1, 2, 3];
    }

    if (currentPage >= totalPages - 1) {
      return [totalPages - 2, totalPages - 1, totalPages];
    }

    return [currentPage - 1, currentPage, currentPage + 1];
  };

  return (
    <div className="flex flex-col gap-4">
      <Table
        value={tableData}
        loading={loading}
        pt={{
          root: {
            className: "table-list table-list--operations",
          },
        }}
      >
        <Column field="name" header="Nome da operação" />
        <Column field="code" header="Código" />
        <Column field="stationName" header="Delegacia responsável" />
        <Column field="delegateName" header="Delegado responsável" />
        <Column field="action" header="Ação" />
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          {visiblePages().map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={[
                "min-w-10 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                page === currentPage
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-700",
              ].join(" ")}
            >
              {formatPageLabel(page)}
            </button>
          ))}

          {totalPages > 4 && currentPage < totalPages - 1 && (
            <span className="px-1 text-slate-500">...</span>
          )}
        </div>
      )}
    </div>
  );
}