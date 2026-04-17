"use client";

import Image from "next/image";
import { Button, Card, Icon, Menu, Typography } from "@uigovpe/components";
import { useRouter, useParams } from "next/navigation";
import { OperationTarget } from "@/app/(auth)/operacoes/[id]/detalhes/(types)/operationDetails";
import EntityActionMenu from "@/components/EntityActionMenu";
import { maskCpf, formatDateToDisplay } from "@/utils/formatters";

interface OperationTargetsSectionProps {
  targets: OperationTarget[];
  onDelete?: (targetId: number) => void;
}

export default function OperationTargetsSection({ targets, onDelete }: OperationTargetsSectionProps) {
  const router = useRouter();
  const params = useParams() as { id?: string };

  const handleCreate = () => {
    const id = params?.id ?? null;
    if (id) {
      router.push(`/operacoes/${id}/detalhes/alvo/cadastrar`);
      return;
    }

    // fallback
    window.location.assign(window.location.pathname + "/cadastrar");
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Typography variant="h2" className="text-black">
            Alvos da operação
          </Typography>
          <Typography variant="p" className="text-slate-500">
            Cadastre e visualize os alvos vinculados à operação.
          </Typography>
        </div>

        <Button label="Cadastrar novo alvo" icon={<Icon icon="add" />} onClick={handleCreate} />
      </div>

      {targets.length === 0 ? (
        <Card>
          <Typography variant="p">
            Nenhum alvo cadastrado
          </Typography>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {targets.map((target) => (
            <Card key={target.id} className="target-card">
              <div className="absolute top-4 right-4 z-10">
                <EntityActionMenu
                  active={true}
                  onEdit={() => router.push(`/operacoes/${params?.id}/detalhes/alvo/${target.id}/editar`)}
                  onViewDetails={() => router.push(`/operacoes/${params?.id}/detalhes/alvo/${target.id}`)}
                  onDelete={async () => {
                    if (onDelete) {
                      await onDelete(target.id);
                    }
                  }}
                  onReactivate={() => {}}
                  editLabel="Editar alvo"
                  showViewDetails
                />
              </div>

              <div className="flex items-start gap-6">
                <div className="h-28 w-28 md:h-36 md:w-36 overflow-hidden rounded-lg bg-slate-100 flex-shrink-0">
                  {target.imageUrl ? (
                    <img src={target.imageUrl} alt={target.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-slate-600 font-medium">(sem foto)</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 min-w-0 flex-col gap-4 overflow-hidden">
                  <div>
                    <Typography variant="small" className="text-slate-400">
                      Nome do Alvo:
                    </Typography>
                    <Typography variant="p" className="font-semibold text-white md:text-2xl text-xl break-words">
                      {target.fullName}
                    </Typography>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 mt-1 text-slate-300 w-full">
                    <div className="flex flex-col min-w-0">
                      <Typography variant="small" className="text-slate-400">CPF</Typography>
                      <Typography variant="p" className="font-medium truncate">{target.cpf ? maskCpf(target.cpf) : '-'}</Typography>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <Typography variant="small" className="text-slate-400">Data de Nascimento</Typography>
                      <Typography variant="p" className="font-medium truncate">{target.birthDate ? formatDateToDisplay(target.birthDate) : '-'}</Typography>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
