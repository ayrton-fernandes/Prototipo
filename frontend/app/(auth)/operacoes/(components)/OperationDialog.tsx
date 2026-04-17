"use client";

import { Button, Dialog, Dropdown, InputText, InputTextarea, Typography } from "@uigovpe/components";
import { OperationDropdownOption, OperationFormErrors, OperationFormState } from "@/app/(auth)/operacoes/(types)/operationForm";

interface OperationDialogProps {
  visible: boolean;
  loading: boolean;
  submitting: boolean;
  title: string;
  submitLabel: string;
  form: OperationFormState;
  errors: OperationFormErrors;
  optionGroups: {
    departments: OperationDropdownOption[];
    delegates: OperationDropdownOption[];
    directorates: OperationDropdownOption[];
    stations: OperationDropdownOption[];
    courts: OperationDropdownOption[];
    analystUsers: OperationDropdownOption[];
    investigatorUsers: OperationDropdownOption[];
  };
  onChange: <K extends keyof OperationFormState>(field: K, value: OperationFormState[K]) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const selectClassName = "w-full";

export default function OperationDialog({
  visible,
  loading,
  submitting,
  title,
  submitLabel,
  form,
  errors,
  optionGroups,
  onChange,
  onClose,
  onSubmit,
}: OperationDialogProps) {
  const mapValue = (value: string | number | null | undefined) => (value == null ? null : Number(value));

  const headerElement = (
    <div className="flex items-center justify-center gap-2">
      <Typography fontWeight="bold" size="lg" className="operation-dialog-title">
        {title}
      </Typography>
    </div>
  );

  const footerContent = (
    <div className="flex gap-2 justify-end">
      <Button label="DESCARTAR" outlined severity="danger" className="operation-dialog-discard" disabled={submitting} onClick={onClose} />
      <Button label={submitLabel} severity="success" className="operation-dialog-submit" loading={submitting} onClick={onSubmit} />
    </div>
  );

  const textSupportClass = (fieldError?: string) => (fieldError ? "cpo-form-support-error" : "cpo-form-support-text");

  return (
    <Dialog
      visible={visible}
      modal
      header={headerElement}
      footer={footerContent}
      className="operation-dialog operation-dialog--wide"
      dismissableMask={!submitting}
      closable={!submitting}
      onHide={onClose}
    >
      <div className="flex flex-col gap-5 pr-1">
        <InputText
          label="Nome da Operação"
          placeholder="Ex: Contestação"
          value={form.name}
          onChange={(event) => onChange("name", event.target.value)}
          invalid={!!errors.name}
          supportText={errors.name}
          disabled={loading || submitting}
        />

        <div className="flex flex-col gap-1">
          <InputTextarea
            label="Informações e Observações Gerais"
            placeholder="Informações e Observações Gerais"
            rows={4}
            value={form.description}
            onChange={(event) => onChange("description", event.target.value)}
            invalid={!!errors.description}
            supportText={errors.description}
            disabled={loading || submitting}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Dropdown
              className={selectClassName}
              label="Delegacia"
              placeholder="Selecione a Delegacia"
              options={optionGroups.stations}
              value={form.stationId}
              onChange={(event) => onChange("stationId", mapValue(event.value))}
              invalid={!!errors.stationId}
              loading={loading}
              disabled={loading || submitting}
            />
            <Typography variant="small" className={textSupportClass(errors.stationId)}>
              {errors.stationId || "Selecione a delegacia responsável pela operação."}
            </Typography>
          </div>

          <div className="flex flex-col gap-1">
            <Dropdown
              className={selectClassName}
              label="Departamento"
              placeholder="Selecione o Departamento"
              options={optionGroups.departments}
              value={form.departmentId}
              onChange={(event) => onChange("departmentId", mapValue(event.value))}
              invalid={!!errors.departmentId}
              loading={loading}
              disabled={loading || submitting}
            />
            <Typography variant="small" className={textSupportClass(errors.departmentId)}>
              {errors.departmentId || "Selecione o departamento vinculado à operação."}
            </Typography>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-1">
            <Dropdown
              className={selectClassName}
              label="Delegado"
              placeholder="Delegado Responsável"
              options={optionGroups.delegates}
              value={form.delegateId}
              onChange={(event) => onChange("delegateId", mapValue(event.value))}
              invalid={!!errors.delegateId}
              loading={loading}
              disabled={loading || submitting}
            />
            <Typography variant="small" className={textSupportClass(errors.delegateId)}>
              {errors.delegateId || "Selecione o delegado responsável."}
            </Typography>
          </div>

          <div className="flex flex-col gap-1">
            <Dropdown
              className={selectClassName}
              label="Investigador"
              placeholder="Selecione o Investigador"
              options={optionGroups.investigatorUsers}
              value={form.investigatorId}
              onChange={(event) => onChange("investigatorId", mapValue(event.value))}
              invalid={!!errors.investigatorId}
              loading={loading}
              disabled={loading || submitting}
            />
            <Typography variant="small" className={textSupportClass(errors.investigatorId)}>
              {errors.investigatorId || "Selecione o investigador vinculado à operação."}
            </Typography>
          </div>

          <div className="flex flex-col gap-1">
            <Dropdown
              className={selectClassName}
              label="Analista de Inteligência"
              placeholder="Selecione o Analista"
              options={optionGroups.analystUsers}
              value={form.analystIntelligenceId}
              onChange={(event) => onChange("analystIntelligenceId", mapValue(event.value))}
              invalid={!!errors.analystIntelligenceId}
              loading={loading}
              disabled={loading || submitting}
            />
            <Typography variant="small" className={textSupportClass(errors.analystIntelligenceId)}>
              {errors.analystIntelligenceId || "Selecione o analista de inteligência."}
            </Typography>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Dropdown
              className={selectClassName}
              label="Diretoria"
              placeholder="Selecione a Diretoria"
              options={optionGroups.directorates}
              value={form.directorateId}
              onChange={(event) => onChange("directorateId", mapValue(event.value))}
              invalid={!!errors.directorateId}
              loading={loading}
              disabled={loading || submitting}
            />
            <Typography variant="small" className={textSupportClass(errors.directorateId)}>
              {errors.directorateId || "Selecione a diretoria responsável."}
            </Typography>
          </div>

          <div className="flex flex-col gap-1">
            <Dropdown
              className={selectClassName}
              label="Vara Judicial"
              placeholder="Selecione a Vara Judicial"
              options={optionGroups.courts}
              value={form.courtId}
              onChange={(event) => onChange("courtId", mapValue(event.value))}
              invalid={!!errors.courtId}
              loading={loading}
              disabled={loading || submitting}
            />
            <Typography variant="small" className={textSupportClass(errors.courtId)}>
              {errors.courtId || "Selecione a vara judicial vinculada."}
            </Typography>
          </div>
        </div>
      </div>
    </Dialog>
  );
}