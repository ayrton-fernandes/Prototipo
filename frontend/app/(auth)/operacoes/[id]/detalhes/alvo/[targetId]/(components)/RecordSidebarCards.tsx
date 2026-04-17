"use client";

import { Card, Typography } from "@uigovpe/components";

const SIDEBAR_PANELS = [
  {
    title: "PRONTUARIOS DO ALVO\nCOMPARTILHADOS",
  },
  {
    title: "PRONTUARIOS DO ALVO\nDE OUTRAS OPERAÇÕES",
  },
];

export default function ProntuarioSidebarCards() {
  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-6">
      {SIDEBAR_PANELS.map((panel) => (
        <Card
          key={panel.title}
          className="prontuario-sidebar-card"
        >
          <Typography
            variant="h3"
            className="prontuario-sidebar-card-title"
          >
            {panel.title}
          </Typography>
        </Card>
      ))}
    </div>
  );
}