"use client";

import { Column, Table, Tag, Typography } from "@uigovpe/components";
import { UserListItem } from "@/domain/types/userManagement";
import UserActionMenu from "./UserActionMenu";

interface UsersTableProps {
  users: UserListItem[];
  profileDescriptionByCode: Record<string, string>;
  loading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onReactivate: (id: number) => void;
}

export default function UsersTable({
  users,
  profileDescriptionByCode,
  loading,
  onEdit,
  onDelete,
  onReactivate,
}: UsersTableProps) {
  if (!loading && users.length === 0) {
    return (
      <Typography variant="p" className="text-sm">
        Nenhum usuário encontrado.
      </Typography>
    );
  }

  const tableData = users.map((user) => ({
    ...user,
    status: (
      <Tag value={user.active ? "Ativo" : "Inativo"} severity={user.active ? "success" : "danger"} />
    ),
    perfis: user.profileCodes
      .map((code) => profileDescriptionByCode[code] ?? code)
      .join(", "),
    action: (
      <UserActionMenu
        active={user.active}
        onEdit={() => onEdit(user.id)}
        onDelete={() => onDelete(user.id)}
        onReactivate={() => onReactivate(user.id)}
      />
    ),
  }));

  return (
    <Table
      value={tableData}
      loading={loading}
      pt={{
        root: {
          className: "table-list table-list--users",
        },
      }}
    >
      <Column field="name" header="Nome" />
      <Column field="email" header="E-mail" />
      <Column field="perfis" header="Perfis" />
      <Column field="status" header="Status" />
      <Column field="action" header="Ação" />
    </Table>
  );
}