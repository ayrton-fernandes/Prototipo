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

export default function TargetProntuarioPage() {
  const {
    target,
    loading,
    saving,
    errorMessage,
    selectedEntryState,
    categoryGroups,
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
  } = useTargetProntuario();

  if (loading) {
    return (
      <>
        <TargetSectionsHeader />

        <Card className="prontuario-surface-card">
          <Typography variant="p" className="text-slate-600">
            Carregando prontuário do alvo...
          </Typography>
        </Card>
      </>
    );
  }

  if (errorMessage || !target) {
    return (
      <>
        <TargetSectionsHeader />

        <Card className="prontuario-surface-card">
          <div className="flex flex-col gap-4">
            <Typography variant="h3" className="text-slate-900">
              Prontuário do alvo
            </Typography>
            <Typography variant="p" className="text-slate-500">
              {errorMessage ?? "Não foi possível carregar os dados do alvo."}
            </Typography>
            <div className="flex justify-end gap-2">
              <Button label="Voltar para a operação" outlined icon={<Icon icon="arrow_back" />} onClick={goToOperationsDetails} />
            </div>
          </div>
        </Card>
      </>
    );
  }

  const immutableTargetInfo = [
    {
      label: "Nome do alvo",
      value: target.fullName.trim() || "-",
    },
    {
      label: "CPF",
      value: maskCpf(target.cpf) || "-",
    },
    {
      label: "Data de nascimento",
      value: formatDateToDisplay(target.birthDate) || "-",
    },
    {
      label: "Nome da mãe",
      value: target.motherName?.trim() || "-",
    },
  ];

  return (
    <>
      <TargetSectionsHeader />

      <div className="prontuario-target-page grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
        <main className="flex min-w-0 flex-col gap-8">
        <section className="flex flex-col gap-2">
          <Typography variant="h1" className="text-slate-900">
            Prontuário do Alvo
          </Typography>
          <Typography variant="p" className="max-w-3xl text-slate-500">
            Cadastre e visualize os dados do alvo em uma estrutura limpa, fiel ao fluxo de prontuário e conectada ao backend.
          </Typography>
        </section>

        {selectedEntryState ? (
          <div className="flex flex-col gap-8">
            <Card className="prontuario-surface-card">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <Typography variant="h4" className="text-slate-900">
                    Dados do Alvo
                  </Typography>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {immutableTargetInfo.map((item) => (
                    <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <Typography variant="small" className="text-slate-500">
                        {item.label}
                      </Typography>
                      <Typography variant="p" className="font-semibold text-slate-900">
                        {item.value}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <div className="flex flex-col gap-8">
              {categoryGroups.map((groupNode) => (
                <ProntuarioGroupSection
                  key={groupNode.group.id}
                  entryId={selectedEntryState.infoEntry.id}
                  groupNode={groupNode}
                  drafts={selectedEntryState.drafts}
                  disabled={saving}
                  onFieldChange={handleTemplateFieldChange}
                  onAddInstance={handleAddGroupInstance}
                  onRemoveInstance={handleRemoveGroupInstance}
                />
              ))}
            </div>

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

            {selectedEntryState.customFields.length > 0 ? (
              <ProntuarioCustomFieldsPanel
                entryId={selectedEntryState.infoEntry.id}
                customFields={selectedEntryState.customFields}
                drafts={selectedEntryState.drafts}
                disabled={saving}
                onFieldChange={handleCustomFieldChange}
                onRemoveField={handleRemoveCustomField}
              />
            ) : null}
          </div>
        ) : (
          <Card className="prontuario-surface-card">
            <Typography variant="p" className="text-slate-500">
              Nenhum registro disponível para a seção selecionada.
            </Typography>
          </Card>
        )}
        </main>

        <Dialog
          visible={customFieldDialogVisible}
          modal
          header={<Typography variant="h4" className="text-black">Novo campo complementar</Typography>}
          className="prontuario-target-dialog prontuario-target-dialog-wide"
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