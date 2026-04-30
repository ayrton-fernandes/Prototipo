"use client";

import { Button, Dialog, Typography } from "@uigovpe/components";
import { maskCpf } from "@/utils/formatters";

interface MatchAlertModalProps {
  visible: boolean;
  onHide: () => void;
  onConfirm: () => void;
  loading?: boolean;
  targetName?: string;
  targetCpf?: string;
}

export default function MatchAlertModal({
  visible,
  onHide,
  onConfirm,
  loading = false,
  targetName,
  targetCpf,
}: MatchAlertModalProps) {
  const dialogClassNames = ["match-alert-dialog", "max-w-sm"].join(" ");
  
  const headerElement = (
    <div className="flex items-center justify-center gap-2">
      <Typography variant="h4" className="font-bold">Alvo já cadastrado!</Typography>
    </div>
  );

  const footerContent = (
    <div className="flex gap-2 justify-end">
      <Button
        outlined
        label="Não, seguir com cadastro manual"
        disabled={loading}
        onClick={onHide}
        className="match-alert-cancel-button"
      />
      <Button
        autoFocus
        label="Sim, solicitar dados"
        className="match-alert-confirm-button prontuario-primary-button"
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
      <div className="flex flex-col gap-2">
        <Typography variant="p">Este alvo já está cadastrado em outra operação.</Typography>
        {targetName ? (
          <Typography variant="p" className="font-semibold">
            {targetName}
            {targetCpf ? ` - CPF ${maskCpf(targetCpf)}` : ""}
          </Typography>
        ) : null}
        <Typography variant="p">Deseja solicitar os dados do alvo já existente e continuar com o cadastro manual?</Typography>
      </div>
    </Dialog>
  );
}