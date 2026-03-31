import api from "@/services/api/api";
import Response from "@/domain/types/response";
import { MenuUser } from "@/domain/types/menuUser";

const MenuService = {
  getMenuByUser() {
    return api.get<unknown, Response<MenuUser[]>>("/menus/user");
  },
};

export default MenuService;
