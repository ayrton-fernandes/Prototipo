"use client";

import { Button, Card, Typography } from "@uigovpe/components";
import OperationOverviewCard from "@/app/(auth)/operacoes/[id]/detalhes/(components)/OperationOverviewCard";
import OperationTargetsSection from "@/app/(auth)/operacoes/[id]/detalhes/(components)/OperationTargetsSection";
import OperationMembersSection from "@/app/(auth)/operacoes/[id]/detalhes/(components)/OperationMembersSection";
import { useOperationDetailsPage } from "@/app/(auth)/operacoes/[id]/detalhes/(hooks)/useOperationDetailsPage";

export default function OperationDetailsPage() {
  const {
    operation,
    loading,
    processingAction,
    errorMessage,
    targets,
    members,
    memberUsers,
    memberProfileDescriptionByCode,
    membersLoading,
    membersProcessing,
    membersErrorMessage,
    goToOperationsList,
    editOperation,
    toggleOperationStatus,
    createMember,
    updateMemberPermission,
    deleteMember,
    deleteTarget,
    reloadTargets,
  } = useOperationDetailsPage();

  if (loading) {
    return (
      <Card>
        <Typography variant="p">Carregando detalhes da operação...</Typography>
      </Card>
    );
  }

  if (!operation) {
    return (
      <Card>
        <div className="flex flex-col gap-4">
          <Typography variant="h3" className="text-black">Detalhes da operação</Typography>
          <Typography variant="p">{errorMessage ?? "Operação não encontrada."}</Typography>
          <div className="flex justify-end">
            <Button label="Voltar para operações" onClick={goToOperationsList} />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2 text-black">
          Detalhes da operação
        </Typography>
        <Typography variant="p" className="text-slate-500">
          Visualize os dados principais, alvos e membros vinculados à ORQ.
        </Typography>
      </section>

      <div className="flex flex-col gap-6">
        <OperationOverviewCard
          operation={operation}
          processingAction={processingAction}
          onEdit={editOperation}
          onDeleteOrReactivate={toggleOperationStatus}
        />

        <OperationTargetsSection targets={targets} onDelete={async (targetId) => {
          if (deleteTarget) {
            await deleteTarget(targetId);
            if (reloadTargets) reloadTargets();
          }
        }} />

        <OperationMembersSection
          members={members}
          users={memberUsers}
          profileDescriptionByCode={memberProfileDescriptionByCode}
          loading={membersLoading}
          processing={membersProcessing}
          errorMessage={membersErrorMessage}
          onCreate={createMember}
          onUpdatePermission={updateMemberPermission}
          onDelete={deleteMember}
        />
      </div>
    </>
  );
}
