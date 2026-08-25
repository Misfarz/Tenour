import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/presentation/http/app";

const app = createApp();

describe("Day 6 — Task 2: Create Vendor Endpoint (POST /vendors)", () => {
  let adminToken: string;
  let procurementToken: string;
  let managerToken: string;
  let employeeToken: string;

  beforeAll(async () => {
    // 1. Register Admin and create Organization
    const adminUser = {
      name: "Org Admin D6",
      email: `admin.d6.${Date.now()}@example.com`,
      password: "Password123!",
    };
    const regRes = await request(app).post("/auth/register").send(adminUser);
    const tempToken = regRes.body.data.accessToken;

    const orgRes = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${tempToken}`)
      .send({ name: "Day 6 Buyer Tech" });
    adminToken = orgRes.body.data.accessToken || tempToken;

    // 2. Invite Procurement User
    const procEmail = `proc.d6.${Date.now()}@example.com`;
    const procInvite = await request(app)
      .post("/organizations/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Procurement Mgr", email: procEmail, role: "PROCUREMENT" });
    await request(app)
      .post("/auth/accept-invitation")
      .send({ token: procInvite.body.data.token, password: "Password123!" });
    const procLogin = await request(app)
      .post("/auth/login")
      .send({ email: procEmail, password: "Password123!" });
    procurementToken = procLogin.body.data.accessToken;

    // 3. Invite Manager User
    const mgrEmail = `mgr.d6.${Date.now()}@example.com`;
    const mgrInvite = await request(app)
      .post("/organizations/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Manager User", email: mgrEmail, role: "MANAGER" });
    await request(app)
      .post("/auth/accept-invitation")
      .send({ token: mgrInvite.body.data.token, password: "Password123!" });
    const mgrLogin = await request(app)
      .post("/auth/login")
      .send({ email: mgrEmail, password: "Password123!" });
    managerToken = mgrLogin.body.data.accessToken;

    // 4. Invite Employee User
    const empEmail = `emp.d6.${Date.now()}@example.com`;
    const empInvite = await request(app)
      .post("/organizations/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Employee User", email: empEmail, role: "EMPLOYEE" });
    await request(app)
      .post("/auth/accept-invitation")
      .send({ token: empInvite.body.data.token, password: "Password123!" });
    const empLogin = await request(app)
      .post("/auth/login")
      .send({ email: empEmail, password: "Password123!" });
    employeeToken = empLogin.body.data.accessToken;
  });

  describe("1. Authorization & RBAC Checks", () => {
    it("ORG_ADMIN can create a vendor -> 201 Created", async () => {
      const res = await request(app)
        .post("/vendors")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Dell Technologies",
          legalName: "Dell India Pvt Ltd",
          email: "sales@dell.com",
          phone: "+91 9876543210",
          city: "Bangalore",
          country: "India",
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Dell Technologies");
      expect(res.body.data.buyerVendorStatus).toBe("ACTIVE");
      expect(res.body.data.id).toBeDefined();
    });

    it("PROCUREMENT can create a vendor -> 201 Created", async () => {
      const res = await request(app)
        .post("/vendors")
        .set("Authorization", `Bearer ${procurementToken}`)
        .send({
          name: "HP Enterprise",
          email: "enterprise@hp.com",
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("HP Enterprise");
    });

    it("MANAGER CANNOT create a vendor -> 403 Forbidden", async () => {
      const res = await request(app)
        .post("/vendors")
        .set("Authorization", `Bearer ${managerToken}`)
        .send({ name: "Unauthorized Vendor" })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it("EMPLOYEE CANNOT create a vendor -> 403 Forbidden", async () => {
      const res = await request(app)
        .post("/vendors")
        .set("Authorization", `Bearer ${employeeToken}`)
        .send({ name: "Unauthorized Vendor" })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe("2. Validation & Security Checks", () => {
    it("Rejects creation with empty vendor name -> 400 Bad Request", async () => {
      const res = await request(app)
        .post("/vendors")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("Rejects creation with invalid email format -> 400 Bad Request", async () => {
      const res = await request(app)
        .post("/vendors")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Bad Email Vendor", email: "not-an-email" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });
});
