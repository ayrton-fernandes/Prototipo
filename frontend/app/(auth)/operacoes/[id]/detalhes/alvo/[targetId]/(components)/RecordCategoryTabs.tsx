"use client";

import { Button, Tag, Typography } from "@uigovpe/components";
import { ProntuarioCategoryCode } from "@/app/(auth)/operacoes/[id]/detalhes/alvo/[targetId]/(utils)/record";

export interface ProntuarioCategoryTabItem {
  codeName: ProntuarioCategoryCode;
  title: string;
  description: string;
  entryId: number | null;
  filledCount: number;
  totalCount: number;
}

interface ProntuarioCategoryTabsProps {
  items: ProntuarioCategoryTabItem[];
  selectedCode: ProntuarioCategoryCode;
  onSelect: (codeName: ProntuarioCategoryCode) => void;
}

export default function ProntuarioCategoryTabs({ items, selectedCode, onSelect }: ProntuarioCategoryTabsProps) {
  return (
    <div className="flex flex-col gap-3">
      <Typography variant="small" className="text-slate-500 uppercase tracking-[0.2em]">
        Seções do prontuário
      </Typography>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {items.map((item) => {
          const isSelected = item.codeName === selectedCode;
          const isComplete = item.totalCount > 0 && item.filledCount >= item.totalCount;
          const tabClassName = [
            "prontuario-category-tab",
            isSelected ? "prontuario-category-tab--selected" : "prontuario-category-tab--unselected",
          ].join(" ");

          return (
            <Button
              key={item.codeName}
              className={tabClassName}
              outlined={!isSelected}
              onClick={() => onSelect(item.codeName)}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <Typography variant="p" className="prontuario-category-tab-title">
                  {item.title}
                </Typography>
                <Tag value={isComplete ? "Concluído" : item.entryId ? "Em edição" : "Pendente"} severity={isComplete ? "success" : item.entryId ? "info" : "warning"} />
              </div>

              <Typography variant="small" className="prontuario-category-tab-description">
                {item.description}
              </Typography>

              <Typography variant="small" className="prontuario-category-tab-metadata">
                {item.filledCount}/{item.totalCount} campos preenchidos
              </Typography>
            </Button>
          );
        })}
      </div>
    </div>
  );
}