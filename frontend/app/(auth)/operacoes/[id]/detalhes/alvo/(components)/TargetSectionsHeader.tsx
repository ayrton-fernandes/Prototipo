"use client";

import { useCurrentOperationMember } from "@/app/(auth)/operacoes/[id]/detalhes/(hooks)/useCurrentOperationMember";
import { useTargetTabs } from "@/app/(auth)/operacoes/[id]/detalhes/alvo/(hooks)/useTargetTabs";
import { useTargetTabNavigation } from "@/app/(auth)/operacoes/[id]/detalhes/alvo/(hooks)/useTargetTabNavigation";
import { TargetTabType } from "@/app/(auth)/operacoes/[id]/detalhes/alvo/(types)/targetTab";

interface TargetSectionProps {
  /**
   * ID da aba atualmente ativa (usado para renderizar o header com a aba correta marcada)
   * Se não fornecido, será detectado automaticamente pela URL
   */
  activeTabId?: TargetTabType;
}

export default function TargetSectionsHeader({ activeTabId }: TargetSectionProps) {
  const { permission, loading } = useCurrentOperationMember();
  const { currentTabId, navigateToTab } = useTargetTabNavigation();
  const { tabs } = useTargetTabs({
    permission,
    currentTabId: activeTabId ?? currentTabId,
  });

  const handleTabClick = (tabId: TargetTabType) => {
    navigateToTab(tabId);
  };

  return (
    <nav className="target-sections-nav" aria-label="Abas do alvo">
      {tabs.map((tab) => {
        const buttonClassName = [
          "target-sections-nav-button",
          tab.active ? "target-sections-nav-button--active" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={tab.id}
            type="button"
            className={buttonClassName}
            disabled={!tab.enabled || loading}
            aria-current={tab.active ? "page" : undefined}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
