import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/presentation/http/app";

const app = createApp();

describe("Day 4 Suite: Purchase Requests Lifecycle, Tenant Isolation & Validation", () => {
  // ABC Corporation setup
  const abcAdmin = {
    name: "ABC Admin",
    email: `abc.admin.${Date.now()}@example.com`,
    password: "Password123!",
  };
  let abcAdminToken: string;
  let abcOrgId: string;

  // ABC Employees
  let ziyamToken: string;
  let ziyamUserId: string;
  const ziyamEmail = `ziyam.emp.${Date.now()}@example.com`;

  let johnToken: string;
  let johnUserId: string;
  const johnEmail = `john.emp.${Date.now()}@example.com`;

  // XYZ Corporation setup
  const xyzAdmin = {
    name: "XYZ Admin",
    email: `xyz.admin.${Date.now()}@example.com`,
    password: "Password123!",
  };
  let xyzAdminToken: string;
  let xyzOrgId: string;

  // Department
  let abcITDeptId: string;

  // PR IDs tracked during test execution
  let ziyamDraftPrId: string;
  let ziyamSubmittedPrId: string;
  let johnDraftPrId: string;
  let xyzDraftPrId: string;

  beforeAll(async () => {
    // 1. Setup ABC Corporation
    const regAbc = await request(app).post("/auth/register").send(abcAdmin);
    let tempAbcToken = regAbc.body.data.accessToken;

    const orgAbc = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${tempAbcToken}`)
      .send({ name: "ABC Technologies" });
    abcOrgId = orgAbc.body.data.organization.id;
    abcAdminToken = orgAbc.body.data.accessToken || tempAbcToken;

    // Create IT department in ABC
    const deptRes = await request(app)
      .post("/organizations/departments")
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "IT Department" });
    // Invite Manager in ABC for approval assignment
    const mgrInvite = await request(app)
      .post("/organizations/users")
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "ABC Manager", email: `abc.mgr.${Date.now()}@example.com`, role: "MANAGER" });
    await request(app)
      .post("/auth/accept-invitation")
      .send({ token: mgrInvite.body.data.token, password: "AbcPassword123!" });

    // Invite Ziyam as EMPLOYEE in ABC
    const ziyamInviteRes = await request(app)
      .post("/organizations/users")
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "Ziyam Employee", email: ziyamEmail, role: "EMPLOYEE", departmentId: abcITDeptId });
    const ziyamTokenStr = ziyamInviteRes.body.data.token;

    // Ziyam accepts invitation
    await request(app)
      .post("/auth/accept-invitation")
      .send({ token: ziyamTokenStr, password: "ZiyamPassword123!" });

    // Ziyam logs in
    const ziyamLogin = await request(app)
      .post("/auth/login")
      .send({ email: ziyamEmail, password: "ZiyamPassword123!" });
    ziyamToken = ziyamLogin.body.data.accessToken;
    ziyamUserId = ziyamLogin.body.data.user.id;

    // Invite John as EMPLOYEE in ABC
    const johnInviteRes = await request(app)
      .post("/organizations/users")
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "John Employee", email: johnEmail, role: "EMPLOYEE" });
    const johnTokenStr = johnInviteRes.body.data.token;

    await request(app)
      .post("/auth/accept-invitation")
      .send({ token: johnTokenStr, password: "JohnPassword123!" });

    const johnLogin = await request(app)
      .post("/auth/login")
      .send({ email: johnEmail, password: "JohnPassword123!" });
    johnToken = johnLogin.body.data.accessToken;
    johnUserId = johnLogin.body.data.user.id;

    // 2. Setup XYZ Corporation
    const regXyz = await request(app).post("/auth/register").send(xyzAdmin);
    let tempXyzToken = regXyz.body.data.accessToken;

    const orgXyz = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${tempXyzToken}`)
      .send({ name: "XYZ Corporation" });
    xyzOrgId = orgXyz.body.data.organization.id;
    xyzAdminToken = orgXyz.body.data.accessToken || tempXyzToken;

    // Create a PR in XYZ Corporation for tenant isolation testing
    const xyzPrRes = await request(app)
      .post("/purchase-requests")
      .set("Authorization", `Bearer ${xyzAdminToken}`)
      .send({
        title: "XYZ Secret Server",
        description: "Confidential hardware",
        items: [{ name: "Rack Server", quantity: 1, estimatedUnitPrice: 500000 }],
      });
    if (!xyzPrRes.body.success) {
      console.log("xyzPrRes Error:", JSON.stringify(xyzPrRes.body, null, 2));
    }
    xyzDraftPrId = xyzPrRes.body.data.id;
  });

  describe("1. Create Purchase Request & Calculations", () => {
    it("Employee (Ziyam) creates a PR as DRAFT with backend total calculation", async () => {
      const res = await request(app)
        .post("/purchase-requests")
        .set("Authorization", `Bearer ${ziyamToken}`)
        .send({
          title: "Laptop Purchase",
          description: "Laptops required for new employees",
          justification: "New employees joining IT",
          departmentId: abcITDeptId,
          items: [
            {
              name: "Laptop",
              description: "Business Laptop 16GB",
              quantity: 10,
              estimatedUnitPrice: 60000,
            },
            {
              name: "External Monitor",
              description: "27-inch 4K Monitor",
              quantity: 5,
              estimatedUnitPrice: 20000,
            },
          ],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      const pr = res.body.data;
      expect(pr.requestNumber).toMatch(/^PR-/);
      expect(pr.title).toBe("Laptop Purchase");
      expect(pr.status).toBe("DRAFT");
      expect(pr.organizationId).toBe(abcOrgId);
      expect(pr.requesterId).toBe(ziyamUserId);
      expect(pr.items).toHaveLength(2);

      // Verify line totals & overall estimated total
      // 10 * 60000 = 600000
      // 5 * 20000 = 100000
      // Total = 700000
      expect(pr.items[0].estimatedTotal).toBe(600000);
      expect(pr.items[1].estimatedTotal).toBe(100000);
      expect(pr.estimatedTotal).toBe(700000);

      ziyamDraftPrId = pr.id;
    });

    it("John (other employee in ABC) creates a PR", async () => {
      const res = await request(app)
        .post("/purchase-requests")
        .set("Authorization", `Bearer ${johnToken}`)
        .send({
          title: "Office Chairs",
          description: "Ergonomic chairs",
          items: [{ name: "Chair", quantity: 2, estimatedUnitPrice: 15000 }],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      johnDraftPrId = res.body.data.id;
    });
  });

  describe("2. Validation Rules", () => {
    it("Rejects PR creation with empty title -> 400 Bad Request", async () => {
      const res = await request(app)
        .post("/purchase-requests")
        .set("Authorization", `Bearer ${ziyamToken}`)
        .send({
          title: "",
          items: [{ name: "Desk", quantity: 1, estimatedUnitPrice: 5000 }],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("Rejects PR creation with empty items array -> 400 Bad Request", async () => {
      const res = await request(app)
        .post("/purchase-requests")
        .set("Authorization", `Bearer ${ziyamToken}`)
        .send({
          title: "Empty Request",
          items: [],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("Rejects PR creation with zero quantity -> 400 Bad Request", async () => {
      const res = await request(app)
        .post("/purchase-requests")
        .set("Authorization", `Bearer ${ziyamToken}`)
        .send({
          title: "Zero Quantity",
          items: [{ name: "Keyboard", quantity: 0, estimatedUnitPrice: 1000 }],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("Rejects PR creation with negative price -> 400 Bad Request", async () => {
      const res = await request(app)
        .post("/purchase-requests")
        .set("Authorization", `Bearer ${ziyamToken}`)
        .send({
          title: "Negative Price",
          items: [{ name: "Mouse", quantity: 5, estimatedUnitPrice: -500 }],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("Rejects PR creation with invalid departmentId -> 400 Bad Request", async () => {
      const res = await request(app)
        .post("/purchase-requests")
        .set("Authorization", `Bearer ${ziyamToken}`)
        .send({
          title: "Invalid Dept PR",
          departmentId: "non-existent-dept-uuid",
          items: [{ name: "Paper", quantity: 10, estimatedUnitPrice: 200 }],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe("3. Update & Edit Draft Rules", () => {
    it("Ziyam updates own draft request", async () => {
      const res = await request(app)
        .patch(`/purchase-requests/${ziyamDraftPrId}`)
        .set("Authorization", `Bearer ${ziyamToken}`)
        .send({
          title: "Updated Laptop Purchase",
          description: "Updated specs",
          departmentId: abcITDeptId,
          justification: "Critical business need",
          items: [
            {
              name: "High-End Laptop",
              quantity: 12,
              estimatedUnitPrice: 75000,
            },
          ],
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("Updated Laptop Purchase");
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.estimatedTotal).toBe(12 * 75000); // 900,000
    });

    it("John CANNOT update Ziyam's draft -> 403 Forbidden", async () => {
      const res = await request(app)
        .patch(`/purchase-requests/${ziyamDraftPrId}`)
        .set("Authorization", `Bearer ${johnToken}`)
        .send({
          title: "Hacked Title",
          items: [{ name: "Hack Item", quantity: 1, estimatedUnitPrice: 100 }],
        })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe("4. Submit Purchase Request Lifecycle", () => {
    it("John CANNOT submit Ziyam's draft -> 403 Forbidden", async () => {
      const res = await request(app)
        .post(`/purchase-requests/${ziyamDraftPrId}/submit`)
        .set("Authorization", `Bearer ${johnToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it("Ziyam submits own draft request (DRAFT -> PENDING_APPROVAL)", async () => {
      const res = await request(app)
        .post(`/purchase-requests/${ziyamDraftPrId}/submit`)
        .set("Authorization", `Bearer ${ziyamToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("PENDING_APPROVAL");
      ziyamSubmittedPrId = ziyamDraftPrId;
    });

    it("Rejects re-submitting an already submitted request -> 400 Bad Request", async () => {
      const res = await request(app)
        .post(`/purchase-requests/${ziyamSubmittedPrId}/submit`)
        .set("Authorization", `Bearer ${ziyamToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("already been submitted");
    });

    it("Ziyam CANNOT edit a submitted request (PENDING_APPROVAL) -> 400 Bad Request", async () => {
      const res = await request(app)
        .patch(`/purchase-requests/${ziyamSubmittedPrId}`)
        .set("Authorization", `Bearer ${ziyamToken}`)
        .send({
          title: "Trying to edit submitted PR",
          items: [{ name: "Item", quantity: 1, estimatedUnitPrice: 100 }],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Cannot edit a submitted");
    });
  });

  describe("5. Delete Draft Rules", () => {
    it("Ziyam CANNOT delete a submitted request (PENDING_APPROVAL) -> 400 Bad Request", async () => {
      const res = await request(app)
        .delete(`/purchase-requests/${ziyamSubmittedPrId}`)
        .set("Authorization", `Bearer ${ziyamToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Cannot delete a submitted");
    });

    it("John CANNOT delete Ziyam's draft -> 403 Forbidden", async () => {
      const res = await request(app)
        .delete(`/purchase-requests/${johnDraftPrId}`)
        .set("Authorization", `Bearer ${ziyamToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it("John deletes own draft request -> 200 OK", async () => {
      const res = await request(app)
        .delete(`/purchase-requests/${johnDraftPrId}`)
        .set("Authorization", `Bearer ${johnToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      // Verify PR no longer exists
      await request(app)
        .get(`/purchase-requests/${johnDraftPrId}`)
        .set("Authorization", `Bearer ${johnToken}`)
        .expect(404);
    });
  });

  describe("6. List & Get Requests Scoping", () => {
    it("Employee (Ziyam) listing requests sees only Ziyam's requests", async () => {
      const res = await request(app)
        .get("/purchase-requests")
        .set("Authorization", `Bearer ${ziyamToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const prs = res.body.data;
      expect(prs.every((p: any) => p.requesterId === ziyamUserId)).toBe(true);
    });

    it("ABC Admin listing requests sees all ABC organization requests", async () => {
      const res = await request(app)
        .get("/purchase-requests")
        .set("Authorization", `Bearer ${abcAdminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const prs = res.body.data;
      expect(prs.some((p: any) => p.id === ziyamSubmittedPrId)).toBe(true);
    });
  });

  describe("7. Mandatory Tenant Isolation", () => {
    it("Ziyam (ABC) CANNOT view XYZ's purchase request -> 404 Not Found", async () => {
      const res = await request(app)
        .get(`/purchase-requests/${xyzDraftPrId}`)
        .set("Authorization", `Bearer ${ziyamToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it("Ziyam (ABC) CANNOT update XYZ's purchase request -> 404 Not Found", async () => {
      const res = await request(app)
        .patch(`/purchase-requests/${xyzDraftPrId}`)
        .set("Authorization", `Bearer ${ziyamToken}`)
        .send({
          title: "Cross Tenant Attack",
          items: [{ name: "Hack", quantity: 1, estimatedUnitPrice: 100 }],
        })
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it("Ziyam (ABC) CANNOT submit XYZ's purchase request -> 404 Not Found", async () => {
      const res = await request(app)
        .post(`/purchase-requests/${xyzDraftPrId}/submit`)
        .set("Authorization", `Bearer ${ziyamToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it("Ziyam (ABC) CANNOT delete XYZ's purchase request -> 404 Not Found", async () => {
      const res = await request(app)
        .delete(`/purchase-requests/${xyzDraftPrId}`)
        .set("Authorization", `Bearer ${ziyamToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });
});
