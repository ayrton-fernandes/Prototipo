"use client";

import { Button, Card, Icon, Typography } from "@uigovpe/components";
import { CustomFieldResponse } from "@/domain/types/customField";
import { TemplateFieldResponse } from "@/domain/types/templateField";
import ProntuarioFieldInput from "@/app/(auth)/operacoes/[id]/detalhes/alvo/[targetId]/(components)/RecordFieldInput";
import {
  buildCustomFieldDraftKey,
  ProntuarioFieldDraft,
} from "@/app/(auth)/operacoes/[id]/detalhes/alvo/[targetId]/(utils)/record";

interface ProntuarioCustomFieldsPanelProps {
  entryId: number;
  customFields: CustomFieldResponse[];
  drafts: Record<string, ProntuarioFieldDraft>;
  disabled?: boolean;
  onFieldChange: (customField: CustomFieldResponse, nextValue: string, selectedFile?: File) => void;
  onRemoveField: (customField: CustomFieldResponse) => void;
}

const toSyntheticField = (customField: CustomFieldResponse): TemplateFieldResponse => ({
  id: customField.id,
  templateId: customField.entryId,
  parentFieldId: null,
  label: customField.label,
  inputType: customField.inputType,
  fixed: false,
  required: false,
  orderIndex: null,
  active: customField.active,
  createdAt: customField.createdAt,
  updatedAt: customField.updatedAt,
});

export default function ProntuarioCustomFieldsPanel({
  entryId,
  customFields,
  drafts,
  disabled = false,
  onFieldChange,
  onRemoveField,
}: ProntuarioCustomFieldsPanelProps) {
  return (
    <Card className="prontuario-surface-card flex flex-col gap-5 text-white">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-white">
            Campos complementares
          </Typography>
          <Typography variant="small" className="text-white">
            Definições extras vinculadas ao registro selecionado.
          </Typography>
        </div>
      </div>

      {customFields.length === 0 ? (
        <Typography variant="p" className="text-white">
          Nenhum campo complementar cadastrado para esta seção.
        </Typography>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {customFields.map((customField) => {
            const draftKey = buildCustomFieldDraftKey(entryId, customField.id);
            const draft = drafts[draftKey];

            return (
              <div key={draftKey} className="prontuario-instance-card flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <Typography variant="small" className="text-white">
                    Campo complementar
                  </Typography>

                  <Button
                    icon={<Icon icon="delete" />}
                    rounded
                    outlined
                    className="prontuario-trash-button"
                    onClick={() => onRemoveField(customField)}
                    disabled={disabled}
                    aria-label={`Remover campo complementar ${customField.label}`}
                  />
                </div>

                <ProntuarioFieldInput
                  field={toSyntheticField(customField)}
                  value={draft?.valueContent ?? ""}
                  disabled={disabled}
                  onChange={(nextValue, selectedFile) => onFieldChange(customField, nextValue, selectedFile)}
                />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}