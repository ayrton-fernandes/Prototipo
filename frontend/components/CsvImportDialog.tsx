"use client";

import React, { useState } from "react";
import { Button, Dialog, Icon, Typography } from "@uigovpe/components";
import CsvImport from "@/components/CsvImport";

type Props = {
  operationId: string;
};

type ImportMode = 'targets' | 'prontuarios';

export default function CsvImportDialog({ operationId }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ImportMode>('targets');

  const openFor = (m: ImportMode) => {
    setMode(m);
    setOpen(true);
  };

  const title = mode === 'targets' ? 'Importar Alvos' : 'Importar Prontuários';

  return (
    <div className="flex items-center gap-2">
      <Button 
        label="Importar Alvos" 
        icon={<Icon icon="upload" />} 
        onClick={() => openFor('targets')} 
      />
      <Button 
        label="Importar Prontuários" 
        outlined 
        icon={<Icon icon="upload" />} 
        onClick={() => openFor('prontuarios')} 
      />

      <Dialog
        visible={open}
        modal
        onHide={() => setOpen(false)}
        // O segredo para o TypeScript e para o design é o 'pt' (Pass Through)
        pt={{
          root: { className: '!border-none !bg-black' },
          header: { className: '!bg-black !text-white !border-b !border-zinc-800 !p-4' },
          content: { className: '!bg-black !text-white !p-6' },
          footer: { className: '!bg-black !text-white !border-t !border-zinc-800 !p-4' },
          closeButton: { className: '!text-white hover:!bg-zinc-800' } // Ajusta o ícone de fechar (X)
        }}
        header={(
          <Typography variant="h4" className="text-white font-bold">
            {title}
          </Typography>
        )}
        footer={(
          <div className="flex justify-end">
            <Button 
              label="Fechar" 
              outlined 
              className="!border-yellow-300 !text-yellow-300 hover:!bg-yellow-300/10" 
              onClick={() => setOpen(false)} 
            />
          </div>
        )}
      >
        <CsvImport 
          operationId={operationId} 
          allowTypeSelection={false} 
          initialType={mode} 
        />
      </Dialog>
    </div>
  );
}