export interface UserProfile {
  codeName: string;
  descName: string;
}

export interface UserMenu {
  codeName: string;
  descName: string;
  url: string;
  orderIndex: number;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface UserMeResponse {
  name: string;
  email: string;
  profiles: UserProfile[];
  menus: UserMenu[];
}
