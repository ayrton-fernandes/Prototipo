"use client";

import { Button, Card, Typography } from "@uigovpe/components";
import OperationOverviewCard from "@/app/(auth)/operacoes/[id]/detalhes/(components)/OperationOverviewCard";
import OperationTargetsSection from "@/app/(auth)/operacoes/[id]/detalhes/(components)/OperationTargetsSection";
import OperationMembersSection from "@/app/(auth)/operacoes/[id]/detalhes/(components)/OperationMembersSection";
import { useOperationDetailsPage } from "@/app/(auth)/operacoes/[id]/detalhes/(hooks)/useOperationDetailsPage";
import OperationDialog from "@/app/(auth)/operacoes/(components)/OperationDialog";
import DeleteDialog from "@/components/DeleteDialog";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  emptyOperationFormState,
  OperationFormState,
  OperationFormErrors,
} from "@/app/(auth)/operacoes/(types)/operationForm";
import { domainDepartmentService } from "@/services/domainDepartmentService";
import { domainDelegateService } from "@/services/domainDelagateService";
import { domainDirectorateService } from "@/services/domainDirectorateService";
import { domainStationService } from "@/services/domainStationService";
import { domainCourtService } from "@/services/domainCourtService";
import { userService } from "@/services/userService";
import { operationService } from "@/services/operationService";

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
    reload,
    isCurrentUserCoordinator,
    isPlanning,
    sendToPlanning,
  } = useOperationDetailsPage();

  // Local dialog state for editing within details page
  const [dialogVisible, setDialogVisible] = useState(false);
  const [optionLoading, setOptionLoading] = useState(false);
  const [optionGroups, setOptionGroups] = useState<any>({});
  const [form, setForm] = useState<OperationFormState>(emptyOperationFormState());
  const [errors, setErrors] = useState<OperationFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const router = useRouter();

  const fetchOptionGroups = useCallback(async () => {
    setOptionLoading(true);
    try {
      const [departmentsResponse, delegatesResponse, directoratesResponse, stationsResponse, courtsResponse, usersResponse] = await Promise.all([
        domainDepartmentService.findAll(),
        domainDelegateService.findAll(),
        domainDirectorateService.findAll(),
        domainStationService.findAll(),
        domainCourtService.findAll(),
        userService.findAll(),
      ]);

      const users = usersResponse.data;

      const isAnalystUser = (user: any) => user.profileCodes?.includes("INTELLIGENCE");
      const isInvestigatorUser = (user: any) => user.profileCodes?.includes("INVESTIGATION");
      const isPlanningUser = (user: any) => user.profileCodes?.includes("PLANNING");

      setOptionGroups({
        departments: departmentsResponse.data.map((d: any) => ({ label: d.descName, value: d.id })),
        delegates: delegatesResponse.data.map((d: any) => ({ label: d.descName, value: d.id })),
        directorates: directoratesResponse.data.map((d: any) => ({ label: d.descName, value: d.id })),
        stations: stationsResponse.data.map((d: any) => ({ label: d.descName, value: d.id })),
        courts: courtsResponse.data.map((d: any) => ({ label: d.descName, value: d.id })),
        analystUsers: users.filter(isAnalystUser).map((u: any) => ({ label: u.name, value: u.id })),
        investigatorUsers: users.filter(isInvestigatorUser).map((u: any) => ({ label: u.name, value: u.id })),
        plannings: users.filter(isPlanningUser).map((u: any) => ({ label: u.name, value: u.id })),
        planningUsers: users.filter(isPlanningUser).map((u: any) => ({ label: u.name, value: u.id })),
      });
    } finally {
      setOptionLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOptionGroups();
  }, [fetchOptionGroups]);

  const openEditDialog = () => {
    if (!operation) return;
    setForm({
      name: operation.name ?? "",
      description: operation.description ?? "",
      departmentId: operation.department?.id ?? null,
      delegateId: operation.delegate?.id ?? null,
      directorateId: operation.directorate?.id ?? null,
      stationId: operation.station?.id ?? null,
      courtId: operation.court?.id ?? null,
      analystIntelligenceId: operation.analystIntelligence?.id ?? null,
      investigatorId: operation.investigator?.id ?? null,
      operationPlanningId: operation.operationPlanning?.id ?? null,
      planningMemberId: null,
    });
    setErrors({});
    setDialogVisible(true);
  };

  const onUpdateField = <K extends keyof OperationFormState>(field: K, value: OperationFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitDialog = async () => {
    if (!operation) return;
    setSubmitting(true);
    try {
      await operationService.update(operation.id, {
        descName: form.name.trim(),
        description: form.description.trim(),
        departmentId: form.departmentId,
        delegateId: form.delegateId,
        directorateId: form.directorateId,
        stationId: form.stationId,
        courtId: form.courtId,
        analystIntelligenceId: form.analystIntelligenceId,
        investigatorId: form.investigatorId,
        operationPlanningId: form.operationPlanningId ?? form.planningMemberId,
        planningMemberId: form.planningMemberId,
      });
      setDialogVisible(false);
      // reload operation details
      if (reload) await reload();
    } catch (err) {
      // show toast handled in hook reload
    } finally {
      setSubmitting(false);
    }
  };

  const requestDelete = () => setDeleteDialogVisible(true);

  const confirmDelete = async () => {
    if (!operation) return;
    try {
      await operationService.deleteById(operation.id);
      // redirect to operations list
      router.push("/operacoes");
    } catch (err) {
      // noop - toast handled elsewhere
    }
  };

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
          <Typography variant="h3" className="">Detalhes da operação</Typography>
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
        <Typography variant="h1" className="mb-2">
          Detalhes da operação
        </Typography>
        <Typography variant="p" className="">
          Visualize os dados principais, alvos e membros vinculados à ORQ.
        </Typography>
      </section>

      <div className="flex flex-col gap-6">
        <OperationOverviewCard
          operation={operation}
          processingAction={processingAction}
          onEdit={openEditDialog}
          onDeleteOrReactivate={requestDelete}
          showSendToPlanning={isCurrentUserCoordinator}
          onSendToPlanning={sendToPlanning}
          canEdit={!isPlanning}
        />

        <OperationTargetsSection 
          targets={targets} 
          onDelete={async (targetId) => {
            if (deleteTarget) {
              await deleteTarget(targetId);
              if (reloadTargets) reloadTargets();
            }
          }} 
          canEdit={!isPlanning}
        />

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
          canEdit={!isPlanning}
        />
      </div>
      <OperationDialog
        visible={dialogVisible}
        loading={optionLoading}
        submitting={submitting}
        title={"Editar ORQ"}
        submitLabel={"Salvar"}
        form={form}
        errors={errors}
        optionGroups={optionGroups}
        onChange={onUpdateField}
        onClose={() => setDialogVisible(false)}
        onSubmit={submitDialog}
      />

      <DeleteDialog
        visible={deleteDialogVisible}
        entity="ORQ"
        loading={processingAction}
        article="essa"
        dialogClassName="operation-members-delete-dialog"
        cancelButtonClassName="prontuario-dialog-cancel-button"
        confirmButtonClassName="operation-members-submit-button"
        confirmButtonDanger={false}
        onHide={() => setDeleteDialogVisible(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
