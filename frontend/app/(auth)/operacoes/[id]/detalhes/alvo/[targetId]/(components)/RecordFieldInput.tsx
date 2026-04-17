"use client";

import { ChangeEvent, ReactNode, useRef, useState } from "react";
import { Button, Dropdown, Icon, InputText, InputTextarea, Typography } from "@uigovpe/components";
import { maskDateInput } from "@/utils/formatters";
import { TemplateFieldResponse } from "@/domain/types/templateField";
import {
  CanonicalInputType,
  DropdownOption,
  getDropdownOptionsForField,
  normalizeInputType,
  shouldUseTextarea,
} from "@/app/(auth)/operacoes/[id]/detalhes/alvo/[targetId]/(utils)/record";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/jpg,image/webp,image/gif";

interface ProntuarioFieldInputProps {
  field: TemplateFieldResponse;
  value: string;
  displayLabel?: string;
  inputTypeOverride?: CanonicalInputType | null;
  disabled?: boolean;
  rightAction?: ReactNode;
  onChange: (nextValue: string) => void;
}

export default function ProntuarioFieldInput({
  field,
  value,
  displayLabel,
  inputTypeOverride = null,
  disabled = false,
  rightAction = null,
  onChange,
}: ProntuarioFieldInputProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputType = inputTypeOverride ?? normalizeInputType(field.inputType);
  const fieldLabel = displayLabel ?? field.label;
  const hasImageValue = value.trim().length > 0;
  const uploadStatusLabel = selectedFileName || (hasImageValue ? "Imagem carregada." : "Nenhum arquivo escolhido.");

  if (inputType === "GROUP") {
    return null;
  }

  const dropdownOptions: DropdownOption[] | null = inputType === "DROPDOWN" ? getDropdownOptionsForField(field.label) : null;
  const isTextarea = inputType === "TEXT" && shouldUseTextarea(fieldLabel);

  if (dropdownOptions) {
    return (
      <div className="flex flex-col gap-1.5">
        <Dropdown
          label={fieldLabel}
          placeholder={`Selecione ${fieldLabel.toLowerCase()}`}
          options={dropdownOptions}
          value={value || null}
          onChange={(event) => onChange(String(event.value ?? ""))}
          disabled={disabled}
          invalid={false}
        />
      </div>
    );
  }

  if (isTextarea) {
    return (
      <InputTextarea
        label={fieldLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        disabled={disabled}
      />
    );
  }

  if (inputType === "INPUT") {
    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];

      if (!selectedFile) {
        return;
      }

      if (!selectedFile.type.startsWith("image/")) {
        setUploadError("Selecione um arquivo de imagem válido.");
        setSelectedFileName("");
        event.target.value = "";
        return;
      }

      if (selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
        setUploadError("A imagem deve ter no máximo 5 MB.");
        setSelectedFileName("");
        event.target.value = "";
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result !== "string" || reader.result.trim().length === 0) {
          setUploadError("Não foi possível ler a imagem selecionada.");
          return;
        }

        setUploadError(null);
        setSelectedFileName(selectedFile.name);
        onChange(reader.result);
      };

      reader.onerror = () => {
        setUploadError("Não foi possível processar a imagem selecionada.");
        setSelectedFileName("");
      };

      reader.readAsDataURL(selectedFile);
      event.target.value = "";
    };

    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">{fieldLabel}</label>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          onChange={handleImageChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="prontuario-image-upload-row">
          <div className="prontuario-image-upload-input-group">
            <Button
              label="Escolher arquivo"
              icon={<Icon icon="upload_file" />}
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            />

            <Typography variant="small" className="prontuario-image-upload-file-name">
              {uploadStatusLabel}
            </Typography>
          </div>

          {rightAction ? <div className="prontuario-image-upload-preview-action">{rightAction}</div> : null}
        </div>

        <Typography variant="small" className="text-slate-500">
          Envie uma imagem do dispositivo (PNG, JPG, WEBP ou GIF, até 5 MB).
        </Typography>

        {uploadError ? (
          <Typography variant="small" className="cpo-form-support-error">
            {uploadError}
          </Typography>
        ) : null}

        {hasImageValue ? (
          <Typography variant="small" className="text-slate-600">
            Imagem pronta para salvar nesta seção.
          </Typography>
        ) : null}
      </div>
    );
  }

  const placeholder = inputType === "DATE"
    ? "dd/mm/aaaa"
    : inputType === "NUMBER"
        ? "Digite apenas números"
        : fieldLabel;

  return (
    <InputText
      label={fieldLabel}
      value={value}
      placeholder={placeholder}
      inputMode={inputType === "NUMBER" ? "numeric" : undefined}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        const nextValue = inputType === "DATE" ? maskDateInput(event.target.value) : event.target.value;
        onChange(nextValue);
      }}
      disabled={disabled}
    />
  );
}