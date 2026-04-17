"use client";

interface TargetSectionItem {
  label: string;
  enabled: boolean;
  active?: boolean;
}

const TARGET_SECTIONS: TargetSectionItem[] = [
  {
    label: "DOCUMENTOS GENERICOS",
    enabled: false,
  },
  {
    label: "PRONTUARIO DO ALVO",
    enabled: true,
    active: true,
  },
  {
    label: "CORROBORACAO JURIDICA",
    enabled: false,
  },
  {
    label: "INTERROGATORIO",
    enabled: false,
  },
  {
    label: "DOCUMENTACAO DA OPERACAO",
    enabled: false,
  },
];

export default function TargetSectionsHeader() {
  return (
    <nav className="target-sections-nav" aria-label="Sections do alvo">
      {TARGET_SECTIONS.map((section) => {
        const buttonClassName = [
          "target-sections-nav-button",
          section.active ? "target-sections-nav-button--active" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={section.label}
            type="button"
            className={buttonClassName}
            disabled={!section.enabled}
            aria-current={section.active ? "page" : undefined}
          >
            {section.label}
          </button>
        );
      })}
    </nav>
  );
}
