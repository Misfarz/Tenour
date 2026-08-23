import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/presentation/http/app";

const app = createApp();

describe("Day 3: Multi-Tenancy + RBAC Suite", () => {
  // Test Tenants
  // ABC Corporation
  const abcAdminUser = {
    name: "Misfar Admin",
    email: `misfar.abc.${Date.now()}@example.com`,
    password: "Password123!",
  };

  // XYZ Corporation
  const xyzAdminUser = {
    name: "Alex Admin",
    email: `alex.xyz.${Date.now()}@example.com`,
    password: "Password123!",
  };

  let abcAccessToken: string;
  let abcOrgId: string;
  let abcEmployeeMemberId: string;

  let xyzAccessToken: string;
  let xyzOrgId: string;
  let xyzEmployeeMemberId: string;

  let abcDeptId: string;

  beforeAll(async () => {
    // 1. Setup ABC Corporation
    const regAbc = await request(app).post("/auth/register").send(abcAdminUser);
    abcAccessToken = regAbc.body.data.accessToken;

    const orgAbc = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${abcAccessToken}`)
      .send({ name: "ABC Corporation" });
    abcOrgId = orgAbc.body.data.organization.id;

    // 2. Setup XYZ Corporation
    const regXyz = await request(app).post("/auth/register").send(xyzAdminUser);
    xyzAccessToken = regXyz.body.data.accessToken;

    const orgXyz = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${xyzAccessToken}`)
      .send({ name: "XYZ Corporation" });
    xyzOrgId = orgXyz.body.data.organization.id;
  });

  describe("1. Authentication & Tenant Context Guards", () => {
    it("Rejects unauthenticated requests with 401", async () => {
      const res = await request(app).get("/organizations/users").expect(401);
      expect(res.body.success).toBe(false);
    });

    it("Rejects invalid JWT tokens with 401", async () => {
      const res = await request(app)
        .get("/organizations/users")
        .set("Authorization", "Bearer invalid.token.string")
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe("2. Organization User Management & Role Assignment (ABC Admin)", () => {
    it("ABC Admin adds an EMPLOYEE (Arun) to ABC Corporation", async () => {
      const res = await request(app)
        .post("/organizations/users")
        .set("Authorization", `Bearer ${abcAccessToken}`)
        .send({
          name: "Arun Employee",
          email: `arun.abc.${Date.now()}@example.com`,
          password: "Password123!",
          role: "EMPLOYEE",
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("EMPLOYEE");
      expect(res.body.data.name).toBe("Arun Employee");
      abcEmployeeMemberId = res.body.data.id;
    });

    it("ABC Admin adds a MANAGER (Rahul) and PROCUREMENT (Sarah)", async () => {
      const resManager = await request(app)
        .post("/organizations/users")
        .set("Authorization", `Bearer ${abcAccessToken}`)
        .send({
          name: "Rahul Manager",
          email: `rahul.abc.${Date.now()}@example.com`,
          password: "Password123!",
          role: "MANAGER",
        })
        .expect(201);

      expect(resManager.body.data.role).toBe("MANAGER");

      const resProc = await request(app)
        .post("/organizations/users")
        .set("Authorization", `Bearer ${abcAccessToken}`)
        .send({
          name: "Sarah Procurement",
          email: `sarah.abc.${Date.now()}@example.com`,
          password: "Password123!",
          role: "PROCUREMENT",
        })
        .expect(201);

      expect(resProc.body.data.role).toBe("PROCUREMENT");
    });

    it("ABC Admin changes Arun's role from EMPLOYEE to MANAGER", async () => {
      const res = await request(app)
        .patch(`/organizations/users/${abcEmployeeMemberId}/role`)
        .set("Authorization", `Bearer ${abcAccessToken}`)
        .send({ role: "MANAGER" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("MANAGER");
    });

    it("Rejects setting an invalid role string", async () => {
      const res = await request(app)
        .patch(`/organizations/users/${abcEmployeeMemberId}/role`)
        .set("Authorization", `Bearer ${abcAccessToken}`)
        .send({ role: "SUPER_ADMIN_INVALID" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe("3. Tenant Data Isolation (ABC vs XYZ)", () => {
    beforeAll(async () => {
      // Add David (EMPLOYEE) to XYZ Corporation
      const res = await request(app)
        .post("/organizations/users")
        .set("Authorization", `Bearer ${xyzAccessToken}`)
        .send({
          name: "David Employee",
          email: `david.xyz.${Date.now()}@example.com`,
          password: "Password123!",
          role: "EMPLOYEE",
        })
        .expect(201);

      xyzEmployeeMemberId = res.body.data.id;
    });

    it("ABC Admin listing users returns ONLY ABC users", async () => {
      const res = await request(app)
        .get("/organizations/users")
        .set("Authorization", `Bearer ${abcAccessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const emails: string[] = res.body.data.map((u: any) => u.email);
      expect(emails.some((e) => e.includes("misfar.abc"))).toBe(true);
      expect(emails.some((e) => e.includes("arun.abc"))).toBe(true);

      // Must NOT contain XYZ users
      expect(emails.some((e) => e.includes("alex.xyz"))).toBe(false);
      expect(emails.some((e) => e.includes("david.xyz"))).toBe(false);
    });

    it("XYZ Admin listing users returns ONLY XYZ users", async () => {
      const res = await request(app)
        .get("/organizations/users")
        .set("Authorization", `Bearer ${xyzAccessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const emails: string[] = res.body.data.map((u: any) => u.email);
      expect(emails.some((e) => e.includes("alex.xyz"))).toBe(true);
      expect(emails.some((e) => e.includes("david.xyz"))).toBe(true);

      // Must NOT contain ABC users
      expect(emails.some((e) => e.includes("misfar.abc"))).toBe(false);
    });

    it("ABC Admin trying to modify XYZ user's role is rejected (404/403)", async () => {
      const res = await request(app)
        .patch(`/organizations/users/${xyzEmployeeMemberId}/role`)
        .set("Authorization", `Bearer ${abcAccessToken}`)
        .send({ role: "ORG_ADMIN" })
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("User not found in your organization");
    });
  });

  describe("4. Department Management & Tenant Scoping", () => {
    it("ABC Admin creates an IT department in ABC Corporation", async () => {
      const res = await request(app)
        .post("/organizations/departments")
        .set("Authorization", `Bearer ${abcAccessToken}`)
        .send({ name: "IT Department" })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("IT Department");
      abcDeptId = res.body.data.id;
    });

    it("XYZ Admin listing departments does NOT see ABC's IT department", async () => {
      const res = await request(app)
        .get("/organizations/departments")
        .set("Authorization", `Bearer ${xyzAccessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const deptNames: string[] = res.body.data.map((d: any) => d.name);
      expect(deptNames).not.toContain("IT Department");
    });

    it("XYZ Admin trying to delete ABC's IT department is rejected (404)", async () => {
      const res = await request(app)
        .delete(`/organizations/departments/${abcDeptId}`)
        .set("Authorization", `Bearer ${xyzAccessToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Department not found in your organization");
    });
  });

  describe("5. Role Authorization & Access Control (Non-Admin Rejection)", () => {
    let employeeAccessToken: string;

    beforeAll(async () => {
      // Login as Arun (EMPLOYEE/MANAGER in ABC)
      const loginRes = await request(app)
        .post("/auth/login")
        .send({
          email: `arun.abc.${Date.now()}`.replace(/\d+$/, "") + "@example.com", // Find Arun's exact email or create an explicit employee
          password: "Password123!",
        });

      if (!loginRes.body.data?.accessToken) {
        // If login by dynamic email is tricky, create a clean EMPLOYEE user
        const newEmpEmail = `arun.emp.${Date.now()}@example.com`;
        await request(app)
          .post("/organizations/users")
          .set("Authorization", `Bearer ${abcAccessToken}`)
          .send({
            name: "Arun Emp",
            email: newEmpEmail,
            password: "Password123!",
            role: "EMPLOYEE",
          });

        const empLogin = await request(app).post("/auth/login").send({
          email: newEmpEmail,
          password: "Password123!",
        });

        employeeAccessToken = empLogin.body.data.accessToken;
      } else {
        employeeAccessToken = loginRes.body.data.accessToken;
      }
    });

    it("EMPLOYEE attempting to view user list is rejected with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/organizations/users")
        .set("Authorization", `Bearer ${employeeAccessToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Forbidden");
    });

    it("EMPLOYEE attempting to add a user is rejected with 403 Forbidden", async () => {
      const res = await request(app)
        .post("/organizations/users")
        .set("Authorization", `Bearer ${employeeAccessToken}`)
        .send({
          name: "Hacker User",
          email: "hacker@example.com",
          role: "ORG_ADMIN",
        })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Forbidden");
    });

    it("EMPLOYEE attempting to update organization settings is rejected with 403 Forbidden", async () => {
      const res = await request(app)
        .patch("/organizations/settings")
        .set("Authorization", `Bearer ${employeeAccessToken}`)
        .send({ name: "Hacked Corp" })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe("6. Member Deactivation & Single Admin Protection", () => {
    it("Prevents deactivating the only active ORG_ADMIN", async () => {
      // Find ABC Admin's member ID
      const usersRes = await request(app)
        .get("/organizations/users")
        .set("Authorization", `Bearer ${abcAccessToken}`)
        .expect(200);

      const adminMember = usersRes.body.data.find((u: any) => u.role === "ORG_ADMIN");
      expect(adminMember).toBeDefined();

      const res = await request(app)
        .patch(`/organizations/users/${adminMember.id}/status`)
        .set("Authorization", `Bearer ${abcAccessToken}`)
        .send({ status: "INACTIVE" })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Cannot deactivate the only active organization admin");
    });

    it("Allows deactivating a non-admin member", async () => {
      const res = await request(app)
        .patch(`/organizations/users/${abcEmployeeMemberId}/status`)
        .set("Authorization", `Bearer ${abcAccessToken}`)
        .send({ status: "INACTIVE" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("INACTIVE");
    });
  });
});
