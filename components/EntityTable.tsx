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

const headerCellStyle = {
	headerCell: {
		className: "font-bold text-sm",
	},
};

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

	const tableData = items.map((item) => ({
		...item,
		status: (
			<Tag
				value={item.active ? "ATIVO" : "INATIVO"}
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
			tableStyle={{ width: "100%" }}
			pt={{
				bodyRow: {
					className: "text-sm font-normal",
				},
			}}
		>
			<Column field="descName" header={nameHeader} style={{ width: showCodeName ? "36%" : "60%" }} pt={headerCellStyle} />
			{showCodeName && <Column field="codeName" header="Código" style={{ width: "30%" }} pt={headerCellStyle} />}
			<Column field="status" header="Status" style={{ width: "18%" }} pt={headerCellStyle} />
			<Column field="action" header="Ação" style={{ width: "16%" }} pt={headerCellStyle} />
		</Table>
	);
}
