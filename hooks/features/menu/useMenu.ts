import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { mapMenuToSidebarSections } from "@/utils/navegation/mapMenuToSidebarSection";
import { mapUserMenusToSidebar } from "@/utils/navegation/mapUserMenusToSidebar";
import { MenuUser } from "@/domain/types/menuUser";
import { UserMenu } from "@/domain/types/userMe";


export function useMenu() {
    const { user } = useSelector((state: RootState) => state.auth);
    const { isLoading } = useSelector((state: RootState) => state.loading);

    let sidebarSections = [] as any[];

    if (user?.menus && user.menus.length > 0) {
        const first = user.menus[0] as MenuUser | UserMenu;
        const looksLikeMenuUser = typeof (first as MenuUser).id === 'number' || typeof (first as MenuUser).displayName === 'string';

        if (looksLikeMenuUser) {
            sidebarSections = mapMenuToSidebarSections(user.menus as MenuUser[]);
        } else {
            sidebarSections = mapUserMenusToSidebar(user.menus as UserMenu[]);
        }
    }

    return {
        menus: user?.menus || [],
        sidebarSections,
        loading: isLoading,
    };
}
 