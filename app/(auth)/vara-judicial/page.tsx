"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, InputText, Typography } from "@uigovpe/components";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { courtService } from "@/services/courtService";
import CourtTable from "@/app/(auth)/vara-judicial/(components)/CourtTable";
import DeleteDialog from "@/components/DeleteDialog";
import { useCourtsList } from "@/app/(auth)/vara-judicial/(hooks)/useCourtsList";

export default function CourtPage() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const [processingId, setProcessingId] = useState<number | null>(null);
	const [confirmVisible, setConfirmVisible] = useState(false);
	const [targetId, setTargetId] = useState<number | null>(null);
	const { filteredCourts, loading, search, setSearch, refetch } = useCourtsList();

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
			await courtService.deleteById(targetId);
			dispatch(
				showToast({
					severity: "success",
					summary: "Vara judicial inativada",
					detail: "A operação foi concluída com sucesso.",
				})
			);
			await refetch();
		} catch {
			dispatch(
				showToast({
					severity: "error",
					summary: "Falha ao inativar",
					detail: "Não foi possível inativar a vara judicial.",
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
			await courtService.reactivateById(id);
			dispatch(
				showToast({
					severity: "success",
					summary: "Vara judicial reativada",
					detail: "A operação foi concluída com sucesso.",
				})
			);
			await refetch();
		} catch {
			dispatch(
				showToast({
					severity: "error",
					summary: "Falha ao reativar",
					detail: "Não foi possível reativar a vara judicial.",
				})
			);
		} finally {
			setProcessingId(null);
		}
	};

	return (
		<>
			<section className="mb-6">
				<Typography variant="h1" className="mb-2 text-black">
					Gestão de varas judiciais
				</Typography>

				<Typography variant="p" className="text-slate-500">Gerencie o domínio de varas judiciais do sistema.</Typography>
			</section>

			<Card title="Varas judiciais" elevation="low">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
						<div className="w-full md:max-w-sm">
							<InputText
								label="Buscar vara judicial"
								placeholder="Digite nome ou código"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
							/>
						</div>

						<Button
							label="Cadastrar nova vara"
							onClick={() => router.push("/vara-judicial/cadastrar")}
							disabled={isProcessing}
						/>
					</div>

					<CourtTable
						items={filteredCourts}
						loading={loading || isProcessing}
						onEdit={(id) => router.push(`/vara-judicial/${id}`)}
						onDelete={handleDelete}
						onReactivate={handleReactivate}
					/>
				</div>
			</Card>

			<DeleteDialog
				visible={confirmVisible}
				entity="vara judicial"
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
