import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/presentation/http/app";

const app = createApp();

describe("Day 7 — RFQ & Sourcing Suite: RFQs, Vendor Selection, Sending, RBAC & Isolation", () => {
  // ABC Org Tokens
  let abcAdminToken: string;
  let abcProcurementToken: string;
  let abcEmployeeToken: string;
  let abcManagerToken: string;

  // XYZ Org Token
  let xyzAdminToken: string;

  // PR IDs
  let approvedPrId: string;
  let draftPrId: string;

  // Vendor IDs
  let dellVendorId: string;
  let hpVendorId: string;
  let inactiveVendorId: string;
  let xyzVendorId: string;

  // Vendor Auth & Accounts
  let dellInviteToken: string;
  const dellContactEmail = `dell.sales.${Date.now()}@dell.com`;
  let dellVendorAccessToken: string;

  let hpInviteToken: string;
  const hpContactEmail = `hp.sales.${Date.now()}@hp.com`;
  let hpVendorAccessToken: string;

  // RFQ IDs
  let testRfqId: string;

  beforeAll(async () => {
    // 1. ABC Org Setup
    const regAbc = await request(app).post("/auth/register").send({
      name: "ABC Admin D7",
      email: `abc.admin.d7.${Date.now()}@example.com`,
      password: "Password123!",
    });
    const tempAbcToken = regAbc.body.data.accessToken;

    const orgAbc = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${tempAbcToken}`)
      .send({ name: "ABC Sourcing Corp" });
    abcAdminToken = orgAbc.body.data.accessToken || tempAbcToken;

    // ABC Procurement User
    const procEmail = `abc.proc.d7.${Date.now()}@example.com`;
    const procInvite = await request(app)
      .post("/organizations/users")
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "ABC Procurement Mgr", email: procEmail, role: "PROCUREMENT" });
    await request(app)
      .post("/auth/accept-invitation")
      .send({ token: procInvite.body.data.token, password: "Password123!" });
    const procLogin = await request(app)
      .post("/auth/login")
      .send({ email: procEmail, password: "Password123!" });
    abcProcurementToken = procLogin.body.data.accessToken;

    // ABC Employee User
    const empEmail = `abc.emp.d7.${Date.now()}@example.com`;
    const empInvite = await request(app)
      .post("/organizations/users")
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "ABC Requester", email: empEmail, role: "EMPLOYEE" });
    await request(app)
      .post("/auth/accept-invitation")
      .send({ token: empInvite.body.data.token, password: "Password123!" });
    const empLogin = await request(app)
      .post("/auth/login")
      .send({ email: empEmail, password: "Password123!" });
    abcEmployeeToken = empLogin.body.data.accessToken;

    // ABC Manager User
    const mgrEmail = `abc.mgr.d7.${Date.now()}@example.com`;
    const mgrInvite = await request(app)
      .post("/organizations/users")
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "ABC Manager", email: mgrEmail, role: "MANAGER" });
    await request(app)
      .post("/auth/accept-invitation")
      .send({ token: mgrInvite.body.data.token, password: "Password123!" });
    const mgrLogin = await request(app)
      .post("/auth/login")
      .send({ email: mgrEmail, password: "Password123!" });
    abcManagerToken = mgrLogin.body.data.accessToken;

    // 2. XYZ Org Setup
    const regXyz = await request(app).post("/auth/register").send({
      name: "XYZ Admin D7",
      email: `xyz.admin.d7.${Date.now()}@example.com`,
      password: "Password123!",
    });
    const tempXyzToken = regXyz.body.data.accessToken;

    const orgXyz = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${tempXyzToken}`)
      .send({ name: "XYZ Sourcing Ltd" });
    xyzAdminToken = orgXyz.body.data.accessToken || tempXyzToken;

    // 3. Create Vendors for ABC
    const dellRes = await request(app)
      .post("/vendors")
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "Dell Technologies", email: "sales@dell.com" });
    dellVendorId = dellRes.body.data.id;

    const hpRes = await request(app)
      .post("/vendors")
      .set("Authorization", `Bearer ${abcProcurementToken}`)
      .send({ name: "HP Enterprise", email: "sales@hp.com" });
    hpVendorId = hpRes.body.data.id;

    const inactiveRes = await request(app)
      .post("/vendors")
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "Inactive Supplier", email: "inactive@vendor.com" });
    inactiveVendorId = inactiveRes.body.data.id;
    await request(app)
      .patch(`/vendors/${inactiveVendorId}/status`)
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ status: "INACTIVE" });

    // 4. Create Vendor for XYZ
    const xyzVendorRes = await request(app)
      .post("/vendors")
      .set("Authorization", `Bearer ${xyzAdminToken}`)
      .send({ name: "XYZ Vendor Supplier", email: "supplier@xyz.com" });
    xyzVendorId = xyzVendorRes.body.data.id;

    // 5. Onboard Dell and HP Vendor Portal Users
    const dellInviteRes = await request(app)
      .post(`/vendors/${dellVendorId}/invite`)
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "Dell Rep", email: dellContactEmail });
    dellInviteToken = dellInviteRes.body.data.token;
    await request(app)
      .post("/auth/vendor/accept-invitation")
      .send({ token: dellInviteToken, password: "VendorPassword123!" });
    const dellLogin = await request(app)
      .post("/auth/vendor/login")
      .send({ email: dellContactEmail, password: "VendorPassword123!" });
    dellVendorAccessToken = dellLogin.body.data.accessToken;

    const hpInviteRes = await request(app)
      .post(`/vendors/${hpVendorId}/invite`)
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "HP Rep", email: hpContactEmail });
    hpInviteToken = hpInviteRes.body.data.token;
    await request(app)
      .post("/auth/vendor/accept-invitation")
      .send({ token: hpInviteToken, password: "VendorPassword123!" });
    const hpLogin = await request(app)
      .post("/auth/vendor/login")
      .send({ email: hpContactEmail, password: "VendorPassword123!" });
    hpVendorAccessToken = hpLogin.body.data.accessToken;

    // 6. Create Purchase Requests (Approved & Draft)
    const draftPrRes = await request(app)
      .post("/purchase-requests")
      .set("Authorization", `Bearer ${abcEmployeeToken}`)
      .send({
        title: "Draft Laptops PR",
        items: [{ name: "Laptop", quantity: 50, estimatedUnitPrice: 1000 }],
      });
    draftPrId = draftPrRes.body.data.id;

    const appPrRes = await request(app)
      .post("/purchase-requests")
      .set("Authorization", `Bearer ${abcEmployeeToken}`)
      .send({
        title: "Approved Laptops PR",
        items: [{ name: "Business Laptop", quantity: 100, estimatedUnitPrice: 1200 }],
      });
    const prToApproveId = appPrRes.body.data.id;
    await request(app)
      .post(`/purchase-requests/${prToApproveId}/submit`)
      .set("Authorization", `Bearer ${abcEmployeeToken}`);
    await request(app)
      .post(`/purchase-requests/${prToApproveId}/approve`)
      .set("Authorization", `Bearer ${abcManagerToken}`);
    approvedPrId = prToApproveId;
  }, 30000);

  describe("1. RFQ Creation & Validation (POST /api/v1/rfqs)", () => {
    it("Rejects RFQ creation from unapproved Purchase Request -> 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/v1/rfqs")
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .send({
          purchaseRequestId: draftPrId,
          title: "Invalid RFQ",
          quotationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          items: [{ name: "Laptop", quantity: 10 }],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("APPROVED");
    });

    it("EMPLOYEE and MANAGER cannot create RFQ -> 403 Forbidden", async () => {
      await request(app)
        .post("/api/v1/rfqs")
        .set("Authorization", `Bearer ${abcEmployeeToken}`)
        .send({
          purchaseRequestId: approvedPrId,
          title: "Employee Unauthorized RFQ",
          quotationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          items: [{ name: "Laptop", quantity: 10 }],
        })
        .expect(403);

      await request(app)
        .post("/api/v1/rfqs")
        .set("Authorization", `Bearer ${abcManagerToken}`)
        .send({
          purchaseRequestId: approvedPrId,
          title: "Manager Unauthorized RFQ",
          quotationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          items: [{ name: "Laptop", quantity: 10 }],
        })
        .expect(403);
    });

    it("Rejects RFQ creation with INACTIVE vendor -> 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/v1/rfqs")
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .send({
          purchaseRequestId: approvedPrId,
          title: "Inactive Vendor RFQ",
          quotationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          items: [{ name: "Laptop", quantity: 10 }],
          vendorIds: [inactiveVendorId],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("not ACTIVE");
    });

    it("Rejects RFQ creation with vendor belonging to another organization -> 400/404", async () => {
      const res = await request(app)
        .post("/api/v1/rfqs")
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .send({
          purchaseRequestId: approvedPrId,
          title: "Cross Tenant Vendor RFQ",
          quotationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          items: [{ name: "Laptop", quantity: 10 }],
          vendorIds: [xyzVendorId],
        })
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it("PROCUREMENT creates DRAFT RFQ from Approved PR -> 201 Created", async () => {
      const deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .post("/api/v1/rfqs")
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .send({
          purchaseRequestId: approvedPrId,
          title: "1000 Business Laptops Sourcing",
          description: "High performance laptops required for enterprise rollout",
          quotationDeadline: deadline,
          deliveryRequirement: "Within 30 days of PO",
          items: [
            {
              name: "16 inch i7 Laptop",
              description: "16GB RAM, 512GB SSD",
              quantity: 100,
              unit: "PCS",
              specifications: "Core i7 13th Gen, Anti-glare display",
            },
          ],
          vendorIds: [dellVendorId, hpVendorId],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.rfqNumber).toMatch(/^RFQ-\d{4}$/);
      expect(res.body.data.status).toBe("DRAFT");
      expect(res.body.data.vendors).toHaveLength(2);
      testRfqId = res.body.data.id;
    });
  });

  describe("2. RFQ Listing, Details & Editing (GET/PATCH /api/v1/rfqs)", () => {
    it("ABC Procurement lists RFQs -> 200 OK", async () => {
      const res = await request(app)
        .get("/api/v1/rfqs")
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].id).toBe(testRfqId);
    });

    it("ABC Procurement views RFQ details -> 200 OK", async () => {
      const res = await request(app)
        .get(`/api/v1/rfqs/${testRfqId}`)
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("1000 Business Laptops Sourcing");
      expect(res.body.data.purchaseRequest.id).toBe(approvedPrId);
    });

    it("Procurement updates DRAFT RFQ description -> 200 OK", async () => {
      const res = await request(app)
        .patch(`/api/v1/rfqs/${testRfqId}`)
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .send({
          description: "Updated Sourcing Scope for 1000 Enterprise Laptops",
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe("Updated Sourcing Scope for 1000 Enterprise Laptops");
    });
  });

  describe("3. Sending RFQ & Status Transitions (POST /api/v1/rfqs/:id/send)", () => {
    it("Draft RFQ is NOT visible to vendors prior to sending", async () => {
      const res = await request(app)
        .get("/api/v1/vendor/rfqs")
        .set("Authorization", `Bearer ${dellVendorAccessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });

    it("ABC Procurement sends RFQ -> transitions to OPEN & notifies vendors", async () => {
      const res = await request(app)
        .post(`/api/v1/rfqs/${testRfqId}/send`)
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("OPEN");
    });

    it("Cannot edit RFQ once status is OPEN -> 400 Bad Request", async () => {
      const res = await request(app)
        .patch(`/api/v1/rfqs/${testRfqId}`)
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .send({ title: "Attempt to edit OPEN RFQ" })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("DRAFT");
    });
  });

  describe("4. Vendor Portal RFQ Access & Vendor Isolation", () => {
    it("Dell Vendor can view assigned RFQ -> 200 OK", async () => {
      const res = await request(app)
        .get("/api/v1/vendor/rfqs")
        .set("Authorization", `Bearer ${dellVendorAccessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe(testRfqId);
      expect(res.body.data[0].buyer.name).toBe("ABC Sourcing Corp");
    });

    it("Dell Vendor detail view contains RFQ items & specs but hides internal PR & other vendors", async () => {
      const res = await request(app)
        .get(`/api/v1/vendor/rfqs/${testRfqId}`)
        .set("Authorization", `Bearer ${dellVendorAccessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].name).toBe("16 inch i7 Laptop");
      
      // Strict Isolation Checks
      expect(res.body.data.purchaseRequest).toBeUndefined(); // Internal PR hidden!
      expect(res.body.data.vendors).toBeUndefined(); // Other vendors hidden!
      expect(res.body.data.approval).toBeUndefined(); // Approval workflow hidden!
    });

    it("HP Vendor can also view assigned RFQ -> 200 OK", async () => {
      const res = await request(app)
        .get(`/api/v1/vendor/rfqs/${testRfqId}`)
        .set("Authorization", `Bearer ${hpVendorAccessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testRfqId);
    });
  });

  describe("5. Tenant Isolation & Cancellation Checks", () => {
    it("XYZ Admin CANNOT view or cancel ABC RFQ -> 404 Not Found", async () => {
      await request(app)
        .get(`/api/v1/rfqs/${testRfqId}`)
        .set("Authorization", `Bearer ${xyzAdminToken}`)
        .expect(404);

      await request(app)
        .post(`/api/v1/rfqs/${testRfqId}/cancel`)
        .set("Authorization", `Bearer ${xyzAdminToken}`)
        .expect(404);
    });

    it("ABC Admin cancels OPEN RFQ -> status transitions to CANCELLED", async () => {
      const res = await request(app)
        .post(`/api/v1/rfqs/${testRfqId}/cancel`)
        .set("Authorization", `Bearer ${abcAdminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("CANCELLED");
    });
  });
});
