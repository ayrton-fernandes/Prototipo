"use client";

import Image from "next/image";
import { Button, Card, Icon, Typography } from "@uigovpe/components";
import { OperationTarget } from "@/app/(auth)/operacoes/[id]/detalhes/(types)/operationDetails";

interface OperationTargetsSectionProps {
  targets: OperationTarget[];
}

export default function OperationTargetsSection({ targets }: OperationTargetsSectionProps) {
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

        <Button label="Cadastrar novo alvo" icon={<Icon icon="add" />} disabled />
      </div>

      {targets.length === 0 ? (
        <Card>
          <Typography variant="p">
            Nenhum alvo cadastrado
          </Typography>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {targets.map((target) => (
            <Card key={target.id}>
              <div className="flex items-start gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {target.imageUrl ? (
                    <Image
                      src={target.imageUrl}
                      alt={target.name}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <Icon icon="person" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-1">
                  <Typography variant="small" className="text-slate-500">
                    Nome do alvo
                  </Typography>
                  <Typography variant="p" className="font-semibold">
                    {target.name}
                  </Typography>
                  <Typography variant="small" className="text-slate-600">
                    CPF: {target.cpf}
                  </Typography>
                  <Typography variant="small" className="text-slate-600">
                    Data de nascimento: {target.birthDate}
                  </Typography>
                </div>

                <Button
                  icon={<Icon icon="more_vert" />}
                  rounded
                  outlined
                  disabled
                  aria-label="Ações do alvo"
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
