"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { RootState } from "@/store/store";
import { operationMemberService } from "@/services/operationMemberService";
import { OperationMemberPermission } from "@/domain/types/operationMember";

export function useCurrentOperationMember() {
  const params = useParams() as { id?: string };
  const operationId = useMemo(() => {
    const parsed = Number(params.id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [params.id]);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<OperationMemberPermission | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!operationId || !currentUser) {
        setPermission(null);
        return;
      }

      setLoading(true);
      try {
        const resp = await operationMemberService.findAll(operationId);
        if (!mounted) return;

        const members = resp.data;
        const current = members.find((m) => m.userId === currentUser.id);

        setPermission(current ? current.permission : null);
      } catch {
        if (!mounted) return;
        setPermission(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [operationId, currentUser]);

  return { permission, loading } as const;
}
