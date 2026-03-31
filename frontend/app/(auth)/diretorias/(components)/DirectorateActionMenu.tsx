"use client";

import EntityActionMenu from "@/components/EntityActionMenu";

interface DirectorateActionMenuProps {
  active: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReactivate: () => void;
}

export default function DirectorateActionMenu({
  active,
  onEdit,
  onDelete,
  onReactivate,
}: DirectorateActionMenuProps) {
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
