"use client";

import { Button, InputText, RadioButton, Typography } from "@uigovpe/components";

export interface EntityFormErrors {
	descName?: string;
}

export interface EntityFormState {
	descName: string;
}

interface EntityFormProps {
	title: string;
	submitLabel: string;
	form: EntityFormState;
	errors: EntityFormErrors;
	loading: boolean;
	showStatusControls?: boolean;
	isActive?: boolean;
	statusLoading?: boolean;
	onStatusChange?: (nextActive: boolean) => void;
	nameLabel?: string;
	namePlaceholder?: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
}

export default function EntityForm({
	title,
	submitLabel,
	form,
	errors,
	loading,
	showStatusControls = false,
	isActive = true,
	statusLoading = false,
	onStatusChange,
	nameLabel = "Nome",
	namePlaceholder = "Digite o nome",
	onChange,
	onSubmit,
}: EntityFormProps) {
	return (
		<div className="flex flex-col gap-5">
			<Typography variant="h4">{title}</Typography>

			<InputText
				label={nameLabel}
				value={form.descName}
				onChange={(event) => onChange(event.target.value)}
				invalid={!!errors.descName}
				supportText={errors.descName}
				placeholder={namePlaceholder}
			/>

			{showStatusControls && (
				<div className="flex flex-col gap-2">
					<Typography variant="p">Status</Typography>
					<div className="flex items-center gap-8">
						<RadioButton
							inputId="status-active"
							label="Ativo"
							checked={isActive}
							disabled={loading || statusLoading}
							onChange={() => onStatusChange?.(true)}
						/>
						<RadioButton
							inputId="status-inactive"
							label="Inativo"
							checked={!isActive}
							disabled={loading || statusLoading}
							onChange={() => onStatusChange?.(false)}
						/>
					</div>
				</div>
			)}

			<div className="flex justify-end">
				<Button label={submitLabel} onClick={onSubmit} loading={loading} />
			</div>
		</div>
	);
}
