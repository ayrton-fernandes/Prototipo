"use client";

import { useId, useRef } from "react";
import { Button, Icon } from "@uigovpe/components";
import { Menu } from "primereact/menu";

interface EntityActionMenuProps {
	active: boolean;
	onEdit: () => void;
	onViewDetails?: () => void;
	onDelete: () => void;
	onReactivate: () => void;
	editLabel?: string;
	viewDetailsLabel?: string;
	deleteLabel?: string;
	reactivateLabel?: string;
	showEdit?: boolean;
	showViewDetails?: boolean;
}

export default function EntityActionMenu({
	active,
	onEdit,
	onViewDetails,
	onDelete,
	onReactivate,
	editLabel = "Editar",
	viewDetailsLabel = "Visualizar detalhes",
	deleteLabel = "Excluir",
	reactivateLabel = "Reativar",
	showEdit = true,
	showViewDetails = false,
}: EntityActionMenuProps) {
	const menu = useRef<Menu>(null);
	const menuId = useId();

	const items = [
		...(showEdit
			? [
				{
					label: editLabel,
					icon: <Icon icon="edit" outline />,
					command: onEdit,
				},
			]
			: []),
		...(showViewDetails && onViewDetails
			? [
				{
					label: viewDetailsLabel,
					icon: <Icon icon="visibility" outline />,
					command: onViewDetails,
				},
			]
			: []),
		{
			label: active ? deleteLabel : reactivateLabel,
			icon: <Icon icon={active ? "delete" : "restart_alt"} outline />,
			command: active ? onDelete : onReactivate,
		},
	];

	return (
		<>
			<Menu
				model={items}
				popup
				ref={menu}
				id={menuId}
				popupAlignment="right"
				className="entity-action-menu"
			/>
			<Button
				icon={<Icon icon="more_vert" />}
				aria-controls={menuId}
				aria-haspopup
				rounded
				outlined
				className="entity-action-trigger"
				onClick={(event) => menu.current?.toggle(event)}
			/>
		</>
	);
}
