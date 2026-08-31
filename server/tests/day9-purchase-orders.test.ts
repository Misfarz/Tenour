import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/presentation/http/app";

const app = createApp();

describe("Day 9 — Purchase Order (PO) Management Suite", () => {
  // ABC Org Tokens
  let abcAdminToken: string;
  let abcProcurementToken: string;
  let abcEmployeeToken: string;
  let abcManagerToken: string;

  // XYZ Org Tokens
  let xyzProcurementToken: string;

  // Vendor IDs & Tokens
  let dellVendorId: string;
  let hpVendorId: string;
  let dellVendorToken: string;
  let hpVendorToken: string;

  // RFQ & Quotation IDs
  let rfqId: string;
  let selectedQuotationId: string;
  let unselectedQuotationId: string;

  // PO IDs
  let testPoId: string;

  beforeAll(async () => {
    // 1. ABC Org Setup
    const regAbc = await request(app).post("/auth/register").send({
      name: "ABC Admin D9",
      email: `abc.admin.d9.${Date.now()}@example.com`,
      password: "Password123!",
    });
    const tempAbcToken = regAbc.body.data.accessToken;

    const orgAbc = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${tempAbcToken}`)
      .send({ name: "ABC Procurement Enterprise D9" });
    abcAdminToken = orgAbc.body.data.accessToken || tempAbcToken;

    // ABC Procurement User
    const procEmail = `abc.proc.d9.${Date.now()}@example.com`;
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
    const empEmail = `abc.emp.d9.${Date.now()}@example.com`;
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

    // ABC Manager User
    const mgrEmail = `abc.mgr.d9.${Date.now()}@example.com`;
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
      name: "XYZ Admin D9",
      email: `xyz.admin.d9.${Date.now()}@example.com`,
      password: "Password123!",
    });
    const tempXyzToken = regXyz.body.data.accessToken;
    const orgXyz = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${tempXyzToken}`)
      .send({ name: "XYZ Sourcing Corp D9" });
    const xyzAdminToken = orgXyz.body.data.accessToken || tempXyzToken;

    const xyzProcEmail = `xyz.proc.d9.${Date.now()}@example.com`;
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
      .send({ name: "Dell Technologies D9", email: "sales@dell.com" });
    dellVendorId = dellRes.body.data.id;

    const hpRes = await request(app)
      .post("/vendors")
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "HP Enterprise D9", email: "sales@hp.com" });
    hpVendorId = hpRes.body.data.id;

    // Onboard Dell and HP Users
    const dellContactEmail = `dell.sales.${Date.now()}@dell.com`;
    const dellInviteRes = await request(app)
      .post(`/vendors/${dellVendorId}/invite`)
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "Dell Rep", email: dellContactEmail });
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
      .send({ name: "HP Rep", email: hpContactEmail });
    await request(app)
      .post("/auth/vendor/accept-invitation")
      .send({ token: hpInviteRes.body.data.token, password: "VendorPassword123!" });
    const hpLogin = await request(app)
      .post("/auth/vendor/login")
      .send({ email: hpContactEmail, password: "VendorPassword123!" });
    hpVendorToken = hpLogin.body.data.accessToken;

    // 4. Create PR, RFQ, Submit Quotations & Select Winner
    const prRes = await request(app)
      .post("/purchase-requests")
      .set("Authorization", `Bearer ${abcEmployeeToken}`)
      .send({
        title: "Day 9 Enterprise Hardware",
        items: [{ name: "High-End Server Rack", quantity: 10, estimatedUnitPrice: 5000 }],
      });
    const prId = prRes.body.data.id;

    await request(app)
      .post(`/purchase-requests/${prId}/submit`)
      .set("Authorization", `Bearer ${abcEmployeeToken}`);
    await request(app)
      .post(`/purchase-requests/${prId}/approve`)
      .set("Authorization", `Bearer ${abcManagerToken}`);

    const rfqRes = await request(app)
      .post("/api/v1/rfqs")
      .set("Authorization", `Bearer ${abcProcurementToken}`)
      .send({
        purchaseRequestId: prId,
        title: "Enterprise Server Sourcing D9",
        quotationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        items: [{ name: "Server Rack 42U", quantity: 10, unit: "PCS" }],
        vendorIds: [dellVendorId, hpVendorId],
      });
    rfqId = rfqRes.body.data.id;
    const rfqItemId = rfqRes.body.data.items[0].id;

    await request(app)
      .post(`/api/v1/rfqs/${rfqId}/send`)
      .set("Authorization", `Bearer ${abcProcurementToken}`);

    // Dell submits quote
    const dellQuote = await request(app)
      .post("/api/v1/vendor/quotations")
      .set("Authorization", `Bearer ${dellVendorToken}`)
      .send({
        rfqId,
        deliveryDays: 14,
        paymentTerms: "Net 30",
        items: [{ rfqItemId, unitPrice: 4500, quantity: 10, discount: 1000, tax: 7920 }],
      });
    selectedQuotationId = dellQuote.body.data.id;
    await request(app)
      .post(`/api/v1/vendor/quotations/${selectedQuotationId}/submit`)
      .set("Authorization", `Bearer ${dellVendorToken}`);

    // HP submits quote
    const hpQuote = await request(app)
      .post("/api/v1/vendor/quotations")
      .set("Authorization", `Bearer ${hpVendorToken}`)
      .send({
        rfqId,
        deliveryDays: 20,
        paymentTerms: "Net 45",
        items: [{ rfqItemId, unitPrice: 4800, quantity: 10, discount: 0, tax: 8640 }],
      });
    unselectedQuotationId = hpQuote.body.data.id;
    await request(app)
      .post(`/api/v1/vendor/quotations/${unselectedQuotationId}/submit`)
      .set("Authorization", `Bearer ${hpVendorToken}`);

    // Select Dell as winning quotation
    await request(app)
      .post(`/api/v1/quotations/${selectedQuotationId}/select`)
      .set("Authorization", `Bearer ${abcProcurementToken}`);
  }, 30000);

  describe("1. Purchase Order Creation (POST /api/v1/purchase-orders)", () => {
    it("Cannot create PO from unselected quotation -> 422 Unprocessable Entity", async () => {
      const res = await request(app)
        .post("/api/v1/purchase-orders")
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .send({ quotationId: unselectedQuotationId })
        .expect(422);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("SELECTED");
    });

    it("EMPLOYEE and MANAGER cannot create PO -> 403 Forbidden", async () => {
      await request(app)
        .post("/api/v1/purchase-orders")
        .set("Authorization", `Bearer ${abcEmployeeToken}`)
        .send({ quotationId: selectedQuotationId })
        .expect(403);

      await request(app)
        .post("/api/v1/purchase-orders")
        .set("Authorization", `Bearer ${abcManagerToken}`)
        .send({ quotationId: selectedQuotationId })
        .expect(403);
    });

    it("Procurement creates DRAFT PO from selected quotation -> 201 Created", async () => {
      const res = await request(app)
        .post("/api/v1/purchase-orders")
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .send({
          quotationId: selectedQuotationId,
          deliveryAddress: "100 Innovation Way, Enterprise Park",
          deliveryDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          paymentTerms: "Net 30",
          notes: "Handle with extreme care",
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.poNumber).toMatch(/^PO-\d{4}$/);
      expect(res.body.data.status).toBe("DRAFT");
      expect(res.body.data.vendor.id).toBe(dellVendorId);
      
      // Check Financial Totals copied from Selected Quotation
      // Subtotal = 4500 * 10 = 45,000
      // Discount = 1,000
      // Tax = 7,920
      // TotalAmount = 45,000 - 1,000 + 7,920 = 51,920
      expect(res.body.data.subtotal).toBe(45000);
      expect(res.body.data.discount).toBe(1000);
      expect(res.body.data.tax).toBe(7920);
      expect(res.body.data.totalAmount).toBe(51920);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].name).toBe("Server Rack 42U");

      testPoId = res.body.data.id;
    });

    it("Cannot create duplicate active PO for the same quotation -> 409 Conflict", async () => {
      const res = await request(app)
        .post("/api/v1/purchase-orders")
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .send({ quotationId: selectedQuotationId })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("already been created");
    });
  });

  describe("2. Editing & Vendor Visibility of DRAFT PO", () => {
    it("Procurement updates DRAFT PO delivery address & notes -> 200 OK", async () => {
      const res = await request(app)
        .patch(`/api/v1/purchase-orders/${testPoId}`)
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .send({
          deliveryAddress: "Building 4, HQ Campus, Tech Hub",
          notes: "Updated delivery instructions",
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.deliveryAddress).toBe("Building 4, HQ Campus, Tech Hub");
    });

    it("Vendor CANNOT see DRAFT PO prior to sending", async () => {
      const res = await request(app)
        .get("/api/v1/vendor/purchase-orders")
        .set("Authorization", `Bearer ${dellVendorToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe("3. Sending Purchase Order (POST /api/v1/purchase-orders/:id/send)", () => {
    it("ABC Procurement sends PO to vendor -> Status transitions to SENT", async () => {
      const res = await request(app)
        .post(`/api/v1/purchase-orders/${testPoId}/send`)
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("SENT");
      expect(res.body.data.sentAt).toBeDefined();
    });

    it("Sent PO commercial data is immutable -> 409 Conflict", async () => {
      const res = await request(app)
        .patch(`/api/v1/purchase-orders/${testPoId}`)
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .send({ deliveryAddress: "Attempt to change sent PO address" })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Only DRAFT");
    });
  });

  describe("4. Vendor Portal PO Access, Acknowledgement & Rejection", () => {
    it("Dell Vendor views assigned SENT PO -> 200 OK", async () => {
      const res = await request(app)
        .get("/api/v1/vendor/purchase-orders")
        .set("Authorization", `Bearer ${dellVendorToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe(testPoId);
      expect(res.body.data[0].status).toBe("SENT");
    });

    it("HP Vendor cannot view Dell's assigned PO -> 403 Forbidden", async () => {
      await request(app)
        .get(`/api/v1/vendor/purchase-orders/${testPoId}`)
        .set("Authorization", `Bearer ${hpVendorToken}`)
        .expect(403);
    });

    it("Dell Vendor acknowledges PO -> Status transitions to ACKNOWLEDGED", async () => {
      const res = await request(app)
        .post(`/api/v1/vendor/purchase-orders/${testPoId}/acknowledge`)
        .set("Authorization", `Bearer ${dellVendorToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("ACKNOWLEDGED");
      expect(res.body.data.acknowledgedAt).toBeDefined();
    });

    it("Cannot acknowledge an already ACKNOWLEDGED PO -> 409 Conflict", async () => {
      const res = await request(app)
        .post(`/api/v1/vendor/purchase-orders/${testPoId}/acknowledge`)
        .set("Authorization", `Bearer ${dellVendorToken}`)
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Only SENT");
    });
  });

  describe("5. Vendor PO Rejection Workflow", () => {
    let secondPoId: string;

    beforeAll(async () => {
      // Create second RFQ & PO to test rejection
      const prRes = await request(app)
        .post("/purchase-requests")
        .set("Authorization", `Bearer ${abcEmployeeToken}`)
        .send({
          title: "PR for Rejection Test",
          items: [{ name: "Storage Array", quantity: 2, estimatedUnitPrice: 10000 }],
        });
      const prId = prRes.body.data.id;
      await request(app)
        .post(`/purchase-requests/${prId}/submit`)
        .set("Authorization", `Bearer ${abcEmployeeToken}`);
      await request(app)
        .post(`/purchase-requests/${prId}/approve`)
        .set("Authorization", `Bearer ${abcManagerToken}`);

      const rfqRes = await request(app)
        .post("/api/v1/rfqs")
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .send({
          purchaseRequestId: prId,
          title: "Storage Array Sourcing",
          quotationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          items: [{ name: "Storage Array", quantity: 2 }],
          vendorIds: [hpVendorId],
        });
      const r2Id = rfqRes.body.data.id;
      const r2ItemId = rfqRes.body.data.items[0].id;
      await request(app)
        .post(`/api/v1/rfqs/${r2Id}/send`)
        .set("Authorization", `Bearer ${abcProcurementToken}`);

      const hpQuote = await request(app)
        .post("/api/v1/vendor/quotations")
        .set("Authorization", `Bearer ${hpVendorToken}`)
        .send({
          rfqId: r2Id,
          items: [{ rfqItemId: r2ItemId, unitPrice: 9500, quantity: 2 }],
        });
      const hpQId = hpQuote.body.data.id;
      await request(app)
        .post(`/api/v1/vendor/quotations/${hpQId}/submit`)
        .set("Authorization", `Bearer ${hpVendorToken}`);
      await request(app)
        .post(`/api/v1/quotations/${hpQId}/select`)
        .set("Authorization", `Bearer ${abcProcurementToken}`);

      const poRes = await request(app)
        .post("/api/v1/purchase-orders")
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .send({
          quotationId: hpQId,
          deliveryAddress: "Delivery Dock B",
        });
      secondPoId = poRes.body.data.id;

      await request(app)
        .post(`/api/v1/purchase-orders/${secondPoId}/send`)
        .set("Authorization", `Bearer ${abcProcurementToken}`);
    });

    it("Rejects rejection without reason -> 400 Bad Request", async () => {
      await request(app)
        .post(`/api/v1/vendor/purchase-orders/${secondPoId}/reject`)
        .set("Authorization", `Bearer ${hpVendorToken}`)
        .send({ rejectionReason: "" })
        .expect(400);
    });

    it("HP Vendor rejects PO with reason -> Status REJECTED", async () => {
      const res = await request(app)
        .post(`/api/v1/vendor/purchase-orders/${secondPoId}/reject`)
        .set("Authorization", `Bearer ${hpVendorToken}`)
        .send({ rejectionReason: "Unable to meet requested delivery schedule due to component supply shortage" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("REJECTED");
      expect(res.body.data.rejectionReason).toContain("supply shortage");
      expect(res.body.data.rejectedAt).toBeDefined();
    });
  });

  describe("6. Buyer PO Cancellation Workflow & Tenant Isolation", () => {
    let cancelTestPoId: string;

    beforeAll(async () => {
      // Create draft PO for cancellation
      const prRes = await request(app)
        .post("/purchase-requests")
        .set("Authorization", `Bearer ${abcEmployeeToken}`)
        .send({
          title: "PR for Cancel Test",
          items: [{ name: "Monitors", quantity: 5, estimatedUnitPrice: 300 }],
        });
      const prId = prRes.body.data.id;
      await request(app)
        .post(`/purchase-requests/${prId}/submit`)
        .set("Authorization", `Bearer ${abcEmployeeToken}`);
      await request(app)
        .post(`/purchase-requests/${prId}/approve`)
        .set("Authorization", `Bearer ${abcManagerToken}`);

      const rfqRes = await request(app)
        .post("/api/v1/rfqs")
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .send({
          purchaseRequestId: prId,
          title: "Monitors Sourcing",
          quotationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          items: [{ name: "27in Monitor", quantity: 5 }],
          vendorIds: [dellVendorId],
        });
      const rId = rfqRes.body.data.id;
      const rItemId = rfqRes.body.data.items[0].id;
      await request(app)
        .post(`/api/v1/rfqs/${rId}/send`)
        .set("Authorization", `Bearer ${abcProcurementToken}`);

      const quoteRes = await request(app)
        .post("/api/v1/vendor/quotations")
        .set("Authorization", `Bearer ${dellVendorToken}`)
        .send({
          rfqId: rId,
          items: [{ rfqItemId: rItemId, unitPrice: 280, quantity: 5 }],
        });
      const qId = quoteRes.body.data.id;
      await request(app)
        .post(`/api/v1/vendor/quotations/${qId}/submit`)
        .set("Authorization", `Bearer ${dellVendorToken}`);
      await request(app)
        .post(`/api/v1/quotations/${qId}/select`)
        .set("Authorization", `Bearer ${abcProcurementToken}`);

      const poRes = await request(app)
        .post("/api/v1/purchase-orders")
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .send({ quotationId: qId, deliveryAddress: "Dock 1" });
      cancelTestPoId = poRes.body.data.id;
    });

    it("XYZ Procurement cannot view or cancel ABC PO -> 404 Not Found", async () => {
      await request(app)
        .get(`/api/v1/purchase-orders/${cancelTestPoId}`)
        .set("Authorization", `Bearer ${xyzProcurementToken}`)
        .expect(404);

      await request(app)
        .post(`/api/v1/purchase-orders/${cancelTestPoId}/cancel`)
        .set("Authorization", `Bearer ${xyzProcurementToken}`)
        .send({ cancelReason: "Cross tenant attempt" })
        .expect(404);
    });

    it("ABC Procurement cancels DRAFT PO with reason -> Status CANCELLED", async () => {
      const res = await request(app)
        .post(`/api/v1/purchase-orders/${cancelTestPoId}/cancel`)
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .send({ cancelReason: "Project budget reallocated to cloud infrastructure" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("CANCELLED");
      expect(res.body.data.cancelReason).toContain("budget reallocated");
      expect(res.body.data.cancelledAt).toBeDefined();
    });
  });
});
