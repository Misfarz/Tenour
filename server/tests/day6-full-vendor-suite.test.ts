import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/presentation/http/app";

const app = createApp();

describe("Day 6 Full Suite: Vendor Management, Contacts, Invitations & Vendor Portal", () => {
  // ABC Company setup
  let abcAdminToken: string;
  let abcProcurementToken: string;
  let abcOrgId: string;

  // XYZ Company setup
  let xyzAdminToken: string;
  let xyzOrgId: string;

  // Vendor IDs
  let dellVendorId: string;
  let hpVendorId: string;
  let xyzVendorId: string;
  let contactId: string;

  // Invitation Token
  let vendorInviteToken: string;
  const vendorContactEmail = `sales.contact.${Date.now()}@dell.com`;

  beforeAll(async () => {
    // 1. ABC Admin Register & Setup Org
    const regAbc = await request(app).post("/auth/register").send({
      name: "ABC Admin D6",
      email: `abc.admin.full.${Date.now()}@example.com`,
      password: "Password123!",
    });
    const tempAbcToken = regAbc.body.data.accessToken;

    const orgAbc = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${tempAbcToken}`)
      .send({ name: "ABC Procurement Corp" });
    abcOrgId = orgAbc.body.data.organization.id;
    abcAdminToken = orgAbc.body.data.accessToken || tempAbcToken;

    // ABC Procurement User
    const procEmail = `abc.proc.${Date.now()}@example.com`;
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

    // 2. XYZ Admin Register & Setup Org
    const regXyz = await request(app).post("/auth/register").send({
      name: "XYZ Admin D6",
      email: `xyz.admin.full.${Date.now()}@example.com`,
      password: "Password123!",
    });
    const tempXyzToken = regXyz.body.data.accessToken;

    const orgXyz = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${tempXyzToken}`)
      .send({ name: "XYZ Industrial" });
    xyzOrgId = orgXyz.body.data.organization.id;
    xyzAdminToken = orgXyz.body.data.accessToken || tempXyzToken;

    // 3. Create Vendors in ABC
    const dellRes = await request(app)
      .post("/vendors")
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({
        name: "Dell Technologies",
        legalName: "Dell India Pvt Ltd",
        email: "contact@dell.com",
        city: "Bangalore",
      });
    dellVendorId = dellRes.body.data.id;

    const hpRes = await request(app)
      .post("/vendors")
      .set("Authorization", `Bearer ${abcProcurementToken}`)
      .send({
        name: "HP Enterprise",
        email: "sales@hp.com",
        city: "Chennai",
      });
    hpVendorId = hpRes.body.data.id;

    // 4. Create Vendor in XYZ
    const xyzRes = await request(app)
      .post("/vendors")
      .set("Authorization", `Bearer ${xyzAdminToken}`)
      .send({
        name: "XYZ Exclusive Supplier",
        email: "supplier@xyz.com",
      });
    xyzVendorId = xyzRes.body.data.id;
  });

  describe("1. Task 3: Vendor Listing & Filtering (GET /vendors)", () => {
    it("ABC Admin lists all vendors for ABC", async () => {
      const res = await request(app)
        .get("/vendors")
        .set("Authorization", `Bearer ${abcAdminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const vendors = res.body.data;
      expect(vendors.length).toBeGreaterThanOrEqual(2);
      expect(vendors.some((v: any) => v.id === dellVendorId)).toBe(true);
      expect(vendors.some((v: any) => v.id === hpVendorId)).toBe(true);
      expect(vendors.some((v: any) => v.id === xyzVendorId)).toBe(false); // Tenant isolation!
    });

    it("Filters vendors by search query", async () => {
      const res = await request(app)
        .get("/vendors?search=Dell")
        .set("Authorization", `Bearer ${abcAdminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe(dellVendorId);
    });
  });

  describe("2. Task 4: Vendor Details (GET /vendors/:id)", () => {
    it("ABC Admin gets Dell details -> 200 OK", async () => {
      const res = await request(app)
        .get(`/vendors/${dellVendorId}`)
        .set("Authorization", `Bearer ${abcAdminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Dell Technologies");
      expect(res.body.data.buyerVendorStatus).toBe("ACTIVE");
    });

    it("Tenant Isolation: ABC Admin cannot view XYZ vendor -> 404 Not Found", async () => {
      const res = await request(app)
        .get(`/vendors/${xyzVendorId}`)
        .set("Authorization", `Bearer ${abcAdminToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe("3. Task 5: Edit Vendor (PATCH /vendors/:id)", () => {
    it("ABC Procurement updates Dell phone and taxId -> 200 OK", async () => {
      const res = await request(app)
        .patch(`/vendors/${dellVendorId}`)
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .send({
          phone: "+91 9998887770",
          taxId: "GSTIN-DELL-12345",
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.phone).toBe("+91 9998887770");
      expect(res.body.data.taxId).toBe("GSTIN-DELL-12345");
    });
  });

  describe("4. Task 7: Vendor Status Management (PATCH /vendors/:id/status)", () => {
    it("ABC Admin deactivates HP Enterprise -> status INACTIVE", async () => {
      const res = await request(app)
        .patch(`/vendors/${hpVendorId}/status`)
        .set("Authorization", `Bearer ${abcAdminToken}`)
        .send({ status: "INACTIVE" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.buyerVendorStatus).toBe("INACTIVE");
    });

    it("Reactivates HP Enterprise -> status ACTIVE", async () => {
      const res = await request(app)
        .patch(`/vendors/${hpVendorId}/status`)
        .set("Authorization", `Bearer ${abcAdminToken}`)
        .send({ status: "ACTIVE" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.buyerVendorStatus).toBe("ACTIVE");
    });
  });

  describe("5. Task 6: Vendor Contacts CRUD", () => {
    it("Adds contact to Dell Technologies -> 201 Created", async () => {
      const res = await request(app)
        .post(`/vendors/${dellVendorId}/contacts`)
        .set("Authorization", `Bearer ${abcAdminToken}`)
        .send({
          name: "Rahul Sales",
          email: "rahul@dell.com",
          phone: "+91 9123456789",
          designation: "Key Account Manager",
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      contactId = res.body.data.id;
      expect(res.body.data.name).toBe("Rahul Sales");
    });

    it("Lists contacts for Dell -> 200 OK", async () => {
      const res = await request(app)
        .get(`/vendors/${dellVendorId}/contacts`)
        .set("Authorization", `Bearer ${abcAdminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it("Updates contact -> 200 OK", async () => {
      const res = await request(app)
        .patch(`/vendors/${dellVendorId}/contacts/${contactId}`)
        .set("Authorization", `Bearer ${abcProcurementToken}`)
        .send({
          name: "Rahul Kumar",
          designation: "Senior Account Director",
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Rahul Kumar");
    });

    it("Deletes contact -> 200 OK", async () => {
      const res = await request(app)
        .delete(`/vendors/${dellVendorId}/contacts/${contactId}`)
        .set("Authorization", `Bearer ${abcAdminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe("6. Task 8, 9 & 10: Vendor Invitation & Vendor Portal Authentication", () => {
    it("ABC Admin invites Dell vendor contact -> generates token", async () => {
      const res = await request(app)
        .post(`/vendors/${dellVendorId}/invite`)
        .set("Authorization", `Bearer ${abcAdminToken}`)
        .send({
          name: "Sales Contact Dell",
          email: vendorContactEmail,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      vendorInviteToken = res.body.data.token;
    });

    it("Vendor accepts invitation and sets password -> 200 OK", async () => {
      const res = await request(app)
        .post("/auth/vendor/accept-invitation")
        .send({
          token: vendorInviteToken,
          password: "VendorPassword123!",
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(vendorContactEmail);
    });

    it("Vendor logs in to Vendor Portal -> 200 OK with vendor accessToken", async () => {
      const res = await request(app)
        .post("/auth/vendor/login")
        .send({
          email: vendorContactEmail,
          password: "VendorPassword123!",
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.vendor.id).toBe(dellVendorId);
      expect(res.body.data.user.role).toBe("VENDOR_ADMIN");
    });
  });
});
