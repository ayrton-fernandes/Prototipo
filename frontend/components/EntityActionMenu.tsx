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
	onSendToPlanning?: () => void;
	editLabel?: string;
	viewDetailsLabel?: string;
	deleteLabel?: string;
	reactivateLabel?: string;
	sendToPlanningLabel?: string;
	showEdit?: boolean;
	showViewDetails?: boolean;
	showDelete?: boolean;
	showReactivate?: boolean;
}

export default function EntityActionMenu({
	active,
	onEdit,
	onViewDetails,
	onDelete,
	onReactivate,
	onSendToPlanning,
	editLabel = "Editar",
	viewDetailsLabel = "Visualizar detalhes",
	deleteLabel = "Excluir",
	reactivateLabel = "Reativar",
	sendToPlanningLabel = "Enviar para planejamento",
	showEdit = true,
	showViewDetails = false,
	showDelete = true,
	showReactivate = false,
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
		...(onSendToPlanning && active
			? [
				{
					label: sendToPlanningLabel,
					icon: <Icon icon="assignment" outline />,
					command: onSendToPlanning,
				},
			]
			: []),
		...(active && showDelete
			? [
				{
					label: deleteLabel,
					icon: <Icon icon="delete" outline />,
					command: onDelete,
				},
			]
			: []),
		...(!active && showReactivate
			? [
				{
					label: reactivateLabel,
					icon: <Icon icon="restart_alt" outline />,
					command: onReactivate,
				},
			]
			: []),
	];

	if (items.length === 0) {
		return null;
	}

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
