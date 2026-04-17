"use client";

import { useMemo, useState } from "react";
import { Button, Card, Checkbox, Column, Dialog, Dropdown, Icon, Table, Typography } from "@uigovpe/components";
import DeleteDialog from "@/components/DeleteDialog";
import EntityActionMenu from "@/components/EntityActionMenu";
import { OperationMemberRow } from "@/app/(auth)/operacoes/[id]/detalhes/(types)/operationDetails";
import { OperationMemberPermission } from "@/domain/types/operationMember";
import { UserListItem } from "@/domain/types/userManagement";

type EditableMemberPermission = Extract<OperationMemberPermission, "READER" | "EDITOR">;

interface MemberFormState {
  userId: number | null;
  permission: EditableMemberPermission;
}

interface MemberUserOption {
  label: string;
  value: number;
}

interface OperationMembersSectionProps {
  members: OperationMemberRow[];
  users: UserListItem[];
  profileDescriptionByCode: Record<string, string>;
  loading?: boolean;
  processing?: boolean;
  errorMessage?: string | null;
  onCreate: (userId: number, permission: EditableMemberPermission) => Promise<boolean>;
  onUpdatePermission: (userId: number, permission: EditableMemberPermission) => Promise<boolean>;
  onDelete: (userId: number) => Promise<boolean>;
}

const DEFAULT_MEMBER_FORM_STATE: MemberFormState = {
  userId: null,
  permission: "READER",
};

const noop = () => undefined;

const getUserRoleLabel = (user: UserListItem, profileDescriptionByCode: Record<string, string>): string => {
  if (user.profileCodes.length === 0) {
    return "Não informado";
  }

  return user.profileCodes
    .map((code) => profileDescriptionByCode[code] ?? code)
    .join(", ");
};

export default function OperationMembersSection({
  members,
  users,
  profileDescriptionByCode,
  loading = false,
  processing = false,
  errorMessage = null,
  onCreate,
  onUpdatePermission,
  onDelete,
}: OperationMembersSectionProps) {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [memberUnderEdit, setMemberUnderEdit] = useState<OperationMemberRow | null>(null);
  const [memberUnderDelete, setMemberUnderDelete] = useState<OperationMemberRow | null>(null);
  const [formState, setFormState] = useState<MemberFormState>(DEFAULT_MEMBER_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);

  const userOptions = useMemo<MemberUserOption[]>(() => {
    const assignedUserIds = new Set(members.map((member) => member.id));

    return users
      .filter((user) => {
        if (memberUnderEdit && user.id === memberUnderEdit.id) {
          return true;
        }

        if (!user.active) {
          return false;
        }

        return !assignedUserIds.has(user.id);
      })
      .map((user) => {
        const roleLabel = getUserRoleLabel(user, profileDescriptionByCode);
        return {
          label: `${user.name} - ${user.email} (${roleLabel})`,
          value: user.id,
        };
      })
      .sort((left, right) => left.label.localeCompare(right.label, "pt-BR"));
  }, [memberUnderEdit, members, profileDescriptionByCode, users]);

  const resetForm = () => {
    setFormState(DEFAULT_MEMBER_FORM_STATE);
    setFormError(null);
    setMemberUnderEdit(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogVisible(true);
  };

  const openEditDialog = (member: OperationMemberRow) => {
    if (member.permission === "COORDINATOR") {
      return;
    }

    setMemberUnderEdit(member);
    setFormError(null);
    setFormState({
      userId: member.id,
      permission: member.permission === "EDITOR" ? "EDITOR" : "READER",
    });
    setDialogVisible(true);
  };

  const closeDialog = () => {
    if (processing) {
      return;
    }

    setDialogVisible(false);
    resetForm();
  };

  const openDeleteDialog = (member: OperationMemberRow) => {
    if (member.permission === "COORDINATOR") {
      return;
    }

    setMemberUnderDelete(member);
    setDeleteDialogVisible(true);
  };

  const closeDeleteDialog = () => {
    if (processing) {
      return;
    }

    setDeleteDialogVisible(false);
    setMemberUnderDelete(null);
  };

  const handleSubmit = async () => {
    if (formState.userId == null) {
      setFormError("Selecione um usuário para continuar.");
      return;
    }

    setFormError(null);

    const success = memberUnderEdit
      ? await onUpdatePermission(memberUnderEdit.id, formState.permission)
      : await onCreate(formState.userId, formState.permission);

    if (success) {
      setDialogVisible(false);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (!memberUnderDelete) {
      return;
    }

    const success = await onDelete(memberUnderDelete.id);

    if (success) {
      setDeleteDialogVisible(false);
      setMemberUnderDelete(null);
    }
  };

  const tableData = members.map((member) => ({
    ...member,
    action:
      member.permission === "COORDINATOR" ? (
        <Typography variant="small" className="text-slate-400">
          Gerenciado pelo sistema
        </Typography>
      ) : (
        <EntityActionMenu
          active
          editLabel="Editar permissão"
          deleteLabel="Remover membro"
          onEdit={() => openEditDialog(member)}
          onDelete={() => openDeleteDialog(member)}
          onReactivate={noop}
        />
      ),
  }));

  return (
    <>
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Typography variant="h2" className="text-black">
              Membros da operação
            </Typography>
            <Typography variant="p" className="text-slate-500">
              Visualize os membros associados à operação.
            </Typography>
          </div>

          <Button label="Cadastrar membro" icon={<Icon icon="add" />} onClick={openCreateDialog} disabled={processing || loading} />
        </div>

        {errorMessage ? (
          <Card>
            <Typography variant="p" className="text-slate-600">
              {errorMessage}
            </Typography>
          </Card>
        ) : null}

        {members.length === 0 && !loading && !errorMessage ? (
          <Card>
            <Typography variant="p" className="text-slate-600">
              Nenhum membro associado à operação.
            </Typography>
          </Card>
        ) : (
          <Card>
            <Table
              value={tableData}
              loading={loading}
              pt={
                {
                  root: {
                    className: "table-list table-list--operation-members",
                  },
                }
              }
            >
              <Column field="name" header="Nome" />
              <Column field="email" header="Email" />
              <Column field="role" header="Função" />
              <Column field="permissionLabel" header="Permissão" />
              <Column field="action" header="Ações" />
            </Table>
          </Card>
        )}
      </section>

      <Dialog
        visible={dialogVisible}
        modal
        className="operation-dialog operation-dialog--wide operation-members-dialog"
        header={
          <Typography variant="h4" className="text-black">
            {memberUnderEdit ? "Editar permissão do membro" : "Cadastrar membro da operação"}
          </Typography>
        }
        onHide={closeDialog}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              outlined
              label="Cancelar"
              className="prontuario-dialog-cancel-button"
              disabled={processing}
              onClick={closeDialog}
            />
            <Button
              label={memberUnderEdit ? "Salvar alteração" : "Adicionar membro"}
              className="operation-members-submit-button"
              loading={processing}
              onClick={handleSubmit}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <Dropdown
            label="Usuário"
            placeholder="Selecione o usuário"
            options={userOptions}
            value={formState.userId}
            onChange={(event) => {
              setFormError(null);
              setFormState((current) => ({
                ...current,
                userId: event.value == null ? null : Number(event.value),
              }));
            }}
            disabled={processing || memberUnderEdit != null}
            invalid={formError != null}
          />

          <div className="operation-members-permission-grid">
            <Typography variant="small" className="text-slate-500">
              Permissão do membro
            </Typography>

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
              <Checkbox
                inputId="operation-member-permission-reader"
                label="Leitor"
                checked={formState.permission === "READER"}
                disabled={processing}
                onChange={(event) => {
                  if (event.checked) {
                    setFormState((current) => ({ ...current, permission: "READER" }));
                  }
                }}
              />

              <Checkbox
                inputId="operation-member-permission-editor"
                label="Editor"
                checked={formState.permission === "EDITOR"}
                disabled={processing}
                onChange={(event) => {
                  if (event.checked) {
                    setFormState((current) => ({ ...current, permission: "EDITOR" }));
                  }
                }}
              />
            </div>
          </div>

          {formError ? (
            <Typography variant="small" className="cpo-form-support-error">
              {formError}
            </Typography>
          ) : null}
        </div>
      </Dialog>

      <DeleteDialog
        visible={deleteDialogVisible}
        entity={memberUnderDelete ? `membro ${memberUnderDelete.name}` : "membro"}
        loading={processing}
        dialogClassName="operation-members-delete-dialog"
        cancelButtonClassName="prontuario-dialog-cancel-button"
        confirmButtonClassName="operation-members-submit-button"
        confirmButtonDanger={false}
        onHide={closeDeleteDialog}
        onConfirm={handleDelete}
      />
    </>
  );
}
