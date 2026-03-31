import { SidebarSectionProps } from '@uigovpe/components';
import { UserMenu } from '@/domain/types/userMe';

export function mapUserMenusToSidebar(menus: UserMenu[]): SidebarSectionProps[] {
  return menus
    .filter(menu => menu.canView)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(menu => ({
      id: menu.codeName,
      title: menu.descName,
      link: menu.url,
      expandable: false,
    }));
}
