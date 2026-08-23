import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/presentation/http/app";
import { prisma } from "../src/infrastructure/database/prisma/prisma.client";

const app = createApp();

describe("Day 2: Database + Authentication Flow", () => {
  const testUser = {
    name: "Misfar",
    email: `misfar.test.${Date.now()}@example.com`,
    password: "Password123!",
  };

  let accessToken: string;
  let refreshTokenCookie: string;
  let userId: string;

  it("1. Register user without automatically creating an organization", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send(testUser)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.name).toBe(testUser.name);
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.organization).toBeNull();
    expect(res.body.data.role).toBeNull();
    expect(res.body.data.accessToken).toBeDefined();

    userId = res.body.data.user.id;
  });

  it("Test: Reject duplicate email registration", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send(testUser)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Email already exists");
  });

  it("3. Login user and receive tokens", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.name).toBe(testUser.name);
    expect(res.body.data.user.password).toBeUndefined();

    accessToken = res.body.data.accessToken;

    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    const refreshCookie = (cookies as string[]).find((c) => c.startsWith("refreshToken="));
    expect(refreshCookie).toBeDefined();
    refreshTokenCookie = refreshCookie!;
  });

  it("Test: Reject login with wrong password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: testUser.email,
        password: "WrongPassword!",
      })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Invalid email or password");
  });

  it("5. Create organization and user becomes ORG_ADMIN", async () => {
    const res = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "ABC Technologies" })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.organization).toBeDefined();
    expect(res.body.data.organization.name).toBe("ABC Technologies");
    expect(res.body.data.role).toBe("ORG_ADMIN");
  });

  it("Test: Reject invalid organization request (empty name)", async () => {
    const res = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "" })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it("7 & 8. Access /auth/me and verify user + organization + role returned", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.id).toBe(userId);
    expect(res.body.data.user.name).toBe(testUser.name);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.organization).toBeDefined();
    expect(res.body.data.organization.name).toBe("ABC Technologies");
    expect(res.body.data.role).toBe("ORG_ADMIN");
  });

  it("Test: Refresh token endpoint", async () => {
    const res = await request(app)
      .post("/auth/refresh")
      .set("Cookie", [refreshTokenCookie])
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("Test: Reject missing JWT on protected endpoint", async () => {
    const res = await request(app)
      .get("/auth/me")
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Unauthorized");
  });

  it("Test: Reject invalid JWT on protected endpoint", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", "Bearer invalid.jwt.token")
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Unauthorized");
  });

  it("10. Logout and verify protected access fails appropriately", async () => {
    const logoutRes = await request(app)
      .post("/auth/logout")
      .expect(200);

    expect(logoutRes.body.success).toBe(true);

    const meRes = await request(app)
      .get("/auth/me")
      .expect(401);

    expect(meRes.body.success).toBe(false);
  });
});
