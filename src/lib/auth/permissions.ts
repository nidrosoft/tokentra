export type Role = "owner" | "admin" | "member" | "viewer";

export type Permission =
  | "org:read"
  | "org:write"
  | "org:delete"
  | "team:read"
  | "team:write"
  | "team:delete"
  | "project:read"
  | "project:write"
  | "project:delete"
  | "budget:read"
  | "budget:write"
  | "budget:delete"
  | "alert:read"
  | "alert:write"
  | "alert:delete"
  | "provider:read"
  | "provider:write"
  | "provider:delete"
  | "report:read"
  | "report:write"
  | "api_key:read"
  | "api_key:write"
  | "api_key:delete"
  | "member:read"
  | "member:write"
  | "member:delete"
  | "billing:read"
  | "billing:write";

const rolePermissions: Record<Role, Permission[]> = {
  owner: [
    "org:read", "org:write", "org:delete",
    "team:read", "team:write", "team:delete",
    "project:read", "project:write", "project:delete",
    "budget:read", "budget:write", "budget:delete",
    "alert:read", "alert:write", "alert:delete",
    "provider:read", "provider:write", "provider:delete",
    "report:read", "report:write",
    "api_key:read", "api_key:write", "api_key:delete",
    "member:read", "member:write", "member:delete",
    "billing:read", "billing:write",
  ],
  admin: [
    "org:read", "org:write",
    "team:read", "team:write", "team:delete",
    "project:read", "project:write", "project:delete",
    "budget:read", "budget:write", "budget:delete",
    "alert:read", "alert:write", "alert:delete",
    "provider:read", "provider:write", "provider:delete",
    "report:read", "report:write",
    "api_key:read", "api_key:write", "api_key:delete",
    "member:read", "member:write",
    "billing:read",
  ],
  member: [
    "org:read",
    "team:read",
    "project:read", "project:write",
    "budget:read",
    "alert:read", "alert:write",
    "provider:read",
    "report:read", "report:write",
    "api_key:read",
    "member:read",
  ],
  viewer: [
    "org:read",
    "team:read",
    "project:read",
    "budget:read",
    "alert:read",
    "provider:read",
    "report:read",
    "member:read",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function getPermissions(role: Role): Permission[] {
  return rolePermissions[role] ?? [];
}
