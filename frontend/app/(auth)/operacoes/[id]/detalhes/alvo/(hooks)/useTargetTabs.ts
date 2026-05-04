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
 * - PLANNING: Acesso a TODAS as abas (acesso global). Pode editar em todas EXCETO PRONTUARIO_DO_ALVO (apenas visualização)
 * - INTELLIGENCE, INVESTIGATION, COOR_INTELLIGENCE: Acesso a PRONTUARIO_DO_ALVO e CORROBORACAO_JURIDICA
 * - Para perfis de investigação/inteligência, edição depende da permissão na operação:
 * COORDINATOR ou EDITOR edita; READER apenas visualiza.
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
    const isCoordinator = Boolean(
      currentUser && hasAnyProfile(currentUser, ["COOR_INTELLIGENCE", "COORDINATOR", "ADMIN"])
    );
    const isPlanning = Boolean(currentUser && hasAnyProfile(currentUser, ["PLANNING"]) && !isCoordinator);
    const isAnalyst = Boolean(currentUser && hasAnyProfile(currentUser, ["INTELLIGENCE"]));
    const isInvestigator = Boolean(currentUser && hasAnyProfile(currentUser, ["INVESTIGATION"]));
    const isOperationMember = permission != null || isCoordinator;
    const effectivePermission: OperationMemberPermission | null = isCoordinator ? "COORDINATOR" : permission ?? null;

    const canEditForTab = (tabId: TargetTabType): boolean => {
      if (!currentUser) return false;

      // PLANNING users can edit all tabs except PRONTUARIO_DO_ALVO. (Ignora se é membro da operação ou não)
      if (isPlanning) {
        return tabId !== "PRONTUARIO_DO_ALVO";
      }

      // Para os demais perfis, é obrigatório ser membro da operação
      if (!isOperationMember) return false;

      // Perfis de investigação/inteligência editam apenas com COORDINATOR/EDITOR.
      if (tabId === "PRONTUARIO_DO_ALVO" || tabId === "CORROBORACAO_JURIDICA") {
        return effectivePermission === "COORDINATOR" || effectivePermission === "EDITOR";
      }

      // Demais abas não são editáveis para esses perfis.
      return effectivePermission === "EDITOR";
    };

    // Determina quais abas devem estar habilitadas
    const enabledTabIds = new Set<TargetTabType>();

    if (isPlanning) {
      // Planejamento acessa todas as abas globalmente, independente do `isOperationMember`
      enabledTabIds.add("PRONTUARIO_DO_ALVO");
      enabledTabIds.add("CORROBORACAO_JURIDICA");
      enabledTabIds.add("INTERROGATORIO");
      enabledTabIds.add("DOCUMENTACAO_DA_OPERACAO");
      enabledTabIds.add("DOCUMENTOS_GENERICOS");
    } else if (isOperationMember && (isAnalyst || isInvestigator || isCoordinator)) {
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