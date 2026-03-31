"use client";

import EntityActionMenu from "@/components/EntityActionMenu";

interface DelegateActionMenuProps {
  active: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReactivate: () => void;
}

export default function DelegateActionMenu({
  active,
  onEdit,
  onDelete,
  onReactivate,
}: DelegateActionMenuProps) {
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
