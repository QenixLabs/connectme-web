export function canAccessAdminPermission(
  user: { admin_level?: string; admin_permissions?: string[] },
  permission?: string | string[],
): boolean {
  if (!permission || user.admin_level !== "admin") return true;

  const permissions = user.admin_permissions ?? [];
  return Array.isArray(permission)
    ? permission.some((item) => permissions.includes(item))
    : permissions.includes(permission);
}
