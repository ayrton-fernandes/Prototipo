"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, InputText, Typography } from "@uigovpe/components";
import { showToast } from "@/store/slices/toastSlice";
import { useAppDispatch } from "@/store/store";
import { userService } from "@/services/userService";
import UsersTable from "./(components)/UsersTable";
import DeleteDialog from "@/components/DeleteDialog";
import { useUsersList } from "./(hooks)/useUsersList";

export default function AcessosPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);
  const { filteredUsers, loading, search, setSearch, profileDescriptionByCode, refetch } = useUsersList();

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
      await userService.deleteById(targetId);
      dispatch(
        showToast({
          severity: "success",
          summary: "Usuário inativado",
          detail: "A operação foi concluída com sucesso.",
        })
      );
      await refetch();
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha ao inativar",
          detail: "Não foi possível inativar o usuário.",
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
      await userService.reactivateById(id);
      dispatch(
        showToast({
          severity: "success",
          summary: "Usuário reativado",
          detail: "A operação foi concluída com sucesso.",
        })
      );
      await refetch();
    } catch {
      dispatch(
        showToast({
          severity: "error",
          summary: "Falha ao reativar",
          detail: "Não foi possível reativar o usuário.",
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
          Gestão de acessos
        </Typography>

        <Typography variant="p" className="text-slate-500">
          Gerencie usuários e perfis de acesso do sistema.
        </Typography>
      </section>

      <Card title="Usuários" elevation="low">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
            <div className="w-full md:max-w-sm">
              <InputText
                label="Buscar usuário"
                placeholder="Digite nome ou e-mail"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <Button
              label="Cadastrar novo usuário"
              onClick={() => router.push("/acessos/cadastrar")}
              disabled={isProcessing}
            />
          </div>

          <UsersTable
            users={filteredUsers}
            profileDescriptionByCode={profileDescriptionByCode}
            loading={loading || isProcessing}
            onEdit={(id) => router.push(`/acessos/${id}/editar`)}
            onDelete={handleDelete}
            onReactivate={handleReactivate}
          />
        </div>
      </Card>

      <DeleteDialog
        visible={confirmVisible}
        entity="usuário"
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
