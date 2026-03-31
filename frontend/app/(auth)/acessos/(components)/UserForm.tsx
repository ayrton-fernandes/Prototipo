"use client";

import { Button, Dropdown, InputPassword, InputText, RadioButton, Typography } from "@uigovpe/components";
import { ProfileOption, UserFormErrors, UserFormState } from "@/app/(auth)/acessos/(types)/userForm";

interface UserFormProps {
	title: string;
	submitLabel: string;
	form: UserFormState;
	errors: UserFormErrors;
	loading: boolean;
	profileOptions: ProfileOption[];
	showStatusControls?: boolean;
	isActive?: boolean;
	statusLoading?: boolean;
	onStatusChange?: (nextActive: boolean) => void;
	disableRoleSelection?: boolean;
	onChange: <K extends keyof UserFormState>(field: K, value: UserFormState[K]) => void;
	onSubmit: () => void;
}

export default function UserForm({
	title,
	submitLabel,
	form,
	errors,
	loading,
	profileOptions,
	showStatusControls = false,
	isActive = true,
	statusLoading = false,
	onStatusChange,
	disableRoleSelection = false,
	onChange,
	onSubmit,
}: UserFormProps) {
	return (
		<div className="flex flex-col gap-5">
			<Typography variant="h4">{title}</Typography>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<InputText
					label="Nome"
					value={form.name}
					onChange={(event) => onChange("name", event.target.value)}
					invalid={!!errors.name}
					supportText={errors.name}
					placeholder="Digite o nome completo"
				/>

				<InputText
					label="E-mail"
					value={form.email}
					onChange={(event) => onChange("email", event.target.value)}
					invalid={!!errors.email}
					supportText={errors.email}
					placeholder="Digite o e-mail"
				/>

				<InputPassword
					label={disableRoleSelection ? "Nova senha (opcional)" : "Senha"}
					value={form.password}
					onChange={(event) => onChange("password", event.target.value)}
					invalid={!!errors.password}
					supportText={errors.password}
					placeholder={disableRoleSelection ? "Preencha apenas se desejar alterar" : "Digite a senha"}
				/>

				<div className="flex flex-col gap-1">
					<Dropdown
						label="Perfil"
						options={profileOptions}
						value={form.role || null}
						onChange={(event) => onChange("role", (event.value ?? "") as UserFormState["role"])}
						invalid={!!errors.role}
						placeholder="Selecione o perfil"
						disabled={disableRoleSelection}
					/>
					<Typography variant="small" className={errors.role ? "text-red-600" : "text-slate-500"}>
						{errors.role ||
							(disableRoleSelection
								? "Seleção de perfil bloqueada para este formulário."
								: "Escolha o perfil que será vinculado ao usuário.")}
					</Typography>
				</div>
			</div>

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
