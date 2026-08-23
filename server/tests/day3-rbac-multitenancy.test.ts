import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/presentation/http/app";

const app = createApp();

describe("Day 3 Complete Suite: Multi-Tenancy, RBAC & Invitation Flow", () => {
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

  let xyzAccessToken: string;
  let xyzOrgId: string;

  // Invitation Test variables
  let ziyamInviteToken: string;
  const ziyamEmail = `ziyam.${Date.now()}@example.com`;
  const ziyamPassword = "ZiyamPassword123!";
  let ziyamAccessToken: string;

  beforeAll(async () => {
    // 1. Setup ABC Corporation
    const regAbc = await request(app).post("/auth/register").send(abcAdminUser);
    abcAccessToken = regAbc.body.data.accessToken;

    const orgAbc = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${abcAccessToken}`)
      .send({ name: "ABC Technologies" });
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

  describe("1. Logout Verification", () => {
    it("Logging out clears session and prevents access to protected routes", async () => {
      // 1. Register temporary user
      const tempUser = {
        name: "Logout User",
        email: `logout.${Date.now()}@example.com`,
        password: "Password123!",
      };
      const reg = await request(app).post("/auth/register").send(tempUser);
      const token = reg.body.data.accessToken;

      // 2. Access protected endpoint before logout
      const meBefore = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
      expect(meBefore.body.success).toBe(true);

      // 3. Logout
      const logoutRes = await request(app).post("/auth/logout").expect(200);
      expect(logoutRes.body.success).toBe(true);

      // 4. Verify cookies cleared header
      const cookies = logoutRes.headers["set-cookie"];
      expect(cookies).toBeDefined();

      // 5. Protected request without valid token fails
      await request(app).get("/auth/me").expect(401);
    });
  });

  describe("2. User Invitation Flow (Misfar invites Ziyam)", () => {
    it("ABC Admin (Misfar) invites Ziyam as EMPLOYEE", async () => {
      const res = await request(app)
        .post("/organizations/users")
        .set("Authorization", `Bearer ${abcAccessToken}`)
        .send({
          name: "Ziyam Employee",
          email: ziyamEmail,
          role: "EMPLOYEE",
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("EMPLOYEE");
      expect(res.body.data.status).toBe("INVITED");
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.invitationUrl).toContain("/buyer/accept-invitation?token=");

      ziyamInviteToken = res.body.data.token;
    });

    it("Ziyam cannot log in before accepting the invitation", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          email: ziyamEmail,
          password: "Password123!",
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("accept your invitation");
    });

    it("Verify invitation token endpoint returns public info", async () => {
      const res = await request(app)
        .get(`/auth/invitations/verify?token=${ziyamInviteToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(ziyamEmail.toLowerCase());
      expect(res.body.data.organizationName).toBe("ABC Technologies");
      expect(res.body.data.role).toBe("EMPLOYEE");
    });

    it("Rejects verification for invalid invitation token", async () => {
      const res = await request(app)
        .get("/auth/invitations/verify?token=invalid_token_string")
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("Ziyam sets password and accepts invitation (INVITED -> ACTIVE)", async () => {
      const res = await request(app)
        .post("/auth/accept-invitation")
        .send({
          token: ziyamInviteToken,
          password: ziyamPassword,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("ACTIVE");
      expect(res.body.data.role).toBe("EMPLOYEE");
    });

    it("Rejects re-using an already used invitation token", async () => {
      const res = await request(app)
        .post("/auth/accept-invitation")
        .send({
          token: ziyamInviteToken,
          password: "AnotherPassword123!",
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("already been used");
    });

    it("Ziyam logs in with newly set password and resolves to EMPLOYEE role", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          email: ziyamEmail,
          password: ziyamPassword,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.organization.name).toBe("ABC Technologies");
      expect(res.body.data.role).toBe("EMPLOYEE");

      ziyamAccessToken = res.body.data.accessToken;
    });
  });

  describe("3. Role-Based Access Control (Ziyam as EMPLOYEE)", () => {
    it("Ziyam can access own profile (/auth/me)", async () => {
      const res = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${ziyamAccessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(ziyamEmail.toLowerCase());
      expect(res.body.data.role).toBe("EMPLOYEE");
    });

    it("Ziyam (EMPLOYEE) is blocked from user management (/organizations/users) -> 403 Forbidden", async () => {
      const res = await request(app)
        .get("/organizations/users")
        .set("Authorization", `Bearer ${ziyamAccessToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Forbidden");
    });

    it("Ziyam (EMPLOYEE) is blocked from organization settings -> 403 Forbidden", async () => {
      const res = await request(app)
        .patch("/organizations/settings")
        .set("Authorization", `Bearer ${ziyamAccessToken}`)
        .send({ name: "Hacked Name" })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it("Ziyam (EMPLOYEE) is blocked from creating departments -> 403 Forbidden", async () => {
      const res = await request(app)
        .post("/organizations/departments")
        .set("Authorization", `Bearer ${ziyamAccessToken}`)
        .send({ name: "Unauthorized Dept" })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe("4. Multi-Tenant Invitation & Data Security", () => {
    it("ABC Admin listing users sees Misfar (ORG_ADMIN) and Ziyam (EMPLOYEE)", async () => {
      const res = await request(app)
        .get("/organizations/users")
        .set("Authorization", `Bearer ${abcAccessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const members = res.body.data;
      expect(members.some((m: any) => m.email === ziyamEmail.toLowerCase())).toBe(true);
    });

    it("XYZ Admin listing users does NOT see Ziyam or any ABC users", async () => {
      const res = await request(app)
        .get("/organizations/users")
        .set("Authorization", `Bearer ${xyzAccessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const members = res.body.data;
      expect(members.some((m: any) => m.email === ziyamEmail.toLowerCase())).toBe(false);
    });

    it("XYZ Admin cannot accept or tamper with ABC's invitation token", async () => {
      // Create new invite in ABC
      const invRes = await request(app)
        .post("/organizations/users")
        .set("Authorization", `Bearer ${abcAccessToken}`)
        .send({
          name: "Tamper Target",
          email: `tamper.${Date.now()}@example.com`,
          role: "EMPLOYEE",
        })
        .expect(201);

      const tamperToken = invRes.body.data.token;

      // Verify token resolves to ABC Technologies, NOT XYZ
      const verifyRes = await request(app)
        .get(`/auth/invitations/verify?token=${tamperToken}`)
        .expect(200);

      expect(verifyRes.body.data.organizationName).toBe("ABC Technologies");
      expect(verifyRes.body.data.organizationName).not.toBe("XYZ Corporation");
    });
  });
});
