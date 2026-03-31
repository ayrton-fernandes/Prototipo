

import { MenuItem, SidebarSectionProps, IconName } from '@uigovpe/components';
import { getImagePath } from '../getImagePath';
import { MenuUser } from '@/domain/types/menuUser';


export function mapMenuToSidebarSections(menu: MenuUser[]): SidebarSectionProps[] {
    const result = (menu || []).map<SidebarSectionProps>((item) => {
        const hasSubmenus = item?.submenus && item?.submenus?.length > 0;

        const items: MenuItem[] | undefined = hasSubmenus
            ? item.submenus.map((sub): MenuItem => {
                  // forçar o tipo do ícone para o tipo esperado pelo componente
                  const icon = (sub.icon ?? undefined) as IconName | undefined;

                  // MenuItem pode aceitar notificationValue, caso exista
                  const baseMenuItem: MenuItem & { notificationValue?: number } = {
                      id: sub.displayName,
                      label: sub.displayName,
                      disabled: false,
                      link: getImagePath(sub.url),
                      icon,
                  };

                  // Só adicionar notificationValue se houver um valor válido e maior que 0
                  const notificationValue = (sub as { notificationValue?: unknown }).notificationValue;
                  if (typeof notificationValue === 'number' && notificationValue > 0) {
                      baseMenuItem.notificationValue = notificationValue;
                  }


                  return baseMenuItem;
              })
            : undefined;

        const sectionData: SidebarSectionProps = {
            id: item.displayName,
            title: item.displayName,
            items,
            expandable: hasSubmenus,
            link: hasSubmenus ? "" : getImagePath(item.url),
            icon: (item.icon ?? undefined) as IconName | undefined,
        };

        return sectionData;
    });

    return result;
}
