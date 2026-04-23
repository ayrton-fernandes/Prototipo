"use client";

import { Column, Table, Tag, Typography } from "@uigovpe/components";
import { BaseResponseDTO } from "@/domain/types/base";
import EntityActionMenu from "@/components/EntityActionMenu";

interface EntityTableProps {
	items: BaseResponseDTO[];
	loading: boolean;
	emptyMessage?: string;
	nameHeader?: string;
	showCodeName?: boolean;
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
	onReactivate: (id: number) => void;
}

export default function EntityTable({
	items,
	loading,
	emptyMessage = "Nenhum registro encontrado.",
	nameHeader = "Nome",
	showCodeName = true,
	onEdit,
	onDelete,
	onReactivate,
}: EntityTableProps) {
	if (!loading && items.length === 0) {
		return (
			<Typography variant="p" className="text-sm">
				{emptyMessage}
			</Typography>
		);
	}

	const tableClassName = showCodeName
		? "table-list table-list--standard-with-code"
		: "table-list table-list--standard-without-code";

	const tableData = items.map((item) => ({
		...item,
		status: (
			<Tag
				value={item.active ? "Ativo" : "Inativo"}
				severity={item.active ? "success" : "danger"}
			/>
		),
		action: (
			<EntityActionMenu
				active={item.active}
				onEdit={() => onEdit(item.id)}
				onDelete={() => onDelete(item.id)}
				onReactivate={() => onReactivate(item.id)}
			/>
		),
	}));

	return (
		<Table
			value={tableData}
			loading={loading}
			pt={{
				root: {
					className: tableClassName,
				},
			}}
		>
			<Column field="descName" header={nameHeader} />
			{showCodeName && <Column field="codeName" header="Código" />}
			<Column field="status" header="Status" />
			<Column field="action" header="Ação" />
		</Table>
	);
}
