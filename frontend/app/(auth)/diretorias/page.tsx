"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, InputText, Typography } from "@uigovpe/components";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { directorateService } from "@/services/directorateService";
import DirectorateTable from "@/app/(auth)/diretorias/(components)/DirectorateTable";
import DeleteDialog from "@/components/DeleteDialog";
import { useDirectoratesList } from "@/app/(auth)/diretorias/(hooks)/useDirectoratesList";

export default function DirectoratePage() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const [processingId, setProcessingId] = useState<number | null>(null);
	const [confirmVisible, setConfirmVisible] = useState(false);
	const [targetId, setTargetId] = useState<number | null>(null);
	const { filteredDirectorates, loading, search, setSearch, refetch } = useDirectoratesList();

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
			await directorateService.deleteById(targetId);
			dispatch(
				showToast({
					severity: "success",
					summary: "Diretoria inativada",
					detail: "A operação foi concluída com sucesso.",
				})
			);
			await refetch();
		} catch {
			dispatch(
				showToast({
					severity: "error",
					summary: "Falha ao inativar",
					detail: "Não foi possível inativar a diretoria.",
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
			await directorateService.reactivateById(id);
			dispatch(
				showToast({
					severity: "success",
					summary: "Diretoria reativada",
					detail: "A operação foi concluída com sucesso.",
				})
			);
			await refetch();
		} catch {
			dispatch(
				showToast({
					severity: "error",
					summary: "Falha ao reativar",
					detail: "Não foi possível reativar a diretoria.",
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
					Gestão de diretorias
				</Typography>

				<Typography variant="p" className="cpo-page-subtitle">
					Gerencie o domínio de diretorias do sistema.
				</Typography>
			</section>

			<Card title="Diretorias" elevation="low">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
						<div className="w-full md:max-w-sm">
							<InputText
								label="Buscar diretoria"
								placeholder="Digite nome ou código"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
							/>
						</div>

						<Button
							label="Cadastrar nova diretoria"
							onClick={() => router.push("/diretorias/cadastrar")}
							disabled={isProcessing}
						/>
					</div>

					<DirectorateTable
						items={filteredDirectorates}
						loading={loading || isProcessing}
						onEdit={(id) => router.push(`/diretorias/${id}`)}
						onDelete={handleDelete}
						onReactivate={handleReactivate}
					/>
				</div>
			</Card>

				<DeleteDialog
					visible={confirmVisible}
					entity="diretoria"
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
