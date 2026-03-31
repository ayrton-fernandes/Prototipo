import { MenuUser } from "@/domain/types/menuUser";
import { UserMenu, UserProfile } from "@/domain/types/userMe";

export interface User {
  id?: number;
  name: string;
  email: string;
  role?: string;
  profiles?: UserProfile[];
  menus?: MenuUser[] | UserMenu[];
}

export interface UserState {
  user: User | null;
}
