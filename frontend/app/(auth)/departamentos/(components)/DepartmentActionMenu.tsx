"use client";

import EntityActionMenu from "@/components/EntityActionMenu";

interface DepartmentActionMenuProps {
  active: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReactivate: () => void;
}

export default function DepartmentActionMenu({
  active,
  onEdit,
  onDelete,
  onReactivate,
}: DepartmentActionMenuProps) {
  return (
    <EntityActionMenu
      active={active}
      onEdit={onEdit}
      onDelete={onDelete}
      onReactivate={onReactivate}
      editLabel="Editar"
      deleteLabel="Excluir"
      reactivateLabel="Reativar"
    />
  );
}
