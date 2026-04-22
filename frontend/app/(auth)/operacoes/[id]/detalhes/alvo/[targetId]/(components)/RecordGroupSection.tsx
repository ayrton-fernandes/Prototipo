"use client";

import { ReactNode } from "react";
import { Button, Card, Icon, Typography } from "@uigovpe/components";
import { TemplateFieldResponse } from "@/domain/types/templateField";
import ProntuarioFieldInput from "@/app/(auth)/operacoes/[id]/detalhes/alvo/[targetId]/(components)/RecordFieldInput";
import ProntuarioImagePreview from "@/app/(auth)/operacoes/[id]/detalhes/alvo/[targetId]/(components)/RecordImagePreview";
import {
  buildTemplateFieldDraftKey,
  getFieldPresentationForGroup,
  getDisplayGroupLabel,
  normalizeGroupInstanceId,
  normalizeInputType,
  isCompactGroup,
  isFiliacaoGroup,
  isRepeatableGroup,
  ProntuarioFieldDraft,
  TemplateGroupNode,
} from "@/app/(auth)/operacoes/[id]/detalhes/alvo/[targetId]/(utils)/record";

interface ProntuarioGroupSectionProps {
  entryId: number;
  groupNode: TemplateGroupNode;
  drafts: Record<string, ProntuarioFieldDraft>;
  disabled?: boolean;
  onFieldChange: (field: TemplateFieldResponse, groupInstanceId: string | null, nextValue: string, selectedFile?: File) => void;
  onAddInstance: (groupNode: TemplateGroupNode) => void;
  onRemoveInstance: (groupNode: TemplateGroupNode, groupInstanceId: string | null) => void;
}

const normalizeFiliacaoValue = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const hasVisibleDraftValue = (draft?: ProntuarioFieldDraft): boolean =>
  Boolean(draft && (draft.fieldValueId != null || draft.valueContent.trim().length > 0));

const TARGET_IMAGES_GROUP_LABELS = new Set(["fotos do alvo", "imagem do alvo", "imagens do alvo"]);

const isTargetImagesGroup = (label: string): boolean => TARGET_IMAGES_GROUP_LABELS.has(normalizeFiliacaoValue(label));

const isPreviewableImageValue = (value: string): boolean => value.trim().length > 0;

const IMMUTABLE_TARGET_FIELD_LABELS = new Set([
  "nome do alvo",
  "cpf",
  "data nascimento",
  "data de nascimento",
]);

const isImmutableTargetRegistrationField = (field: TemplateFieldResponse): boolean =>
  IMMUTABLE_TARGET_FIELD_LABELS.has(normalizeFiliacaoValue(field.label));

export default function ProntuarioGroupSection({
  entryId,
  groupNode,
  drafts,
  disabled = false,
  onFieldChange,
  onAddInstance,
  onRemoveInstance,
}: ProntuarioGroupSectionProps) {
  const displayLabel = getDisplayGroupLabel(groupNode.group.label);
  const compact = isCompactGroup(groupNode.group.label);
  const repeatable = isRepeatableGroup(groupNode.group.label);
  const filiacaoGroup = isFiliacaoGroup(groupNode.group.label);
  const targetImagesGroup = isTargetImagesGroup(groupNode.group.label);
  const showTrashOnRight = filiacaoGroup || targetImagesGroup;
  const editableGroupFields = groupNode.children.filter((field) => !isImmutableTargetRegistrationField(field));
  const groupInstanceIds = Array.from(
    new Set(
      editableGroupFields
        .flatMap((field) =>
          Object.values(drafts)
            .filter((draft) => draft.templateFieldId === field.id && draft.groupInstanceId != null)
            .map((draft) => normalizeGroupInstanceId(draft.groupInstanceId))
        )
        .filter((value): value is string => value != null)
    )
  );

  const hasLegacyVisibleInstance = editableGroupFields.some((field) =>
    hasVisibleDraftValue(drafts[buildTemplateFieldDraftKey(entryId, field.id, null)])
  );

  const repeatableInstancesToRender: Array<string | null> = [
    ...(hasLegacyVisibleInstance ? [null] : []),
    ...groupInstanceIds,
  ];

  const instancesToRender = repeatable
    ? showTrashOnRight
      ? repeatableInstancesToRender
      : repeatableInstancesToRender.length > 0
        ? repeatableInstancesToRender
        : [null]
    : [null];

  const showEmptyRepeatableMessage = repeatable && showTrashOnRight && instancesToRender.length === 0;
  const emptyRepeatableMessage = filiacaoGroup
    ? "Nenhuma filiação adicionada."
    : "Nenhuma imagem do alvo adicionada.";

  if (compact) {
    const editableCompactFields = editableGroupFields;

    if (editableCompactFields.length === 0) {
      return null;
    }

    return (
      <section className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {editableCompactFields.map((field, index) => (
            <div key={field.id} className={index === 0 ? "md:col-span-2 xl:col-span-4" : undefined}>
              <ProntuarioFieldInput
                field={field}
                value={drafts[buildTemplateFieldDraftKey(entryId, field.id, null)]?.valueContent ?? ""}
                disabled={disabled}
                onChange={(nextValue, selectedFile) => onFieldChange(field, null, nextValue, selectedFile)}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!filiacaoGroup && editableGroupFields.length === 0) {
    return null;
  }

  return (
    <Card className="prontuario-surface-card flex flex-col gap-5 text-white">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-white">
            {displayLabel}
          </Typography>
        </div>

        {repeatable ? (
          <Button
            label={filiacaoGroup ? "Adicionar filiação" : "Adicionar item"}
            icon={<Icon icon="add" />}
            className="prontuario-primary-button prontuario-repeatable-add-button"
            onClick={() => onAddInstance(groupNode)}
            disabled={disabled}
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        {showEmptyRepeatableMessage ? (
          <div className="prontuario-instance-card">
            <Typography variant="small" className="text-white">
              {emptyRepeatableMessage}
            </Typography>
          </div>
        ) : null}

        {instancesToRender.map((groupInstanceId, instanceIndex) => (
          <div
            key={groupInstanceId ?? `${groupNode.group.id}-single`}
            className="prontuario-instance-card"
          >
            {repeatable ? (
              <div className="mb-3 flex items-center justify-between gap-3">
                <Typography variant="small" className="text-white">
                  {filiacaoGroup ? `Filiação ${instanceIndex + 1}` : `Item ${instanceIndex + 1}`}
                </Typography>

                {showTrashOnRight ? (
                  <Button
                    icon={<Icon icon="delete" />}
                    rounded
                    outlined
                    className="prontuario-trash-button"
                    onClick={() => onRemoveInstance(groupNode, groupInstanceId)}
                    disabled={disabled}
                    aria-label={
                      filiacaoGroup
                        ? `Remover filiação ${instanceIndex + 1}`
                        : `Remover imagem do alvo ${instanceIndex + 1}`
                    }
                  />
                ) : (
                  <Typography variant="small" className="text-white">
                    {editableGroupFields.length} campo(s)
                  </Typography>
                )}
              </div>
            ) : null}

            {targetImagesGroup ? (
              (() => {
                const imageUploadField = editableGroupFields.find((field) => normalizeInputType(field.inputType) === "INPUT") ?? null;
                const imageDateField = editableGroupFields.find((field) => normalizeInputType(field.inputType) === "DATE") ?? null;

                const prioritizedFieldIds = new Set<number>(
                  [imageUploadField?.id, imageDateField?.id].filter((fieldId): fieldId is number => fieldId != null)
                );

                const remainingFields = editableGroupFields.filter((field) => !prioritizedFieldIds.has(field.id));
                const imagePreviewValue = imageUploadField
                  ? drafts[buildTemplateFieldDraftKey(entryId, imageUploadField.id, groupInstanceId)]?.valueContent ?? ""
                  : "";

                const renderField = (field: TemplateFieldResponse, rightAction: ReactNode = null) => {
                  const draftKey = buildTemplateFieldDraftKey(entryId, field.id, groupInstanceId);
                  const draft = drafts[draftKey];
                  const fieldIndex = editableGroupFields.findIndex((candidateField) => candidateField.id === field.id);
                  const presentation = getFieldPresentationForGroup(groupNode.group.label, field, fieldIndex);

                  return (
                    <ProntuarioFieldInput
                      key={draftKey}
                      field={field}
                      displayLabel={presentation.label}
                      inputTypeOverride={presentation.inputTypeOverride}
                      value={draft?.valueContent ?? ""}
                      disabled={disabled}
                      rightAction={rightAction}
                      onChange={(nextValue, selectedFile) => onFieldChange(field, groupInstanceId, nextValue, selectedFile)}
                    />
                  );
                };

                return (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                      {imageUploadField
                        ? renderField(
                            imageUploadField,
                            isPreviewableImageValue(imagePreviewValue) ? (
                              <ProntuarioImagePreview
                                imageUrl={imagePreviewValue}
                                alt={`Pré-visualização da imagem ${instanceIndex + 1}`}
                              />
                            ) : null
                          )
                        : null}
                      {imageDateField ? renderField(imageDateField) : null}
                    </div>

                    {remainingFields.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {remainingFields.map((field) => renderField(field))}
                      </div>
                    ) : null}
                  </div>
                );
              })()
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {editableGroupFields.map((field, fieldIndex) => {
                  const draftKey = buildTemplateFieldDraftKey(entryId, field.id, groupInstanceId);
                  const draft = drafts[draftKey];
                  const presentation = getFieldPresentationForGroup(groupNode.group.label, field, fieldIndex);
                  const isFiliacaoNameField = filiacaoGroup && normalizeFiliacaoValue(field.label) === "nome";

                  return (
                    <ProntuarioFieldInput
                      key={draftKey}
                      field={field}
                      displayLabel={isFiliacaoNameField ? `Filiação ${instanceIndex + 1}` : presentation.label}
                      inputTypeOverride={presentation.inputTypeOverride}
                      value={draft?.valueContent ?? ""}
                      disabled={disabled}
                      onChange={(nextValue, selectedFile) => onFieldChange(field, groupInstanceId, nextValue, selectedFile)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}