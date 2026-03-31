"use client";

import EntityActionMenu from "@/components/EntityActionMenu";

interface CourtActionMenuProps {
  active: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReactivate: () => void;
}

export default function CourtActionMenu({
  active,
  onEdit,
  onDelete,
  onReactivate,
}: CourtActionMenuProps) {
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
