"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DetailsCreateRedirect() {
  const router = useRouter();
  const params = useParams() as { id?: string };

  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    // Redireciona para rota canonical com 'alvo' segment
    router.replace(`/operacoes/${id}/detalhes/alvo/cadastrar`);
  }, [params, router]);

  return <div />;
}
