"use client";

import { Button, Card, Column, Icon, Table, Typography } from "@uigovpe/components";
import { OperationMemberRow } from "@/app/(auth)/operacoes/[id]/detalhes/(types)/operationDetails";

interface OperationMembersSectionProps {
  members: OperationMemberRow[];
}

const headerCellStyle = {
  headerCell: {
    className: "font-bold text-sm",
  },
};

export default function OperationMembersSection({ members }: OperationMembersSectionProps) {
  if (members.length === 0) {
    return (
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Typography variant="h2" className="text-black">
              Membros da operação
            </Typography>
            <Typography variant="p" className="text-slate-500">
              Visualize os membros associados à operação.
            </Typography>
          </div>

          <Button label="Cadastrar membro" icon={<Icon icon="add" />} disabled />
        </div>

        <Card>
          <Typography variant="p" className="text-slate-600">
            Nenhum membro associado à operação.
          </Typography>
        </Card>
      </section>
    );
  }

  const tableData = members.map((member) => ({
    ...member,
    action: (
      <Button
        icon={<Icon icon="more_vert" />}
        rounded
        outlined
        disabled
        aria-label={`Ações do membro ${member.name}`}
      />
    ),
  }));

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Typography variant="h2" className="text-black">
            Membros da operação
          </Typography>
          <Typography variant="p" className="text-slate-500">
            Visualize os membros associados à operação.
          </Typography>
        </div>

        <Button label="Cadastrar membro" icon={<Icon icon="add" />} disabled />
      </div>

      <Card>
        <Table
          value={tableData}
          tableStyle={{ width: "100%" }}
          pt={{
            bodyRow: {
              className: "text-sm font-normal",
            },
          }}
        >
          <Column field="name" header="Nome" style={{ width: "24%" }} pt={headerCellStyle} />
          <Column field="email" header="Email" style={{ width: "24%" }} pt={headerCellStyle} />
          <Column field="role" header="Função" style={{ width: "22%" }} pt={headerCellStyle} />
          <Column field="phone" header="Telefone" style={{ width: "20%" }} pt={headerCellStyle} />
          <Column field="action" header="Ações" style={{ width: "10%" }} pt={headerCellStyle} />
        </Table>
      </Card>
    </section>
  );
}
