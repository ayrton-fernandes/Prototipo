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

const headerCellStyle = {
  headerCell: {
    className: "font-bold text-sm",
  },
};

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
      <Tag value={user.active ? "ATIVO" : "INATIVO"} severity={user.active ? "success" : "danger"} />
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
      tableStyle={{ width: "100%" }}
      pt={{
        bodyRow: {
          className: "text-sm font-normal",
        },
      }}
    >
      <Column field="name" header="Nome" style={{ width: "30%" }} pt={headerCellStyle} />
      <Column field="email" header="E-mail" style={{ width: "28%" }} pt={headerCellStyle} />
      <Column field="perfis" header="Perfis" style={{ width: "24%" }} pt={headerCellStyle} />
      <Column field="status" header="Status" style={{ width: "10%" }} pt={headerCellStyle} />
      <Column field="action" header="Ação" style={{ width: "8%" }} pt={headerCellStyle} />
    </Table>
  );
}