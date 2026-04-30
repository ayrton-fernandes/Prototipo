"use client";

import { ReactNode } from "react";
import { Button, Card, Icon, Typography } from "@uigovpe/components";
import { TemplateFieldResponse } from "@/domain/types/templateField";
import ProntuarioFieldInput from "@/app/(auth)/operacoes/[id]/detalhes/alvo/[targetId]/(components)/RecordFieldInput";
import ProntuarioImagePreview from "@/app/(auth)/operacoes/[id]/detalhes/alvo/[targetId]/(components)/RecordImagePreview";
import {
  buildTemplateFieldDraftKey,
  getGroupNodeFieldIds,
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
  onFieldChange: (field: TemplateFieldResponse, groupInstanceId: string | null, nextValue: string, entryId: number, selectedFile?: File) => void;
  onAddInstance: (groupNode: TemplateGroupNode, entryId: number) => void;
  onRemoveInstance: (groupNode: TemplateGroupNode, groupInstanceId: string | null, entryId: number) => void;
}

const normalizeFiliacaoValue = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const hasVisibleDraftValue = (draft?: ProntuarioFieldDraft): boolean =>
  Boolean(draft && (draft.fieldValueId != null || draft.valueContent.trim().length > 0));

const TARGET_IMAGES_GROUP_LABELS = new Set(["fotos do alvo", "imagem do alvo", "imagens do alvo"].map(normalizeFiliacaoValue));

const isTargetImagesGroup = (label: string): boolean => TARGET_IMAGES_GROUP_LABELS.has(normalizeFiliacaoValue(label));

const ADDITIONAL_TRASH_GROUPS = new Set([
  "pessoas envolvidas",
  "hospitais / upas",
  "endereços do alvo",
  "endereço hospitais / upas",
  "endereço",
].map(normalizeFiliacaoValue));

const shouldShowTrashOnRight = (label: string): boolean => {
  const normalized = normalizeFiliacaoValue(label);
  return (
    normalized === "filiacao" ||
    isTargetImagesGroup(normalized) ||
    ADDITIONAL_TRASH_GROUPS.has(normalized)
  );
};

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
  const renderNode = (node: TemplateGroupNode, nestingLevel: number, renderInstanceId: string | null, instanceIndex: number) => {
    const displayLabel = getDisplayGroupLabel(node.group.label);
    const compact = isCompactGroup(node.group.label);
    const repeatable = isRepeatableGroup(node.group.label);
    const filiacaoGroup = isFiliacaoGroup(node.group.label);
    const targetImagesGroup = isTargetImagesGroup(node.group.label);
    const showTrashOnRight = shouldShowTrashOnRight(node.group.label);
    const rawEditableGroupFields = node.children.filter((field) => !isImmutableTargetRegistrationField(field));
    // If this group has a nested "Imagens do Local do Endereço" subgroup, avoid showing
    // duplicate single-image fields at the parent level (they will be handled in the subgroup).
    const hasImageLocalSubgroup = node.subgroups.some((s) => normalizeFiliacaoValue(s.group.label) === normalizeFiliacaoValue("Imagens do Local do Endereço") || isTargetImagesGroup(s.group.label));

    const editableGroupFields = rawEditableGroupFields.filter((field) => {
      if (hasImageLocalSubgroup && normalizeInputType(field.inputType) === "INPUT") {
        const normalizedFieldLabel = normalizeFiliacaoValue(field.label);
        if (normalizedFieldLabel.includes("imagem") || normalizedFieldLabel.includes("foto")) {
          return false;
        }
      }

      return true;
    });
    const nestedGroupFields = node.subgroups.flatMap((subgroup) => getGroupNodeFieldIds(subgroup));
    const allFieldIds = new Set([...editableGroupFields.map((field) => field.id), ...nestedGroupFields]);

    const renderField = (field: TemplateFieldResponse, rightAction: ReactNode = null) => {
      const draftKey = buildTemplateFieldDraftKey(entryId, field.id, renderInstanceId);
      const draft = drafts[draftKey];
      const fieldIndex = editableGroupFields.findIndex((candidateField) => candidateField.id === field.id);
      const presentation = getFieldPresentationForGroup(node.group.label, field, fieldIndex);

      return (
        <ProntuarioFieldInput
          key={draftKey}
          field={field}
          displayLabel={presentation.label}
          inputTypeOverride={presentation.inputTypeOverride}
          value={draft?.valueContent ?? ""}
          disabled={disabled}
          rightAction={rightAction}
          onChange={(nextValue, selectedFile) => onFieldChange(field, renderInstanceId, nextValue, entryId, selectedFile)}
        />
      );
    };

    const renderNestedGroup = (subgroup: TemplateGroupNode) => {
      const subgroupFields = subgroup.children.filter((field) => !isImmutableTargetRegistrationField(field));
      const repeatableSubgroup = isRepeatableGroup(subgroup.group.label);
      const subgroupDisplayLabel = getDisplayGroupLabel(subgroup.group.label);

      if (subgroupFields.length === 0 && subgroup.subgroups.length === 0) {
        return null;
      }

      // If repeatable, we should theoretically render instances, but for now we simplify 
      // by allowing the group itself to have an "Add" button if repeatable.
      return (
        <div key={`${subgroup.group.id}-${renderInstanceId ?? "single"}`} className="rounded-xl border border-dashed border-slate-300/70 bg-white/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <Typography variant="h5">{subgroupDisplayLabel}</Typography>
            {!disabled && repeatableSubgroup ? (
              <Button
                label="Adicionar item"
                icon={<Icon icon="add" />}
                size="small"
                className="prontuario-primary-button"
                onClick={() => onAddInstance(subgroup, entryId)}
              />
            ) : null}
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {subgroupFields.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {subgroupFields.map((field, fieldIndex) => {
                  const draftKey = buildTemplateFieldDraftKey(entryId, field.id, renderInstanceId);
                  const draft = drafts[draftKey];
                  const presentation = getFieldPresentationForGroup(subgroup.group.label, field, fieldIndex);

                  return (
                    <ProntuarioFieldInput
                      key={draftKey}
                      field={field}
                      displayLabel={presentation.label}
                      inputTypeOverride={presentation.inputTypeOverride}
                      value={draft?.valueContent ?? ""}
                      disabled={disabled}
                      onChange={(nextValue, selectedFile) => onFieldChange(field, renderInstanceId, nextValue, entryId, selectedFile)}
                    />
                  );
                })}
              </div>
            ) : null}

            {subgroup.subgroups.length > 0 ? (
              <div className="flex flex-col gap-4">
                {subgroup.subgroups.map((nestedSubgroup) => renderNestedGroup(nestedSubgroup))}
              </div>
            ) : null}
          </div>
        </div>
      );
    };

    const groupInstances = Array.from(
      new Set(
        editableGroupFields
          .flatMap((field) =>
            Object.values(drafts)
              .filter((draft) => draft.templateFieldId != null && allFieldIds.has(draft.templateFieldId))
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
      ...groupInstances,
    ];

    const instancesToRender = repeatable
      ? showTrashOnRight
        ? repeatableInstancesToRender
        : repeatableInstancesToRender.length > 0
          ? repeatableInstancesToRender
          : [null]
      : [null];

    const showEmptyRepeatableMessage = repeatable && showTrashOnRight && instancesToRender.length === 0;

    const getEmptyRepeatableMessage = () => {
      const normalized = normalizeFiliacaoValue(node.group.label);
      if (normalized === "filiacao") return "Nenhuma filiação adicionada.";
      if (isTargetImagesGroup(normalized)) return "Nenhuma imagem do alvo adicionada.";
      if (normalized === "pessoas envolvidas") return "Nenhuma pessoa relacionada adicionada.";
      if (normalized === "hospitais / upas") return "Nenhum hospital/UPA adicionado.";
      if (normalized === "endereço" || normalized === "endereços do alvo") return "Nenhum endereço adicionado.";
      return "Nenhum item adicionado.";
    };

    if (compact) {
      if (editableGroupFields.length === 0) {
        return null;
      }

      return (
        <section className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {editableGroupFields.map((field, index) => (
              <div key={field.id} className={index === 0 ? "md:col-span-2 xl:col-span-4" : undefined}>
                <ProntuarioFieldInput
                  field={field}
                  value={drafts[buildTemplateFieldDraftKey(entryId, field.id, renderInstanceId)]?.valueContent ?? ""}
                  disabled={disabled}
                  onChange={(nextValue, selectedFile) => onFieldChange(field, renderInstanceId, nextValue, entryId, selectedFile)}
                />
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (!filiacaoGroup && editableGroupFields.length === 0 && node.subgroups.length === 0) {
      return null;
    }

    return (
      <Card className={`prontuario-surface-card flex flex-col gap-5 ${nestingLevel > 0 ? "border border-dashed border-slate-300/70 bg-white/70" : ""}`}>
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1">
            <Typography variant="h4">{displayLabel}</Typography>
          </div>

          {!disabled && repeatable ? (
            <Button
              label={filiacaoGroup ? "Adicionar filiação" : "Adicionar item"}
              icon={<Icon icon="add" />}
              className="prontuario-primary-button prontuario-repeatable-add-button"
              onClick={() => onAddInstance(node, entryId)}
              disabled={disabled}
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          {showEmptyRepeatableMessage ? (
            <div className="prontuario-instance-card">
              <Typography variant="small">{getEmptyRepeatableMessage()}</Typography>
            </div>
          ) : null}

          {instancesToRender.map((groupInstanceId, currentInstanceIndex) => (
            <div key={`${groupInstanceId ?? `${node.group.id}-single`}-${currentInstanceIndex}`} className="prontuario-instance-card">
              {repeatable ? (
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Typography variant="small">
                    {filiacaoGroup ? `Filiação ${currentInstanceIndex + 1}` : `Item ${currentInstanceIndex + 1}`}
                  </Typography>

                  {!disabled && showTrashOnRight ? (
                    <Button
                      icon={<Icon icon="delete" />}
                      rounded
                      outlined
                      className="prontuario-trash-button"
                      onClick={() => onRemoveInstance(node, groupInstanceId, entryId)}
                      disabled={disabled}
                      aria-label={`Remover ${filiacaoGroup ? "filiação" : "item"} ${currentInstanceIndex + 1}`}
                    />
                  ) : (
                    <Typography variant="small">{editableGroupFields.length} campo(s)</Typography>
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

                  return (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-4">
                        {imageUploadField
                          ? renderField(
                              imageUploadField,
                              isPreviewableImageValue(imagePreviewValue) ? (
                                <ProntuarioImagePreview
                                  imageUrl={imagePreviewValue}
                                  alt={`Pré-visualização da imagem ${currentInstanceIndex + 1}`}
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

                      {node.subgroups.length > 0 ? (
                        <div className="flex flex-col gap-4">
                          {node.subgroups.map((subgroup) => renderNestedGroup(subgroup))}
                        </div>
                      ) : null}
                    </div>
                  );
                })()
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {editableGroupFields.map((field, fieldIndex) => {
                      const draftKey = buildTemplateFieldDraftKey(entryId, field.id, groupInstanceId);
                      const draft = drafts[draftKey];
                      const presentation = getFieldPresentationForGroup(node.group.label, field, fieldIndex);
                      const isFiliacaoNameField = filiacaoGroup && normalizeFiliacaoValue(field.label) === "nome";

                      return (
                        <ProntuarioFieldInput
                          key={draftKey}
                          field={field}
                          displayLabel={isFiliacaoNameField ? `Filiação ${currentInstanceIndex + 1}` : presentation.label}
                          inputTypeOverride={presentation.inputTypeOverride}
                          value={draft?.valueContent ?? ""}
                          disabled={disabled}
                          onChange={(nextValue, selectedFile) => onFieldChange(field, groupInstanceId, nextValue, entryId, selectedFile)}
                        />
                      );
                    })}
                  </div>

                  {node.subgroups.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {node.subgroups.map((subgroup) => renderNestedGroup(subgroup))}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return renderNode(groupNode, 0, null, 0);
}