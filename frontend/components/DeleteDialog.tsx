"use client";

import { Button, Dialog, Typography } from "@uigovpe/components";

interface DeleteDialogProps {
  visible: boolean;
  entity: string;
  loading?: boolean;
  article?: "esse" | "essa";
  onHide: () => void;
  onConfirm: () => void;
}

export default function DeleteDialog({
  visible,
  entity,
  loading,
  article = "esse",
  onHide,
  onConfirm,
}: DeleteDialogProps) {
  const headerElement = (
    <div className="flex items-center justify-center gap-2">
      <Typography fontWeight="bold" className="text-black">Deseja inativar {article} {entity}?</Typography>
    </div>
  );

  const footerContent = (
    <div className="flex gap-2 justify-end">
      <Button outlined label="Cancelar" disabled={loading} onClick={onHide} className="delete-dialog-cancel-button" />
      <Button
        autoFocus
        label="Confirmar"
        severity="danger"
        iconPos="right"
        loading={loading}
        onClick={onConfirm}
      />
    </div>
  );

  return (
    <Dialog
      modal
      className="delete-dialog max-w-sm"
      header={headerElement}
      footer={footerContent}
      visible={visible}
      onHide={() => {
        if (!visible || loading) return;
        onHide();
      }}
    >
      <Typography size="sm" className="text-black">Essa ação não poderá ser desfeita.</Typography>
      <Typography size="sm" className="text-black">Tem certeza de que deseja continuar?</Typography>
    </Dialog>
  );
}
