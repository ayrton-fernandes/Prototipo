"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";
import { TARGET_TABS, TargetTabType } from "@/app/(auth)/operacoes/[id]/detalhes/alvo/(types)/targetTab";

/**
 * Hook para gerenciar navegação entre as abas do alvo.
 * Detecta a aba atual baseada na URL e fornece função para navegar entre elas.
 */
interface UseTargetTabNavigationReturn {
  currentTabId: TargetTabType;
  navigateToTab: (tabId: TargetTabType) => void;
}

export function useTargetTabNavigation(): UseTargetTabNavigationReturn {
  const params = useParams() as { id?: string; targetId?: string };
  const pathname = usePathname();
  const router = useRouter();

  const currentTabId = useMemo<TargetTabType>(() => {
    // Detecta a aba atual baseada no caminho da URL
    if (pathname.includes("corroboracao-juridica")) {
      return "CORROBORACAO_JURIDICA";
    }
    if (pathname.includes("interrogatorio")) {
      return "INTERROGATORIO";
    }
    if (pathname.includes("documentacao-operacao")) {
      return "DOCUMENTACAO_DA_OPERACAO";
    }
    if (pathname.includes("documentos")) {
      return "DOCUMENTOS_GENERICOS";
    }
    // Por padrão, retorna prontuário
    return "PRONTUARIO_DO_ALVO";
  }, [pathname]);

  const navigateToTab = (tabId: TargetTabType) => {
    if (!params.id || !params.targetId) return;

    const tab = TARGET_TABS[tabId];
    if (!tab) return;

    // Constrói a URL baseada na aba selecionada
    let newPath = `/operacoes/${params.id}/detalhes/alvo/${params.targetId}`;

    if (tabId !== "PRONTUARIO_DO_ALVO") {
      newPath += `/${tab.path}`;
    }

    router.push(newPath);
  };

  return {
    currentTabId,
    navigateToTab,
  };
}
