import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/presentation/http/app";
import { prisma } from "../src/infrastructure/database/prisma/prisma.client";

const app = createApp();

describe("Day 10 — Connect Vendor Self-Registration with Buyer Vendor Management", () => {
  // Buyer A Context
  let buyerAToken: string;
  let buyerAManagerToken: string;
  let buyerAOrgId: string;

  // Buyer B Context
  let buyerBToken: string;
  let buyerBOrgId: string;

  // Registered Platform Vendor
  let platformVendorUserEmail: string;
  let platformVendorPassword = "VendorPassword123!";
  let platformVendorToken: string;
  let platformVendorId: string;

  // Manual Vendor created by Buyer A
  let manualVendorAId: string;

  beforeAll(async () => {
    // 1. Setup Buyer A (Org A)
    const adminAEmail = `buyerA.admin.${Date.now()}@example.com`;
    const regA = await request(app).post("/auth/register").send({
      name: "Buyer Admin A",
      email: adminAEmail,
      password: "Password123!",
    });
    const tempTokenA = regA.body.data.accessToken;
    const orgA = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${tempTokenA}`)
      .send({ name: "Buyer Org Alpha" });
    buyerAOrgId = orgA.body.data.organization.id;

    const loginA = await request(app)
      .post("/auth/login")
      .send({ email: adminAEmail, password: "Password123!" });
    buyerAToken = loginA.body.data.accessToken;

    // Manager in Org A for PR Approval
    const mgrEmail = `buyerA.mgr.${Date.now()}@example.com`;
    const mgrInvite = await request(app)
      .post("/organizations/users")
      .set("Authorization", `Bearer ${buyerAToken}`)
      .send({ name: "Buyer Manager A", email: mgrEmail, role: "MANAGER" });
    await request(app)
      .post("/auth/accept-invitation")
      .send({ token: mgrInvite.body.data.token, password: "Password123!" });
    const mgrLogin = await request(app)
      .post("/auth/login")
      .send({ email: mgrEmail, password: "Password123!" });
    buyerAManagerToken = mgrLogin.body.data.accessToken;

    // 2. Setup Buyer B (Org B)
    const adminBEmail = `buyerB.admin.${Date.now()}@example.com`;
    const regB = await request(app).post("/auth/register").send({
      name: "Buyer Admin B",
      email: adminBEmail,
      password: "Password123!",
    });
    const tempTokenB = regB.body.data.accessToken;
    const orgB = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${tempTokenB}`)
      .send({ name: "Buyer Org Beta" });
    buyerBOrgId = orgB.body.data.organization.id;

    const loginB = await request(app)
      .post("/auth/login")
      .send({ email: adminBEmail, password: "Password123!" });
    buyerBToken = loginB.body.data.accessToken;
  }, 30000);

  describe("1. Platform Vendor Registration (/vendor/register)", () => {
    it("Vendor self-registers via Vendor Portal -> status ACTIVE & source PLATFORM_REGISTERED", async () => {
      platformVendorUserEmail = `global.vendor.${Date.now()}@dell-platform.com`;

      const regRes = await request(app)
        .post("/auth/vendor/register")
        .send({
          companyName: "Dell Platform Tech",
          contactName: "Dell Sales Lead",
          email: platformVendorUserEmail,
          password: platformVendorPassword,
          phone: "+1 800 123 4567",
          city: "Austin",
          country: "USA",
        })
        .expect(201);

      expect(regRes.body.success).toBe(true);
      expect(regRes.body.data.accessToken).toBeDefined();
      expect(regRes.body.data.vendor.id).toBeDefined();
      expect(regRes.body.data.vendor.source).toBe("PLATFORM_REGISTERED");
      expect(regRes.body.data.vendor.hasVendorPortal).toBe(true);

      platformVendorId = regRes.body.data.vendor.id;
      platformVendorToken = regRes.body.data.accessToken;
    });

    it("Supports API endpoint alias POST /api/v1/vendor/auth/register", async () => {
      const aliasEmail = `alias.vendor.${Date.now()}@hp-platform.com`;
      const res = await request(app)
        .post("/api/v1/vendor/auth/register")
        .send({
          companyName: "HP Platform Solutions",
          contactName: "HP Rep",
          email: aliasEmail,
          password: "VendorPassword123!",
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.vendor.source).toBe("PLATFORM_REGISTERED");
    });
  });

  describe("2. Vendor Discovery & Source Indicator (GET /api/v1/vendors)", () => {
    it("Buyer A discovers self-registered Platform Vendor in Vendor Directory", async () => {
      const res = await request(app)
        .get("/api/v1/vendors")
        .set("Authorization", `Bearer ${buyerAToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const found = res.body.data.find((v: any) => v.id === platformVendorId);
      expect(found).toBeDefined();
      expect(found.source).toBe("PLATFORM_REGISTERED");
      expect(found.hasVendorPortal).toBe(true);
    });

    it("Buyer A can view details of Platform Vendor (GET /api/v1/vendors/:id)", async () => {
      const res = await request(app)
        .get(`/api/v1/vendors/${platformVendorId}`)
        .set("Authorization", `Bearer ${buyerAToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(platformVendorId);
      expect(res.body.data.name).toBe("Dell Platform Tech");
      expect(res.body.data.source).toBe("PLATFORM_REGISTERED");
      expect(res.body.data.hasVendorPortal).toBe(true);
    });

    it("Cross-Buyer Access: Buyer B ALSO discovers the Platform Vendor", async () => {
      const res = await request(app)
        .get("/api/v1/vendors")
        .set("Authorization", `Bearer ${buyerBToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const found = res.body.data.find((v: any) => v.id === platformVendorId);
      expect(found).toBeDefined();
      expect(found.source).toBe("PLATFORM_REGISTERED");
    });

    it("Supports source filtering (source=PLATFORM_REGISTERED vs MANUALLY_ADDED)", async () => {
      const platformOnly = await request(app)
        .get("/api/v1/vendors?source=PLATFORM_REGISTERED")
        .set("Authorization", `Bearer ${buyerAToken}`)
        .expect(200);

      expect(platformOnly.body.success).toBe(true);
      expect(platformOnly.body.data.every((v: any) => v.source === "PLATFORM_REGISTERED")).toBe(true);
    });
  });

  describe("3. Preserve Manual Vendors & Tenant Isolation", () => {
    it("Buyer A creates a private manual vendor 'Local Supply Corp'", async () => {
      const res = await request(app)
        .post("/api/v1/vendors")
        .set("Authorization", `Bearer ${buyerAToken}`)
        .send({
          name: "Local Supply Corp",
          email: `local.vendor.${Date.now()}@local.com`,
          city: "Mumbai",
          country: "India",
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.source).toBe("MANUALLY_ADDED");
      manualVendorAId = res.body.data.id;
    });

    it("Buyer A sees 'Local Supply Corp' in their directory", async () => {
      const res = await request(app)
        .get("/api/v1/vendors")
        .set("Authorization", `Bearer ${buyerAToken}`)
        .expect(200);

      const found = res.body.data.find((v: any) => v.id === manualVendorAId);
      expect(found).toBeDefined();
      expect(found.source).toBe("MANUALLY_ADDED");
    });

    it("Tenant Isolation: Buyer B CANNOT see Buyer A's manual vendor", async () => {
      const res = await request(app)
        .get("/api/v1/vendors")
        .set("Authorization", `Bearer ${buyerBToken}`)
        .expect(200);

      const found = res.body.data.find((v: any) => v.id === manualVendorAId);
      expect(found).toBeUndefined();
    });
  });

  describe("4. Duplicate Detection & Prevention", () => {
    it("When Buyer A manually adds vendor matching Platform Vendor email -> links platform vendor without duplicating", async () => {
      const res = await request(app)
        .post("/api/v1/vendors")
        .set("Authorization", `Bearer ${buyerAToken}`)
        .send({
          name: "Dell Technologies Inc",
          email: platformVendorUserEmail,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(platformVendorId);
      expect(res.body.data.source).toBe("PLATFORM_REGISTERED");
    });
  });

  describe("5. RFQ Integration & Vendor Portal Access", () => {
    let prId: string;
    let rfqId: string;

    it("Buyer A creates APPROVED Purchase Request and issues RFQ to Platform Vendor", async () => {
      // 1. Create PR
      const prRes = await request(app)
        .post("/api/v1/purchase-requests")
        .set("Authorization", `Bearer ${buyerAToken}`)
        .send({
          title: "Enterprise Server Sourcing",
          items: [{ name: "Rack Server", quantity: 2, estimatedUnitPrice: 5000 }],
        });
      prId = prRes.body.data.id;

      // 2. Submit & Approve PR
      await request(app).post(`/api/v1/purchase-requests/${prId}/submit`).set("Authorization", `Bearer ${buyerAToken}`);
      await request(app).post(`/api/v1/purchase-requests/${prId}/approve`).set("Authorization", `Bearer ${buyerAManagerToken}`);

      // 3. Create RFQ selecting Platform Vendor
      const rfqRes = await request(app)
        .post("/api/v1/rfqs")
        .set("Authorization", `Bearer ${buyerAToken}`)
        .send({
          purchaseRequestId: prId,
          title: "Server Procurement RFQ",
          quotationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          items: [{ name: "Rack Server", quantity: 2, unit: "PCS" }],
          vendorIds: [platformVendorId],
        })
        .expect(201);

      rfqId = rfqRes.body.data.id;

      // 4. Send RFQ
      await request(app)
        .post(`/api/v1/rfqs/${rfqId}/send`)
        .set("Authorization", `Bearer ${buyerAToken}`)
        .send({ vendorIds: [platformVendorId] })
        .expect(200);
    });

    it("Platform Vendor logs in -> RFQ appears in Vendor Portal Dashboard", async () => {
      const res = await request(app)
        .get("/api/v1/vendor/rfqs")
        .set("Authorization", `Bearer ${platformVendorToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const assignedRfq = res.body.data.find((r: any) => r.id === rfqId);
      expect(assignedRfq).toBeDefined();
      expect(assignedRfq.title).toBe("Server Procurement RFQ");
    });
  });

  describe("6. Security & Governance Rules", () => {
    it("Buyer CANNOT edit a PLATFORM_REGISTERED vendor -> 400/403 Forbidden", async () => {
      const res = await request(app)
        .patch(`/api/v1/vendors/${platformVendorId}`)
        .set("Authorization", `Bearer ${buyerAToken}`)
        .send({ name: "Hacked Dell Name" })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Platform registered vendors cannot be edited");
    });
  });

  afterAll(async () => {
    // Auto-clean test data created during test execution
    await prisma.vendor.deleteMany({
      where: {
        OR: [
          { email: { contains: "1788" } },
          { email: { contains: "hp-platform.com" } },
          { email: { contains: "dell-platform.com" } },
          { email: { contains: "selfreg.com" } },
        ],
      },
    });
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: "1788" } },
          { email: { contains: "hp-platform.com" } },
          { email: { contains: "dell-platform.com" } },
          { email: { contains: "selfreg.com" } },
        ],
      },
    });
  });
});
