export type OrganizationUserRoleCategory = "portal" | "teacher" | "backoffice";

export interface OrganizationUserRole {
  id: string;
  code: string | null;
  roleName: string | null;
  description?: string | null;
  isSystem?: boolean | null;
  roleCategory: OrganizationUserRoleCategory;

  // ---

  organizationUsersCount?: number | null;
}
