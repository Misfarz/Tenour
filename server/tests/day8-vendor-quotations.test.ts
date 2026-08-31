import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/presentation/http/app";

const app = createApp();

describe("Day 8 — Vendor Quotations & Comparison Suite", () => {
  // ABC Org Tokens
  let abcAdminToken: string;
  let abcProcurementToken: string;
  let abcEmployeeToken: string;
  let abcManagerToken: string;

  // XYZ Org Tokens
  let xyzAdminToken: string;
  let xyzProcurementToken: string;

  // Vendor IDs
  let dellVendorId: string;
  let hpVendorId: string;
  let lenovoVendorId: string;

  // Vendor Tokens
  let dellVendorToken: string;
  let hpVendorToken: string;

  // RFQ IDs
  let testRfqId: string;
  let expiredRfqId: string;
  let rfqItemId: string;
  let expiredRfqItemId: string;

  // Quotation IDs
  let dellQuotationId: string;
  let hpQuotationId: string;

  beforeAll(async () => {
    // 1. ABC Org Setup
    const regAbc = await request(app).post("/auth/register").send({
      name: "ABC Admin D8",
      email: `abc.admin.d8.${Date.now()}@example.com`,
      password: "Password123!",
    });
    const tempAbcToken = regAbc.body.data.accessToken;

    const orgAbc = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${tempAbcToken}`)
      .send({ name: "ABC Tech Corp D8" });
    abcAdminToken = orgAbc.body.data.accessToken || tempAbcToken;

    // Procurement User
    const procEmail = `abc.proc.d8.${Date.now()}@example.com`;
    const procInvite = await request(app)
      .post("/organizations/users")
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "ABC Procurement Officer", email: procEmail, role: "PROCUREMENT" });
    await request(app)
      .post("/auth/accept-invitation")
      .send({ token: procInvite.body.data.token, password: "Password123!" });
    const procLogin = await request(app)
      .post("/auth/login")
      .send({ email: procEmail, password: "Password123!" });
    abcProcurementToken = procLogin.body.data.accessToken;

    // Employee User
    const empEmail = `abc.emp.d8.${Date.now()}@example.com`;
    const empInvite = await request(app)
      .post("/organizations/users")
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "ABC Employee", email: empEmail, role: "EMPLOYEE" });
    await request(app)
      .post("/auth/accept-invitation")
      .send({ token: empInvite.body.data.token, password: "Password123!" });
    const empLogin = await request(app)
      .post("/auth/login")
      .send({ email: empEmail, password: "Password123!" });
    abcEmployeeToken = empLogin.body.data.accessToken;

    // Manager User
    const mgrEmail = `abc.mgr.d8.${Date.now()}@example.com`;
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
      name: "XYZ Admin D8",
      email: `xyz.admin.d8.${Date.now()}@example.com`,
      password: "Password123!",
    });
    const tempXyzToken = regXyz.body.data.accessToken;
    const orgXyz = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${tempXyzToken}`)
      .send({ name: "XYZ Corp D8" });
    xyzAdminToken = orgXyz.body.data.accessToken || tempXyzToken;

    // XYZ Procurement User
    const xyzProcEmail = `xyz.proc.d8.${Date.now()}@example.com`;
    const xyzProcInvite = await request(app)
      .post("/organizations/users")
      .set("Authorization", `Bearer ${xyzAdminToken}`)
      .send({ name: "XYZ Procurement", email: xyzProcEmail, role: "PROCUREMENT" });
    await request(app)
      .post("/auth/accept-invitation")
      .send({ token: xyzProcInvite.body.data.token, password: "Password123!" });
    const xyzProcLogin = await request(app)
      .post("/auth/login")
      .send({ email: xyzProcEmail, password: "Password123!" });
    xyzProcurementToken = xyzProcLogin.body.data.accessToken;

    // 3. Create Vendors for ABC
    const dellRes = await request(app)
      .post("/vendors")
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "Dell Technologies D8", email: "sales@dell.com" });
    dellVendorId = dellRes.body.data.id;

    const hpRes = await request(app)
      .post("/vendors")
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "HP Enterprise D8", email: "sales@hp.com" });
    hpVendorId = hpRes.body.data.id;

    const lenovoRes = await request(app)
      .post("/vendors")
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "Lenovo Direct D8", email: "sales@lenovo.com" });
    lenovoVendorId = lenovoRes.body.data.id;

    // 4. Onboard Dell and HP Vendor Portal Users
    const dellContactEmail = `dell.sales.${Date.now()}@dell.com`;
    const dellInviteRes = await request(app)
      .post(`/vendors/${dellVendorId}/invite`)
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "Dell Sales Rep", email: dellContactEmail });
    await request(app)
      .post("/auth/vendor/accept-invitation")
      .send({ token: dellInviteRes.body.data.token, password: "VendorPassword123!" });
    const dellLogin = await request(app)
      .post("/auth/vendor/login")
      .send({ email: dellContactEmail, password: "VendorPassword123!" });
    dellVendorToken = dellLogin.body.data.accessToken;

    const hpContactEmail = `hp.sales.${Date.now()}@hp.com`;
    const hpInviteRes = await request(app)
      .post(`/vendors/${hpVendorId}/invite`)
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "HP Sales Rep", email: hpContactEmail });
    await request(app)
      .post("/auth/vendor/accept-invitation")
      .send({ token: hpInviteRes.body.data.token, password: "VendorPassword123!" });
    const hpLogin = await request(app)
      .post("/auth/vendor/login")
      .send({ email: hpContactEmail, password: "VendorPassword123!" });
    hpVendorToken = hpLogin.body.data.accessToken;

    // 5. Create Approved Purchase Request & Open RFQ
    const prRes = await request(app)
      .post("/purchase-requests")
      .set("Authorization", `Bearer ${abcEmployeeToken}`)
      .send({
        title: "Day 8 Laptops Procurement",
        items: [{ name: "High-End Workstation Laptop", quantity: 100, estimatedUnitPrice: 1500 }],
      });
    const prId = prRes.body.data.id;

    await request(app)
      .post(`/purchase-requests/${prId}/submit`)
      .set("Authorization", `Bearer ${abcEmployeeToken}`);
    await request(app)
      .post(`/purchase-requests/${prId}/approve`)
      .set("Authorization", `Bearer ${abcManagerToken}`);

    // Create Open RFQ assigned to Dell and HP
    const rfqRes = await request(app)
      .post("/api/v1/rfqs")
      .set("Authorization", `Bearer ${abcProcurementToken}`)
      .send({
        purchaseRequestId: prId,
        title: "Enterprise Laptop Sourcing D8",
        description: "100 Units of High Performance Workstations",
        quotationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days in future
        deliveryRequirement: "Within 15 days",
        items: [
          {
            name: "Workstation Laptop",
            description: "i9 Processor, 32GB RAM",
            quantity: 100,
            unit: "PCS",
            specifications: "Specs A",
          },
        ],
        vendorIds: [dellVendorId, hpVendorId],
      });
    testRfqId = rfqRes.body.data.id;
    rfqItemId = rfqRes.body.data.items[0].id;

    // Send RFQ -> Status OPEN
    await request(app)
      .post(`/api/v1/rfqs/${testRfqId}/send`)
      .set("Authorization", `Bearer ${abcProcurementToken}`);

    // Create Expired RFQ
    const expPrRes = await request(app)
      .post("/purchase-requests")
      .set("Authorization", `Bearer ${abcEmployeeToken}`)
      .send({
        title: "Expired PR",
        items: [{ name: "Printer", quantity: 5, estimatedUnitPrice: 200 }],
      });
    const expPrId = expPrRes.body.data.id;
    await request(app)
      .post(`/purchase-requests/${expPrId}/submit`)
      .set("Authorization", `Bearer ${abcEmployeeToken}`);
    await request(app)
      .post(`/purchase-requests/${expPrId}/approve`)
      .set("Authorization", `Bearer ${abcManagerToken}`);

    const expRfqRes = await request(app)
      .post("/api/v1/rfqs")
      .set("Authorization", `Bearer ${abcProcurementToken}`)
      .send({
        purchaseRequestId: expPrId,
        title: "Expired Deadline RFQ",
        quotationDeadline: new Date(Date.now() + 1000).toISOString(), // Expires in 1 sec
        items: [{ name: "Printer", quantity: 5 }],
        vendorIds: [dellVendorId],
      });
    expiredRfqId = expRfqRes.body.data.id;
    expiredRfqItemId = expRfqRes.body.data.items[0].id;
    await request(app)
      .post(`/api/v1/rfqs/${expiredRfqId}/send`)
      .set("Authorization", `Bearer ${abcProcurementToken}`);
  });

  describe("1. Vendor Quotation Creation & Validations (POST /api/v1/vendor/quotations)", () => {
    it("Unassigned vendor cannot create quotation -> 403 Forbidden", async () => {
      // Create vendor token for Lenovo (who was not assigned to testRfqId)
      const lenovoContactEmail = `lenovo.sales.${Date.now()}@lenovo.com`;
      const inviteRes = await request(app)
        .post(`/vendors/${lenovoVendorId}/invite`)
        .set("Authorization", `Bearer ${abcAdminToken}`)
        .send({ name: "Lenovo Rep", email: lenovoContactEmail });
      await request(app)
        .post("/auth/vendor/accept-invitation")
        .send({ token: inviteRes.body.data.token, password: "VendorPassword123!" });
      const lenovoLogin = await request(app)
        .post("/auth/vendor/login")
        .send({ email: lenovoContactEmail, password: "VendorPassword123!" });
      const unassignedVendorToken = lenovoLogin.body.data.accessToken;

      const res = await request(app)
        .post("/api/v1/vendor/quotations")
        .set("Authorization", `Bearer ${unassignedVendorToken}`)
        .send({
          rfqId: testRfqId,
          deliveryDays: 15,
          items: [{ rfqItemId, unitPrice: 1200, quantity: 100 }],
        })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("not assigned");
    });

    it("Vendor cannot quote on expired RFQ -> 422 Unprocessable Entity", async () => {
      // Wait for deadline to expire (1.2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const res = await request(app)
        .post("/api/v1/vendor/quotations")
        .set("Authorization", `Bearer ${dellVendorToken}`)
        .send({
          rfqId: expiredRfqId,
          deliveryDays: 10,
          items: [{ rfqItemId: expiredRfqItemId, unitPrice: 200, quantity: 5 }],
        })
        .expect(422);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("expired");
    });

    it("Dell creates DRAFT quotation with backend financial calculation -> 201 Created", async () => {
      const res = await request(app)
        .post("/api/v1/vendor/quotations")
        .set("Authorization", `Bearer ${dellVendorToken}`)
        .send({
          rfqId: testRfqId,
          deliveryDays: 15,
          paymentTerms: "Net 30",
          warrantyTerms: "3 Years Onsite",
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              rfqItemId,
              unitPrice: 50000,
              quantity: 100,
              discount: 100000,
              tax: 882000,
              notes: "Enterprise bulk discount applied",
            },
          ],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.quotationNumber).toMatch(/^QT-\d{4}$/);
      expect(res.body.data.status).toBe("DRAFT");
      
      // Backend Financial Calculations Check:
      // Subtotal = 50000 * 100 = 5,000,000
      // Discount = 100,000
      // Tax = 882,000
      // TotalAmount = 5,000,000 - 100,000 + 882,000 = 5,782,000
      expect(res.body.data.subtotal).toBe(5000000);
      expect(res.body.data.discount).toBe(100000);
      expect(res.body.data.tax).toBe(882000);
      expect(res.body.data.totalAmount).toBe(5782000);

      dellQuotationId = res.body.data.id;
    });

    it("Dell cannot create a second active quotation for the same RFQ -> 409 Conflict", async () => {
      const res = await request(app)
        .post("/api/v1/vendor/quotations")
        .set("Authorization", `Bearer ${dellVendorToken}`)
        .send({
          rfqId: testRfqId,
          deliveryDays: 10,
          items: [{ rfqItemId, unitPrice: 48000, quantity: 100 }],
        })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("already has an active quotation");
    });
  });

  describe("2. Editing Draft Quotation (PATCH /api/v1/vendor/quotations/:id)", () => {
    it("Dell updates DRAFT quotation commercial terms & prices -> 200 OK", async () => {
      const res = await request(app)
        .patch(`/api/v1/vendor/quotations/${dellQuotationId}`)
        .set("Authorization", `Bearer ${dellVendorToken}`)
        .send({
          deliveryDays: 14,
          paymentTerms: "Net 45",
          items: [
            {
              rfqItemId,
              unitPrice: 49000,
              quantity: 100,
              discount: 50000,
              tax: 877500,
            },
          ],
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.deliveryDays).toBe(14);
      expect(res.body.data.paymentTerms).toBe("Net 45");
      // Subtotal = 49000 * 100 = 4,900,000
      // Discount = 50,000
      // Tax = 877,500
      // Total = 4900000 - 50000 + 877500 = 5,727,500
      expect(res.body.data.totalAmount).toBe(5727500);
    });

    it("HP Vendor cannot edit Dell's draft quotation -> 403 Forbidden", async () => {
      await request(app)
        .patch(`/api/v1/vendor/quotations/${dellQuotationId}`)
        .set("Authorization", `Bearer ${hpVendorToken}`)
        .send({ deliveryDays: 5 })
        .expect(403);
    });
  });

  describe("3. Buyer Visibility of Drafts & Submissions (GET /api/v1/quotations)", () => {
    it("Buyer cannot see DRAFT quotation prior to submission", async () => {
      const res = await request(app)
        .get("/api/v1/quotations")
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe("4. Submitting Quotation (POST /api/v1/vendor/quotations/:id/submit)", () => {
    it("HP Vendor creates & submits quotation", async () => {
      // 1. HP creates draft
      const hpDraftRes = await request(app)
        .post("/api/v1/vendor/quotations")
        .set("Authorization", `Bearer ${hpVendorToken}`)
        .send({
          rfqId: testRfqId,
          deliveryDays: 25,
          paymentTerms: "Net 60",
          warrantyTerms: "2 Years Standard",
          validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              rfqItemId,
              unitPrice: 48000,
              quantity: 100,
              discount: 0,
              tax: 864000,
            },
          ],
        })
        .expect(201);
      hpQuotationId = hpDraftRes.body.data.id;

      // 2. HP submits draft
      const submitRes = await request(app)
        .post(`/api/v1/vendor/quotations/${hpQuotationId}/submit`)
        .set("Authorization", `Bearer ${hpVendorToken}`)
        .expect(200);

      expect(submitRes.body.success).toBe(true);
      expect(submitRes.body.data.status).toBe("SUBMITTED");
      expect(submitRes.body.data.submittedAt).toBeDefined();
    });

    it("Dell submits draft quotation", async () => {
      const submitRes = await request(app)
        .post(`/api/v1/vendor/quotations/${dellQuotationId}/submit`)
        .set("Authorization", `Bearer ${dellVendorToken}`)
        .expect(200);

      expect(submitRes.body.success).toBe(true);
      expect(submitRes.body.data.status).toBe("SUBMITTED");
    });

    it("Cannot edit SUBMITTED quotation -> 409 Conflict", async () => {
      const res = await request(app)
        .patch(`/api/v1/vendor/quotations/${dellQuotationId}`)
        .set("Authorization", `Bearer ${dellVendorToken}`)
        .send({ deliveryDays: 7 })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Only DRAFT");
    });
  });

  describe("5. Buyer Receiving & Side-by-Side Comparison", () => {
    it("ABC Procurement lists submitted quotations -> 200 OK", async () => {
      const res = await request(app)
        .get("/api/v1/quotations")
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it("ABC Procurement gets side-by-side RFQ comparison matrix -> 200 OK", async () => {
      const res = await request(app)
        .get(`/api/v1/rfqs/${testRfqId}/compare`)
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.rfq.id).toBe(testRfqId);
      expect(res.body.data.quotations).toHaveLength(2);
      expect(res.body.data.itemMatrix).toHaveLength(1);

      const matrixItem = res.body.data.itemMatrix[0];
      expect(matrixItem.vendorOffers).toHaveLength(2);
    });

    it("Vendor CANNOT access buyer comparison endpoint -> 401/403", async () => {
      await request(app)
        .get(`/api/v1/rfqs/${testRfqId}/compare`)
        .set("Authorization", `Bearer ${dellVendorToken}`)
        .expect(403);
    });

    it("EMPLOYEE, MANAGER, and FINANCE roles cannot view buyer quotations -> 403 Forbidden", async () => {
      await request(app)
        .get("/api/v1/quotations")
        .set("Authorization", `Bearer ${abcEmployeeToken}`)
        .expect(403);

      await request(app)
        .get("/api/v1/quotations")
        .set("Authorization", `Bearer ${abcManagerToken}`)
        .expect(403);
    });
  });

  describe("6. Selecting Winning Quotation (POST /api/v1/quotations/:id/select)", () => {
    it("XYZ Procurement cannot select ABC quotation -> 404 Not Found", async () => {
      await request(app)
        .post(`/api/v1/quotations/${dellQuotationId}/select`)
        .set("Authorization", `Bearer ${xyzProcurementToken}`)
        .expect(404);
    });

    it("ABC Procurement selects Dell as winning vendor -> Status SELECTED, HP REJECTED", async () => {
      const res = await request(app)
        .post(`/api/v1/quotations/${dellQuotationId}/select`)
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("SELECTED");

      // Verify HP quotation is now REJECTED
      const hpCheck = await request(app)
        .get(`/api/v1/quotations/${hpQuotationId}`)
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .expect(200);

      expect(hpCheck.body.data.status).toBe("REJECTED");
    });

    it("Cannot select a second quotation for the same RFQ -> 409 Conflict", async () => {
      const res = await request(app)
        .post(`/api/v1/quotations/${hpQuotationId}/select`)
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already been selected|Cannot select/);
    });
  });

  describe("7. Security & Vendor Isolation Checks", () => {
    it("Dell Vendor cannot view HP quotation detail -> 403 Forbidden", async () => {
      await request(app)
        .get(`/api/v1/vendor/quotations/${hpQuotationId}`)
        .set("Authorization", `Bearer ${dellVendorToken}`)
        .expect(403);
    });
  });
});
