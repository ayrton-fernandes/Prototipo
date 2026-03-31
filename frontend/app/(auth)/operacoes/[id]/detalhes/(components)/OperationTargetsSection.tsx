"use client";

import Image from "next/image";
import { Button, Card, Icon, Typography } from "@uigovpe/components";
import { OperationTarget } from "@/app/(auth)/operacoes/[id]/detalhes/(types)/operationDetails";
import { getImagePath } from "@/utils/getImagePath";

interface OperationTargetsSectionProps {
  targets: OperationTarget[];
}

export default function OperationTargetsSection({ targets }: OperationTargetsSectionProps) {
  const fallbackImage = getImagePath("logo-policia.png");

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
            <Card key={target.id} className="operation-target-card">
              <div className="operation-target-card-content">
                <div className="operation-target-avatar">
                  <Image
                    src={target.imageUrl ?? fallbackImage}
                    alt={target.name}
                    width={140}
                    height={180}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>

                <div className="operation-target-info">
                  <Button
                    icon={<Icon icon="more_vert" />}
                    rounded
                    text
                    disabled
                    aria-label={`Ações do alvo ${target.name}`}
                    className="operation-target-action"
                  />

                  <div className="operation-target-name-wrap">
                    <Typography variant="small" className="operation-target-label">
                      Nome do Alvo:
                    </Typography>
                    <Typography variant="h3" className="operation-target-name">
                      {target.name}
                    </Typography>
                  </div>

                  <div className="operation-target-meta-grid">
                    <div>
                      <Typography variant="small" className="operation-target-label">
                        CPF:
                      </Typography>
                      <Typography variant="p" className="operation-target-value">
                        {target.cpf}
                      </Typography>
                    </div>

                    <div>
                      <Typography variant="small" className="operation-target-label">
                        Data de Nascimento:
                      </Typography>
                      <Typography variant="p" className="operation-target-value">
                        {target.birthDate}
                      </Typography>
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
