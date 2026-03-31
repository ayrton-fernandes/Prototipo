"use client";



import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Icon } from "@uigovpe/components";
import { useMenu } from "@/hooks/features/menu/useMenu";
import { MenuUser } from "@/domain/types/menuUser";
import { UserMenu } from "@/domain/types/userMe";
import { getImagePath } from "@/utils/getImagePath";

export type BreadcrumbItem = {
  label: string;
  url?: string;
};

export type BreadcrumbHome = {
  label?: string;
  url?: string;
  template?: React.ReactNode;
};

export type BreadcrumbData = {
  home?: BreadcrumbHome;
  items: BreadcrumbItem[];
};

export type PageContextType = {
  breadcrumb: BreadcrumbData;
  setBreadcrumb: (items: BreadcrumbData) => void;
};

const PageContext = createContext<PageContextType | undefined>(undefined);

const DEFAULT_BREADCRUMB_NAMES: Record<string, string> = {
  "/general": "Início",
  "/acessos": "Gestão de acessos",
  "/medicamentos": "Medicamentos",
  "/gestao": "Gestão",
  "/estoque": "Estoque",
  "/dispensacao": "Dispensação",
  "/usuarios": "Usuários",
  "/farmacia": "Farmácia",
  "/patologias": "Patologias",
};

const MAIN_ROUTES = [
  "analise",
  "general",
  "dispensacao-medicamento",
  "documentos",
  "especialidades",
  "farmacia",
  "medicamentos",
  "patologias",
  "solicitacoes",
  "usuarios",
];

function getBasePath(path: string): string {
  if (!path || path === "/") return "/farmacia";

  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return "/farmacia";

  const match = segments.find(segment => MAIN_ROUTES.includes(segment));
  return `/${match || segments[0]}`;
}

export function PageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { menus } = useMenu();

  type MenuItem = MenuUser | UserMenu;

  const getBreadcrumbName = (segment: string): string => {
    // Procura pelo codeName ou descName nos menus
    const foundMenu = menus.find((menu: MenuItem) => {
      const url = (menu as MenuUser).url || (menu as UserMenu).url || "";
      const menuSegment = url.split("/").filter(Boolean).pop();
      return menuSegment === segment || url.includes(segment);
    }) as MenuItem | undefined;

    if (!foundMenu) return DEFAULT_BREADCRUMB_NAMES[`/${segment}`] || segment;

    if ("descName" in foundMenu && foundMenu.descName) return foundMenu.descName;
    if ("displayName" in foundMenu && foundMenu.displayName) return foundMenu.displayName;

    return DEFAULT_BREADCRUMB_NAMES[`/${segment}`] || segment;
  };

  // Função para verificar se um segmento é um ID numérico
  const isNumericId = (segment: string): boolean => {
    return /^\d+$/.test(segment);
  };

  const computedBreadcrumb = useMemo((): BreadcrumbData => {
    const homeUrl = getBasePath(pathname);

    const breadcrumb: BreadcrumbData = {
      home: {
        template: (
          <Link className="p-menuitem-link" href={homeUrl}>
            <Icon icon="home" className="p-menuitem-text" />
          </Link>
        ),
        label: "Home",
        url: homeUrl,
      },
      items: [],
    };

    if (pathname === "/home") return breadcrumb;

    const paths = pathname.split("/").filter(Boolean);
    
    // Filtrar segmentos que são IDs numéricos
    const filteredPaths = paths.filter(segment => !isNumericId(segment));

    breadcrumb.items = filteredPaths.map((segment, index) => ({
      label: getBreadcrumbName(segment),
      url: index < filteredPaths.length - 1 ? getImagePath(`/${paths.slice(0, paths.indexOf(segment) + 1).join("/")}`) : undefined,
    }));

    return breadcrumb;
  }, [pathname, menus]);

  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbData>(computedBreadcrumb);

  useEffect(() => {
    setBreadcrumb(prev => {
      const sameHome = prev.home?.url === computedBreadcrumb.home?.url;
      const sameItems =
        prev.items.length === computedBreadcrumb.items.length &&
        prev.items.every(
          (item, i) =>
            item.label === computedBreadcrumb.items[i].label &&
            item.url === computedBreadcrumb.items[i].url
        );

      if (sameHome && sameItems) return prev;

      return computedBreadcrumb;
    });
  }, [computedBreadcrumb]);

  const value = useMemo(() => ({ breadcrumb, setBreadcrumb }), [breadcrumb]);

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}

export function usePage() {
  const context = useContext(PageContext);
  if (!context) throw new Error("usePage deve ser usado dentro de um PageProvider");
  return context;
}
