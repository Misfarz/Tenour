export enum BuyerRole {
  ORG_ADMIN = "ORG_ADMIN",
  EMPLOYEE = "EMPLOYEE",
  MANAGER = "MANAGER",
  PROCUREMENT = "PROCUREMENT",
  FINANCE = "FINANCE",
}

export const VALID_BUYER_ROLES = Object.values(BuyerRole);

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [BuyerRole.ORG_ADMIN]: [
    "manage:users",
    "manage:roles",
    "manage:departments",
    "manage:settings",
    "view:org",
  ],
  [BuyerRole.EMPLOYEE]: ["view:org"],
  [BuyerRole.MANAGER]: ["view:org", "approve:requests"],
  [BuyerRole.PROCUREMENT]: ["view:org", "manage:procurement"],
  [BuyerRole.FINANCE]: ["view:org", "manage:finance"],
};
