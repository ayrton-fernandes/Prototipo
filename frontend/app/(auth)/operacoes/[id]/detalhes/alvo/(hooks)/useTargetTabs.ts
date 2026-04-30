"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { OperationMemberPermission } from "@/domain/types/operationMember";
import { hasAnyProfile } from "@/utils/userProfiles";
import { TARGET_TABS, TargetTab, TargetTabType } from "@/app/(auth)/operacoes/[id]/detalhes/alvo/(types)/targetTab";

/**
 * Determina quais abas devem estar habilitadas baseado no perfil do usuário e sua permissão na operação.
 *
 * Regras de negócio:
 * - PLANNING: Acesso a TODAS as abas mas visualização apenas (não edita prontuário)
 * - INTELLIGENCE, INVESTIGATION, COOR_INTELLIGENCE: Acesso a PRONTUARIO_DO_ALVO e CORROBORACAO_JURIDICA
 * - Permissão EDITOR: Pode editar
 * - Permissão READER: Pode apenas ler
 * - Permissão PLANNING: Pode apenas ler
 */
interface UseTargetTabsParams {
  permission?: OperationMemberPermission | null;
  currentTabId?: TargetTabType;
}

interface UseTargetTabsReturn {
  tabs: TargetTab[];
  canEditContent: boolean;
  hasAccessToTab: (tabId: TargetTabType) => boolean;
}

export function useTargetTabs({
  permission,
  currentTabId = "PRONTUARIO_DO_ALVO",
}: UseTargetTabsParams): UseTargetTabsReturn {
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const { tabs, canEditContent, hasAccessToTab } = useMemo(() => {
    const isPlanning = Boolean(currentUser && hasAnyProfile(currentUser, ["PLANNING"]));
    const isAnalyst = Boolean(currentUser && hasAnyProfile(currentUser, ["INTELLIGENCE"]));
    const isInvestigator = Boolean(currentUser && hasAnyProfile(currentUser, ["INVESTIGATION"]));
    const isCoordinator = Boolean(
      currentUser && hasAnyProfile(currentUser, ["COOR_INTELLIGENCE", "COORDINATOR", "ADMIN"])
    );

    const canEditForTab = (tabId: TargetTabType): boolean => {
      if (!currentUser) return false;

      // PLANNING users are read-only for most sections, but
      // they are allowed to add custom fields in Corroboração Jurídica.
      if (isPlanning) {
        return tabId === "CORROBORACAO_JURIDICA";
      }

      // Prontuário do Alvo: EDITOR or Coordinator can edit (planning already handled)
      if (tabId === "PRONTUARIO_DO_ALVO") {
        return permission === "EDITOR" || isCoordinator;
      }

      // Corroboração Jurídica: EDITOR and Coordinator can edit; planning allowed above
      if (tabId === "CORROBORACAO_JURIDICA") {
        return permission === "EDITOR" || isCoordinator;
      }

      // Default: only explicit EDITOR permission
      return permission === "EDITOR";
    };

    // Determina quais abas devem estar habilitadas
    const enabledTabIds = new Set<TargetTabType>();

    if (isPlanning) {
      // Planejamento acessa todas as abas
      enabledTabIds.add("PRONTUARIO_DO_ALVO");
      enabledTabIds.add("CORROBORACAO_JURIDICA");
      enabledTabIds.add("INTERROGATORIO");
      enabledTabIds.add("DOCUMENTACAO_DA_OPERACAO");
      enabledTabIds.add("DOCUMENTOS_GENERICOS");
    } else if (isAnalyst || isInvestigator || isCoordinator) {
      // Analista, Investigador e Coordenador acessam prontuário e corroboração jurídica
      enabledTabIds.add("PRONTUARIO_DO_ALVO");
      enabledTabIds.add("CORROBORACAO_JURIDICA");
    }

    const computedTabs = Object.values(TARGET_TABS).map((tab) => ({
      ...tab,
      enabled: enabledTabIds.has(tab.id),
      active: tab.id === currentTabId,
    }));

    const checkAccess = (tabId: TargetTabType): boolean => enabledTabIds.has(tabId);

    return {
      tabs: computedTabs,
      canEditContent: canEditForTab(currentTabId),
      hasAccessToTab: checkAccess,
    };
  }, [currentUser, permission, currentTabId]);

  return {
    tabs,
    canEditContent,
    hasAccessToTab,
  };
}
