"use client";

import { Card, Typography } from "@uigovpe/components";
import EntityActionMenu from "@/components/EntityActionMenu";
import { OperationResponse } from "@/domain/types/operation";

interface OperationOverviewCardProps {
  operation: OperationResponse;
  processingAction: boolean;
  onEdit: () => void;
  onDeleteOrReactivate: () => void;
}

export default function OperationOverviewCard({
  operation,
  processingAction,
  onEdit,
  onDeleteOrReactivate,
}: OperationOverviewCardProps) {
  return (
    <Card>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Typography variant="h3">{operation.name}</Typography>
            <Typography variant="small" className="text-slate-500">
              {operation.operationCode}
            </Typography>
          </div>

          <EntityActionMenu
            active={operation.active}
            onEdit={onEdit}
            onDelete={onDeleteOrReactivate}
            onReactivate={onDeleteOrReactivate}
            showViewDetails={false}
            deleteLabel="Excluir ORQ"
            reactivateLabel="Reativar ORQ"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Typography variant="small" className="font-semibold operation-details-overview">
            Informações e observações gerais
          </Typography>
          <Typography variant="p">
            {operation.description?.trim() || "Sem observações registradas."}
          </Typography>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="flex flex-col gap-1">
            <Typography variant="small" className="font-semibold operation-details-overview">Delegacia responsável</Typography>
            <Typography variant="p">{operation.station?.descName ?? "-"}</Typography>
          </div>

          <div className="flex flex-col gap-1">
            <Typography variant="small" className="font-semibold operation-details-overview">Delegado responsável</Typography>
            <Typography variant="p">{operation.delegate?.descName ?? "-"}</Typography>
          </div>

          <div className="flex flex-col gap-1">
            <Typography variant="small" className="font-semibold operation-details-overview">Investigador</Typography>
            <Typography variant="p">{operation.investigator?.name ?? "-"}</Typography>
          </div>

          <div className="flex flex-col gap-1">
            <Typography variant="small" className="font-semibold operation-details-overview">Analista de inteligência</Typography>
            <Typography variant="p">{operation.analystIntelligence?.name ?? "-"}</Typography>
          </div>
        </div>

        {processingAction && (
          <Typography variant="small" className="text-slate-500">
            Processando ação...
          </Typography>
        )}
      </div>
    </Card>
  );
}
