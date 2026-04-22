"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, InputText, Typography } from "@uigovpe/components";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { domainDepartmentService } from "@/services/domainDepartmentService";
import DepartmentTable from "@/app/(auth)/departamentos/(components)/DepartmentTable";
import DeleteDialog from "@/components/DeleteDialog";
import { useDepartmentsList } from "@/app/(auth)/departamentos/(hooks)/useDepartmentsList";

export default function DepartmentPage() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const [processingId, setProcessingId] = useState<number | null>(null);
	const [confirmVisible, setConfirmVisible] = useState(false);
	const [targetId, setTargetId] = useState<number | null>(null);
	const { filteredDepartments, loading, search, setSearch, refetch } = useDepartmentsList();

	const isProcessing = useMemo(() => processingId !== null, [processingId]);

	const handleDelete = async (id: number) => {
		setTargetId(id);
		setConfirmVisible(true);
	};

	const handleConfirmDelete = async () => {
		if (targetId == null) return;

		setProcessingId(targetId);
		setConfirmVisible(false);

		try {
			await domainDepartmentService.deleteById(targetId);
			dispatch(
				showToast({
					severity: "success",
					summary: "Departamento inativado",
					detail: "A operação foi concluída com sucesso.",
				})
			);
			await refetch();
		} catch {
			dispatch(
				showToast({
					severity: "error",
					summary: "Falha ao inativar",
					detail: "Não foi possível inativar o departamento.",
				})
			);
		} finally {
			setProcessingId(null);
			setTargetId(null);
		}
	};

	const handleReactivate = async (id: number) => {
		setProcessingId(id);
		try {
			await domainDepartmentService.reactivateById(id);
			dispatch(
				showToast({
					severity: "success",
					summary: "Departamento reativado",
					detail: "A operação foi concluída com sucesso.",
				})
			);
			await refetch();
		} catch {
			dispatch(
				showToast({
					severity: "error",
					summary: "Falha ao reativar",
					detail: "Não foi possível reativar o departamento.",
				})
			);
		} finally {
			setProcessingId(null);
		}
	};

	return (
		<>
			<section className="mb-6">
				<Typography variant="h1" className="mb-2 cpo-page-title">
					Gestão de departamentos
				</Typography>

				<Typography variant="p" className="cpo-page-subtitle">Gerencie o domínio de departamentos do sistema.</Typography>
			</section>

			<Card title="Departamentos" elevation="low" className="cpo-text-on-dark">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
						<div className="w-full md:max-w-sm">
							<InputText
								label="Buscar departamento"
								placeholder="Digite nome ou código"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
							/>
						</div>

						<Button
							label="Cadastrar novo departamento"
							onClick={() => router.push("/departamentos/cadastrar")}
							disabled={isProcessing}
						/>
					</div>

					<DepartmentTable
						items={filteredDepartments}
						loading={loading || isProcessing}
						onEdit={(id) => router.push(`/departamentos/${id}`)}
						onDelete={handleDelete}
						onReactivate={handleReactivate}
					/>
				</div>
			</Card>

			<DeleteDialog
				visible={confirmVisible}
				entity="departamento"
				loading={isProcessing}
				onHide={() => {
					if (isProcessing) return;
					setConfirmVisible(false);
					setTargetId(null);
				}}
				onConfirm={handleConfirmDelete}
			/>
		</>
	);
}
