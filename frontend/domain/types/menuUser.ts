import { IconName } from "@uigovpe/components";

export interface MenuUser {
  id: number;
  codeName: string;
  displayName: string;
  parentId: number | null;
  url: string;
  icon: IconName | null;
  orderIndex: number;
  domainProfileId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  submenus: MenuUser[];
}