"use client";

import { Button, Card, InputText, Icon, Typography } from "@uigovpe/components";
import { useRouter } from "next/navigation";
import DeleteDialog from "@/components/DeleteDialog";
import OperationDialog from "@/app/(auth)/operacoes/(components)/OperationDialog";
import OperationTable from "@/app/(auth)/operacoes/(components)/OperationTable";
import { useOperationsPage } from "@/app/(auth)/operacoes/(hooks)/useOperationsPage";

export default function OperationsPage() {
  const router = useRouter();
  const {
    operationLoading,
    optionLoading,
    optionGroups,
    search,
    setSearch,
    visibleOperations,
    currentPage,
    totalPages,
    dialogVisible,
    editingOperation,
    form,
    errors,
    submitting,
    deleteTarget,
    deleteLoading,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    updateField,
    submitDialog,
    setCurrentPage,
    requestDelete,
    closeDeleteDialog,
    confirmDelete,
    reactivateOperation,
  } = useOperationsPage();

  return (
    <>
      <section className="mb-6">
        <div>
          <Typography variant="h1" className="mb-2 cpo-page-title">
            Gestão de operações
          </Typography>

          <Typography variant="p" className="cpo-page-subtitle">
            Gerencie o domínio de operações do sistema.
          </Typography>
        </div>
      </section>

      <Card title="Operações" elevation="low" className="cpo-text-on-dark">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
            <div className="w-full md:max-w-sm">
              <InputText
                label="Buscar operação"
                placeholder="Digite nome ou código"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <Button
              label="CRIAR NOVA ORQ"
              icon={<Icon icon="add" />}
              onClick={openCreateDialog}
              disabled={operationLoading || optionLoading || submitting}
            />
          </div>

          <OperationTable
            operations={visibleOperations}
            loading={operationLoading || optionLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onEdit={openEditDialog}
            onViewDetails={(operation) => router.push(`/operacoes/${operation.id}/detalhes`)}
            onDelete={requestDelete}
            onReactivate={reactivateOperation}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>

      <OperationDialog
        visible={dialogVisible}
        loading={optionLoading}
        submitting={submitting}
        title={editingOperation ? "Editar ORQ" : "Criar Nova ORQ"}
        submitLabel={editingOperation ? "SALVAR" : "CRIAR"}
        form={form}
        errors={errors}
        optionGroups={optionGroups}
        onChange={updateField}
        onClose={closeDialog}
        onSubmit={submitDialog}
      />

      <DeleteDialog
        visible={deleteTarget !== null}
        entity="ORQ"
        loading={deleteLoading}
        article="essa"
        dialogClassName="operation-members-delete-dialog"
        cancelButtonClassName="prontuario-dialog-cancel-button"
        confirmButtonClassName="operation-members-submit-button"
        confirmButtonDanger={false}
        onHide={closeDeleteDialog}
        onConfirm={confirmDelete}
      />
    </>
  );
}