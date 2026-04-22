"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, InputText, Typography } from "@uigovpe/components";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { domainStationService } from "@/services/domainStationService";
import StationTable from "@/app/(auth)/delegacias/(components)/StationTable";
import DeleteDialog from "@/components/DeleteDialog";
import { useStationsList } from "@/app/(auth)/delegacias/(hooks)/useStationsList";

export default function StationPage() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const [processingId, setProcessingId] = useState<number | null>(null);
	const [confirmVisible, setConfirmVisible] = useState(false);
	const [targetId, setTargetId] = useState<number | null>(null);
	const { filteredStations, loading, search, setSearch, refetch } = useStationsList();

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
			await domainStationService.deleteById(targetId);
			dispatch(
				showToast({
					severity: "success",
					summary: "Delegacia inativada",
					detail: "A operação foi concluída com sucesso.",
				})
			);
			await refetch();
		} catch {
			dispatch(
				showToast({
					severity: "error",
					summary: "Falha ao inativar",
					detail: "Não foi possível inativar a delegacia.",
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
			await domainStationService.reactivateById(id);
			dispatch(
				showToast({
					severity: "success",
					summary: "Delegacia reativada",
					detail: "A operação foi concluída com sucesso.",
				})
			);
			await refetch();
		} catch {
			dispatch(
				showToast({
					severity: "error",
					summary: "Falha ao reativar",
					detail: "Não foi possível reativar a delegacia.",
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
					Gestão de delegacias
				</Typography>

				<Typography variant="p" className="cpo-page-subtitle">
					Gerencie o domínio de delegacias do sistema.
				</Typography>
			</section>

			<Card title="Delegacias" elevation="low" className="cpo-text-on-dark">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
						<div className="w-full md:max-w-sm">
							<InputText
								label="Buscar delegacia"
								placeholder="Digite nome ou código"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
							/>
						</div>

						<Button
							label="Cadastrar nova delegacia"
							onClick={() => router.push("/delegacias/cadastrar")}
							disabled={isProcessing}
						/>
					</div>

					<StationTable
						items={filteredStations}
						loading={loading || isProcessing}
						onEdit={(id) => router.push(`/delegacias/${id}`)}
						onDelete={handleDelete}
						onReactivate={handleReactivate}
					/>
				</div>
			</Card>

			<DeleteDialog
				visible={confirmVisible}
				entity="delegacia"
				loading={isProcessing}
				dialogClassName="operation-members-delete-dialog"
				cancelButtonClassName="prontuario-dialog-cancel-button"
				confirmButtonClassName="operation-members-submit-button"
				confirmButtonDanger={false}
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

