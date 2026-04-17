"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, InputText, Typography } from "@uigovpe/components";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { delegateService } from "@/services/delagateService";
import DelegateTable from "@/app/(auth)/delegados/(components)/DelegateTable";
import DeleteDialog from "@/components/DeleteDialog";
import { useDelegatesList } from "@/app/(auth)/delegados/(hooks)/useDelegatesList";

export default function DelegatePage() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const [processingId, setProcessingId] = useState<number | null>(null);
	const [confirmVisible, setConfirmVisible] = useState(false);
	const [targetId, setTargetId] = useState<number | null>(null);
	const { filteredDelegates, loading, search, setSearch, refetch } = useDelegatesList();

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
			await delegateService.deleteById(targetId);
			dispatch(
				showToast({
					severity: "success",
					summary: "Delegado inativado",
					detail: "A operação foi concluída com sucesso.",
				})
			);
			await refetch();
		} catch {
			dispatch(
				showToast({
					severity: "error",
					summary: "Falha ao inativar",
					detail: "Não foi possível inativar o delegado.",
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
			await delegateService.reactivateById(id);
			dispatch(
				showToast({
					severity: "success",
					summary: "Delegado reativado",
					detail: "A operação foi concluída com sucesso.",
				})
			);
			await refetch();
		} catch {
			dispatch(
				showToast({
					severity: "error",
					summary: "Falha ao reativar",
					detail: "Não foi possível reativar o delegado.",
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
					Gestão de delegados
				</Typography>

				<Typography variant="p" className="cpo-page-subtitle">Gerencie o domínio de delegados do sistema.</Typography>
			</section>

			<Card title="Delegados" elevation="low">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
						<div className="w-full md:max-w-sm">
							<InputText
								label="Buscar delegado"
								placeholder="Digite nome ou código"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
							/>
						</div>

						<Button
							label="Cadastrar novo delegado"
							onClick={() => router.push("/delegados/cadastrar")}
							disabled={isProcessing}
						/>
					</div>

					<DelegateTable
						items={filteredDelegates}
						loading={loading || isProcessing}
						onEdit={(id) => router.push(`/delegados/${id}`)}
						onDelete={handleDelete}
						onReactivate={handleReactivate}
					/>
				</div>
			</Card>

			<DeleteDialog
				visible={confirmVisible}
				entity="delegado"
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
