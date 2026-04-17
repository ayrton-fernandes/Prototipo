"use client";

import { Button, Dialog, Typography } from "@uigovpe/components";

interface DeleteDialogProps {
  visible: boolean;
  entity: string;
  loading?: boolean;
  article?: "esse" | "essa";
  dialogClassName?: string;
  cancelButtonClassName?: string;
  confirmButtonClassName?: string;
  confirmButtonDanger?: boolean;
  onHide: () => void;
  onConfirm: () => void;
}

export default function DeleteDialog({
  visible,
  entity,
  loading,
  article = "esse",
  dialogClassName,
  cancelButtonClassName,
  confirmButtonClassName,
  confirmButtonDanger = true,
  onHide,
  onConfirm,
}: DeleteDialogProps) {
  const dialogClassNames = ["delete-dialog", "max-w-sm", dialogClassName]
    .filter(Boolean)
    .join(" ");

  const cancelButtonClassNames = ["delete-dialog-cancel-button", cancelButtonClassName]
    .filter(Boolean)
    .join(" ");

  const confirmButtonClassNames = [confirmButtonClassName]
    .filter(Boolean)
    .join(" ");

  const headerElement = (
    <div className="flex items-center justify-center gap-2">
      <Typography fontWeight="bold" className="text-black">Deseja inativar {article} {entity}?</Typography>
    </div>
  );

  const footerContent = (
    <div className="flex gap-2 justify-end">
      <Button outlined label="Cancelar" disabled={loading} onClick={onHide} className={cancelButtonClassNames} />
      <Button
        autoFocus
        label="Confirmar"
        severity={confirmButtonDanger ? "danger" : undefined}
        className={confirmButtonClassNames}
        iconPos="right"
        loading={loading}
        onClick={onConfirm}
      />
    </div>
  );

  return (
    <Dialog
      modal
      className={dialogClassNames}
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
