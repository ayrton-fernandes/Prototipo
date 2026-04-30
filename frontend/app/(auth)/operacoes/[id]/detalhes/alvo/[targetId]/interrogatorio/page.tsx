"use client";

import { Button, Card, Dialog, Dropdown, Icon, InputText, Typography } from "@uigovpe/components";
import TargetSectionsHeader from "@/app/(auth)/operacoes/[id]/detalhes/alvo/(components)/TargetSectionsHeader";
import ProntuarioCustomFieldsPanel from "@/app/(auth)/operacoes/[id]/detalhes/alvo/[targetId]/(components)/RecordCustomFieldsPanel";
import ProntuarioGroupSection from "@/app/(auth)/operacoes/[id]/detalhes/alvo/[targetId]/(components)/RecordGroupSection";
import {
  CUSTOM_FIELD_INPUT_TYPE_OPTIONS,
  ProntuarioCustomFieldInputType,
  useTargetProntuario,
} from "@/app/(auth)/operacoes/[id]/detalhes/alvo/[targetId]/(hooks)/useTargetRecord";
import { formatDateToDisplay, maskCpf } from "@/utils/formatters";
import { useParams, useRouter } from "next/navigation";
import { useCurrentOperationMember } from "@/app/(auth)/operacoes/[id]/detalhes/(hooks)/useCurrentOperationMember";
import { useTargetTabs } from "@/app/(auth)/operacoes/[id]/detalhes/alvo/(hooks)/useTargetTabs";

export default function TargetInterrogationPage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const { permission, loading } = useCurrentOperationMember();
  const { hasAccessToTab, canEditContent } = useTargetTabs({
    permission,
    currentTabId: "INTERROGATORIO",
  });
  const {
    target,
    loading: recordLoading,
    saving,
    errorMessage,
    selectedEntryState,
    categoryGroups,
    sections,
    customFieldDialogVisible,
    customFieldForm,
    goToOperationsDetails,
    handleTemplateFieldChange,
    handleCustomFieldChange,
    handleAddGroupInstance,
    handleRemoveGroupInstance,
    handleOpenCustomFieldDialog,
    handleCloseCustomFieldDialog,
    handleCreateCustomField,
    handleRemoveCustomField,
    handleSaveSelectedCategory,
    setCustomFieldForm,
  } = useTargetProntuario({
    templateName: "Interrogatório",
    sectionLabel: "Interrogatório",
  });

  if (!loading && !hasAccessToTab("INTERROGATORIO")) {
    return (
      <>
        <TargetSectionsHeader activeTabId="INTERROGATORIO" />

        <Card className="prontuario-surface-card">
          <div className="flex flex-col gap-4">
            <Typography variant="h3">Interrogatório</Typography>
            <Typography variant="p">Seu perfil não possui acesso a esta seção.</Typography>
            <div className="flex justify-end gap-2">
              <Button
                label="Voltar para a operação"
                outlined
                className="prontuario-dialog-cancel-button"
                icon={<Icon icon="arrow_back" />}
                onClick={() => router.push(`/operacoes/${params.id}/detalhes`)}
              />
            </div>
          </div>
        </Card>
      </>
    );
  }

  if (loading || recordLoading) {
    return (
      <>
        <TargetSectionsHeader activeTabId="INTERROGATORIO" />

        <Card className="prontuario-surface-card">
          <Typography variant="p">Carregando interrogatório do alvo...</Typography>
        </Card>
      </>
    );
  }

  if (errorMessage || !target) {
    return (
      <>
        <TargetSectionsHeader activeTabId="INTERROGATORIO" />

        <Card className="prontuario-surface-card">
          <div className="flex flex-col gap-4">
            <Typography variant="h3">Interrogatório do Alvo</Typography>
            <Typography variant="p">{errorMessage ?? "Não foi possível carregar os dados da seção."}</Typography>
            <div className="flex justify-end gap-2">
              <Button label="Voltar para a operação" outlined className="prontuario-dialog-cancel-button" icon={<Icon icon="arrow_back" />} onClick={goToOperationsDetails} />
            </div>
          </div>
        </Card>
      </>
    );
  }

  const immutableTargetInfo = [
    { label: "Nome do alvo", value: target.fullName.trim() || "-" },
    { label: "CPF", value: maskCpf(target.cpf) || "-" },
    { label: "Data de nascimento", value: formatDateToDisplay(target.birthDate) || "-" },
    { label: "Nome da mãe", value: target.motherName?.trim() || "-" },
  ];

  return (
    <>
      <TargetSectionsHeader activeTabId="INTERROGATORIO" />

      <div className="prontuario-target-page cpo-text-on-light grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
        <main className="flex min-w-0 flex-col gap-8">
          <section className="flex flex-col gap-2">
            <Typography variant="h1">Interrogatório do Alvo</Typography>
            <Typography variant="p" className="max-w-3xl">
              Visualize e {canEditContent ? "edite" : "consulte"} os interrogatórios associados ao alvo, com campos carregados dinamicamente do template do backend.
            </Typography>
          </section>

          {selectedEntryState ? (
            <div className="flex flex-col gap-8">
              <Card className="prontuario-surface-card">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <Typography variant="h4">Dados do Alvo</Typography>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {immutableTargetInfo.map((item) => (
                      <div key={item.label} className="rounded-xl border px-4 py-3">
                        <Typography variant="small">{item.label}</Typography>
                        <Typography variant="p" className="font-semibold">{item.value}</Typography>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <div className="flex flex-col gap-8">
                {sections.map((section) => (
                  <div key={section.category.id} className="flex flex-col gap-8">
                    {section.groups.map((groupNode) => (
                      <ProntuarioGroupSection
                        key={groupNode.group.id}
                        entryId={section.entryState.infoEntry.id}
                        groupNode={groupNode}
                        drafts={section.entryState.drafts}
                        disabled={saving || !canEditContent}
                        onFieldChange={handleTemplateFieldChange}
                        onAddInstance={handleAddGroupInstance}
                        onRemoveInstance={handleRemoveGroupInstance}
                      />
                    ))}
                  </div>
                ))}

                {/* Campos complementares consolidados no final da página */}
                {(() => {
                  const allCustomFields = sections.flatMap((s) => s.entryState.customFields || []);
                  const allDrafts = sections.reduce((acc, s) => ({ ...acc, ...(s.entryState.drafts || {}) }), {} as Record<string, any>);

                  return allCustomFields.length > 0 ? (
                    <ProntuarioCustomFieldsPanel
                      customFields={allCustomFields}
                      drafts={allDrafts}
                      disabled={saving || !canEditContent}
                      onFieldChange={handleCustomFieldChange}
                      onRemoveField={handleRemoveCustomField}
                    />
                  ) : null;
                })()}

                {canEditContent ? (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button label="Adicionar novo campo" className="prontuario-primary-button" onClick={handleOpenCustomFieldDialog} disabled={saving} />
                    <Button label="Salvar seção" className="prontuario-primary-button" onClick={handleSaveSelectedCategory} loading={saving} />
                  </div>
                ) : (
                  <Card className="prontuario-surface-card">
                    <Typography variant="p">Esta seção está disponível apenas para visualização no seu perfil.</Typography>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card className="prontuario-surface-card">
              <Typography variant="p">Nenhum registro disponível para a seção selecionada.</Typography>
            </Card>
          )}
        </main>

        <Dialog
          visible={customFieldDialogVisible}
          modal
          header={<Typography variant="h4">Novo campo complementar</Typography>}
          className="prontuario-target-dialog prontuario-target-dialog-wide cpo-text-on-light"
          onHide={handleCloseCustomFieldDialog}
          footer={
            <div className="flex justify-end gap-2">
              <Button label="Cancelar" outlined className="prontuario-dialog-cancel-button" onClick={handleCloseCustomFieldDialog} />
              <Button label="Criar campo" className="prontuario-primary-button" onClick={handleCreateCustomField} loading={saving} />
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <InputText
              label="Rótulo"
              placeholder="Ex: Observação complementar"
              value={customFieldForm.label}
              onChange={(event) => setCustomFieldForm((state) => ({ ...state, label: event.target.value }))}
            />

            <Dropdown
              label="Tipo de entrada"
              placeholder="Selecione o tipo"
              options={CUSTOM_FIELD_INPUT_TYPE_OPTIONS}
              value={customFieldForm.inputType}
              onChange={(event) => setCustomFieldForm((state) => ({ ...state, inputType: event.value as ProntuarioCustomFieldInputType }))}
            />
          </div>
        </Dialog>
      </div>
    </>
  );
}
