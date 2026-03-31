"use client";

import EntityActionMenu from "@/components/EntityActionMenu";

interface StationActionMenuProps {
  active: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReactivate: () => void;
}

export default function StationActionMenu({
  active,
  onEdit,
  onDelete,
  onReactivate,
}: StationActionMenuProps) {
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
