import { describe, expect, it } from "vitest";

import {
  hasAllowedRole,
  isActiveTeamMember,
  ROUTE_ROLES,
} from "./adminPermissions";

describe("admin permissions", () => {
  it("allows only active known team roles into the admin shell", () => {
    expect(isActiveTeamMember({ role: "admin", status: "active" })).toBe(true);
    expect(isActiveTeamMember({ role: "admin", status: "suspended" })).toBe(
      false,
    );
    expect(isActiveTeamMember({ role: "unknown", status: "active" })).toBe(
      false,
    );
  });

  it("limits team management to owners", () => {
    expect(
      hasAllowedRole(
        { role: "owner", status: "active" },
        ROUTE_ROLES.users,
      ),
    ).toBe(true);
    expect(
      hasAllowedRole(
        { role: "admin", status: "active" },
        ROUTE_ROLES.users,
      ),
    ).toBe(false);
  });

  it("keeps operations available to owner, admin and operator", () => {
    for (const role of ["owner", "admin", "operator"]) {
      expect(
        hasAllowedRole({ role, status: "active" }, ROUTE_ROLES.bookings),
      ).toBe(true);
    }

    expect(
      hasAllowedRole(
        { role: "technician", status: "active" },
        ROUTE_ROLES.bookings,
      ),
    ).toBe(false);
  });
});
