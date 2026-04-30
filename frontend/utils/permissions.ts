import { UserMeResponse, UserMenu } from "@/domain/types/userMe";
import { UserRole } from "@/domain/types/userManagement"; // Assuming UserRole is exported from here

// Define specific menu code names used in the application
// These should align with the backend and UserMenu.codeName values
const MENU_CODES = {
  TARGET_CREATION: "TARGET_CREATION", // Example code name for target creation
  TARGET_RECORD: "TARGET_RECORD", // Example for Prontuário do Alvo
  LEGAL_CORROBORATION: "LEGAL_CORROBORATION", // Example for Corroboração Jurídica
  // Add other menu codes as needed
};

type PermissionType = "canView" | "canEdit" | "canDelete";

/**
 * Determines if a user has a specific permission for a given menu section.
 * @param user The current user object (UserMeResponse).
 * @param menuCode The code name of the menu/section to check (e.g., MENU_CODES.TARGET_RECORD).
 * @param permissionType The type of permission to check ('canView', 'canEdit', 'canDelete').
 * @returns boolean - True if the user has the permission, false otherwise.
 */
export const hasMenuPermission = (
  user: UserMeResponse | null | undefined,
  menuCode: string,
  permissionType: PermissionType
): boolean => {
  if (!user) {
    return false;
  }

  // --- Role-based Overrides ---
  // Specific roles might have default permissions regardless of menu item flags.
  const userRoles = user.profiles.map(p => p.codeName as UserRole); // Assuming UserProfile.codeName matches UserRole enum

  // Planning users generally have very limited edit access.
  if (userRoles.includes("PLANNING")) {
    if (permissionType === "canEdit") {
      // Planning users cannot edit, but might view.
      // Specific tab logic will handle view vs edit.
      return false;
    }
    // Planning users might still view some things, handled by specific tab logic.
    // If a menu item explicitly denies view, it should be respected.
  }

  // Intelligence Coordinator always has edit permission for relevant sections.
  if (userRoles.includes("INTELLIGENCE") && permissionType === "canEdit") {
    // For 'TARGET_CREATION' or specific Intelligence-related menus, they can edit.
    // This needs to be mapped to specific menu codes.
    // For now, assuming general edit for Intelligence Coordinator.
    // More granular check might be needed if specific menus for Intelligence Coordinator are different.
    // return true; // This might be too broad, better to check menu flags if available.
  }

  // --- Menu-specific Permissions ---
  const menu = user.menus.find(m => m.codeName === menuCode);

  if (!menu) {
    // If menu item not found, assume no permission by default.
    // Or, default to view permission if it's a view-only section and not found?
    // For now, strict: if menu not found, no permission.
    return false;
  }

  // Check the specific permission flag on the menu item.
  const hasPermission = menu[permissionType] ?? false;

  // --- Final Logic Combination ---
  // If Planning user, override to false for edit actions unless explicitly allowed for a specific reason (not applicable here).
  if (userRoles.includes("PLANNING") && permissionType === "canEdit") {
    return false;
  }

  // Special case for "Analista" / "Investigador" (INVESTIGATION role) needing explicit edit permission.
  // If they are INVESTIGATION role and trying to edit, check if menu has explicit 'canEdit'.
  // If menu doesn't grant edit, and they are INVESTIGATION, they cannot edit.
  if (userRoles.includes("INVESTIGATION") && permissionType === "canEdit" && !hasPermission) {
    // If the menu item itself doesn't grant edit, and user is INVESTIGATION, then no edit.
    return false;
  }

  // For all other cases, rely on the menu item's permission flag.
  return hasPermission;
};

/**
 * Checks if a user has any of the specified roles.
 * @param user The current user object (UserMeResponse).
 * @param roles The array of UserRole strings to check against.
 * @returns boolean - True if the user has at least one of the roles.
 */
export const hasAnyRole = (user: UserMeResponse | null | undefined, roles: UserRole[]): boolean => {
  if (!user) {
    return false;
  }
  const userProfileCodes = user.profiles.map(p => p.codeName as UserRole);
  return roles.some(role => userProfileCodes.includes(role));
};

// Helper to get a specific menu item, or null if not found.
export const getMenuByName = (user: UserMeResponse | null | undefined, menuCode: string): UserMenu | null => {
  if (!user) {
    return null;
  }
  return user.menus.find(menu => menu.codeName === menuCode) || null;
};

// Define specific menu codes for clarity, aligned with MENU_CODES constant
export const MENU_TARGET_CREATION = MENU_CODES.TARGET_CREATION;
export const MENU_TARGET_RECORD = MENU_CODES.TARGET_RECORD;
export const MENU_LEGAL_CORROBORATION = MENU_CODES.LEGAL_CORROBORATION;
