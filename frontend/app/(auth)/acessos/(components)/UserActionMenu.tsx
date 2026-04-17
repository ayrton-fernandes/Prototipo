"use client";

import { Button, Icon } from "@uigovpe/components";
import { Menu } from "primereact/menu";
import { useId, useRef } from "react";

interface UserActionMenuProps {
	active: boolean;
	onEdit: () => void;
	onDelete: () => void;
	onReactivate: () => void;
}

export default function UserActionMenu({
	active,
	onEdit,
	onDelete,
	onReactivate,
}: UserActionMenuProps) {
	const menu = useRef<Menu>(null);
	const menuId = useId();

	const items = [
		{
			label: "Editar",
			icon: <Icon icon="edit" outline />,
			command: onEdit,
		},
		{
			label: active ? "Excluir" : "Reativar",
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
				pt={{
					menu: { className: "entity-action-menu-list" },
					menuitem: { className: "entity-action-menu-item" },
					content: { className: "entity-action-menu-content" },
					action: { className: "entity-action-menu-link" },
					icon: { className: "entity-action-menu-icon" },
					label: { className: "entity-action-menu-label" },
				}}
			/>
			<Button
				icon={<Icon icon="more_vert" />}
				aria-controls={menuId}
				aria-haspopup
				rounded
				outlined
				onClick={(event) => menu.current?.toggle(event)}
			/>
		</>
	);
}
