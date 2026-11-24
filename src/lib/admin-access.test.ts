import { describe, expect, it } from "vitest";

import { canAccessAdminPermission } from "@/lib/admin-access";

describe("canAccessAdminPermission", () => {
  it("preserves access for legacy admins without an admin level", () => {
    expect(
      canAccessAdminPermission({}, "dashboard.view"),
    ).toBe(true);
  });

  it("requires explicit permissions for restricted admins", () => {
    expect(
      canAccessAdminPermission(
        { admin_level: "admin", admin_permissions: ["users.view"] },
        "dashboard.view",
      ),
    ).toBe(false);
    expect(
      canAccessAdminPermission(
        { admin_level: "admin", admin_permissions: ["dashboard.view"] },
        "dashboard.view",
      ),
    ).toBe(true);
  });
});
