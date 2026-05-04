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
import { useCurrentOperationMember } from "@/app/(auth)/operacoes/[id]/detalhes/(hooks)/useCurrentOperationMember";
import { useTargetTabs } from "@/app/(auth)/operacoes/[id]/detalhes/alvo/(hooks)/useTargetTabs";
import { useParams, useRouter } from "next/navigation";

export default function TargetProntuarioPage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const { permission, loading: permissionLoading } = useCurrentOperationMember();
  const { hasAccessToTab, canEditContent } = useTargetTabs({
    permission,
    currentTabId: "PRONTUARIO_DO_ALVO",
  });

  const {
    target,
    loading,
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
    canEdit,
  } = useTargetProntuario({
    canEditOverride: canEditContent,
  });

  if (!permissionLoading && !hasAccessToTab("PRONTUARIO_DO_ALVO")) {
    return (
      <>
        <TargetSectionsHeader activeTabId="PRONTUARIO_DO_ALVO" />

        <Card className="prontuario-surface-card">
          <div className="flex flex-col gap-4">
            <Typography variant="h3">Prontuário do Alvo</Typography>
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

  if (loading) {
    return (
      <>
        <TargetSectionsHeader activeTabId="PRONTUARIO_DO_ALVO" />
        <Card className="prontuario-surface-card">
          <Typography variant="p">
            Carregando prontuário do alvo...
          </Typography>
        </Card>
      </>
    );
  }

  if (errorMessage || !target) {
    return (
      <>
        <TargetSectionsHeader activeTabId="PRONTUARIO_DO_ALVO" />
        <Card className="prontuario-surface-card">
          <div className="flex flex-col gap-4">
            <Typography variant="h3">Prontuário do alvo</Typography>
            <Typography variant="p">
              {errorMessage ?? "Não foi possível carregar os dados do alvo."}
            </Typography>
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

  // COMPILANDO TODOS OS CAMPOS COMPLEMENTARES E RASCUNHOS DAS SEÇÕES
  // Correção: Map utilizado para deduplicar os campos complementares.
  const allCustomFields = Array.from(
    new Map(
      sections
        .flatMap((section) => section.entryState.customFields || [])
        .map((field) => [field.id, field])
    ).values()
  );
  const allDrafts = sections.reduce((acc, section) => ({ ...acc, ...(section.entryState.drafts || {}) }), {});

  return (
    <>
      <TargetSectionsHeader activeTabId="PRONTUARIO_DO_ALVO" />

      <div className="prontuario-target-page cpo-text-on-light grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
        <main className="flex min-w-0 flex-col gap-8">
          <section className="flex flex-col gap-2">
            <Typography variant="h1">Prontuário do Alvo</Typography>
            <Typography variant="p" className="max-w-3xl">
              Cadastre e visualize os dados do alvo em uma estrutura limpa, fiel ao fluxo de prontuário e conectada ao backend.
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
                        disabled={saving || !canEdit}
                        onFieldChange={handleTemplateFieldChange}
                        onAddInstance={handleAddGroupInstance}
                        onRemoveInstance={handleRemoveGroupInstance}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* RENDERIZA O PAINEL DE CAMPOS COMPLEMENTARES AQUI NO FINAL (SE HOUVER) */}
              {allCustomFields.length > 0 && (
                <ProntuarioCustomFieldsPanel
                  customFields={allCustomFields}
                  drafts={allDrafts}
                  disabled={saving || !canEdit}
                  onFieldChange={handleCustomFieldChange}
                  onRemoveField={handleRemoveCustomField}
                />
              )}

              {canEdit ? (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    label="Adicionar novo campo"
                    className="prontuario-primary-button"
                    onClick={handleOpenCustomFieldDialog}
                    disabled={saving}
                  />
                  <Button
                    label="Salvar prontuário"
                    className="prontuario-primary-button"
                    onClick={handleSaveSelectedCategory}
                    loading={saving}
                  />
                </div>
              ) : (
                <Card className="prontuario-surface-card">
                  <Typography variant="p">
                    Este prontuário está disponível apenas para visualização no seu perfil.
                  </Typography>
                </Card>
              )}
            </div>
          ) : (
            <Card className="prontuario-surface-card">
              <Typography variant="p">
                Nenhum registro disponível para a seção selecionada.
              </Typography>
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