import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/presentation/http/app";

const app = createApp();

describe("Day 5 Suite: Manager Approval Workflow, Authorization & Security", () => {
  // ABC Corporation setup
  const abcAdmin = {
    name: "ABC Admin",
    email: `abc.admin.d5.${Date.now()}@example.com`,
    password: "Password123!",
  };
  let abcAdminToken: string;
  let abcOrgId: string;

  // ABC Manager (Rahul)
  let rahulToken: string;
  let rahulUserId: string;
  const rahulEmail = `rahul.mgr.${Date.now()}@example.com`;

  // ABC Employee (Ziyam)
  let ziyamToken: string;
  let ziyamUserId: string;
  const ziyamEmail = `ziyam.emp.d5.${Date.now()}@example.com`;

  // XYZ Corporation setup
  const xyzAdmin = {
    name: "XYZ Admin",
    email: `xyz.admin.d5.${Date.now()}@example.com`,
    password: "Password123!",
  };
  let xyzAdminToken: string;
  let xyzOrgId: string;

  // PR IDs
  let prToApproveId: string;
  let prToRejectId: string;
  let prDraftId: string;
  let xyzPrId: string;

  beforeAll(async () => {
    // 1. Register ABC Admin & Create Organization
    const regAbc = await request(app).post("/auth/register").send(abcAdmin);
    let tempAbcToken = regAbc.body.data.accessToken;

    const orgAbc = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${tempAbcToken}`)
      .send({ name: "ABC Technologies" });
    abcOrgId = orgAbc.body.data.organization.id;
    abcAdminToken = orgAbc.body.data.accessToken || tempAbcToken;

    // 2. Invite Rahul as MANAGER in ABC
    const rahulInvite = await request(app)
      .post("/organizations/users")
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "Rahul Manager", email: rahulEmail, role: "MANAGER" });
    const rahulInviteToken = rahulInvite.body.data.token;

    await request(app)
      .post("/auth/accept-invitation")
      .send({ token: rahulInviteToken, password: "RahulPassword123!" });

    const rahulLogin = await request(app)
      .post("/auth/login")
      .send({ email: rahulEmail, password: "RahulPassword123!" });
    rahulToken = rahulLogin.body.data.accessToken;
    rahulUserId = rahulLogin.body.data.user.id;

    // 3. Invite Ziyam as EMPLOYEE in ABC
    const ziyamInvite = await request(app)
      .post("/organizations/users")
      .set("Authorization", `Bearer ${abcAdminToken}`)
      .send({ name: "Ziyam Employee", email: ziyamEmail, role: "EMPLOYEE" });
    const ziyamInviteToken = ziyamInvite.body.data.token;

    await request(app)
      .post("/auth/accept-invitation")
      .send({ token: ziyamInviteToken, password: "ZiyamPassword123!" });

    const ziyamLogin = await request(app)
      .post("/auth/login")
      .send({ email: ziyamEmail, password: "ZiyamPassword123!" });
    ziyamToken = ziyamLogin.body.data.accessToken;
    ziyamUserId = ziyamLogin.body.data.user.id;

    // 4. Register XYZ Admin & Create Organization
    const regXyz = await request(app).post("/auth/register").send(xyzAdmin);
    let tempXyzToken = regXyz.body.data.accessToken;

    const orgXyz = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${tempXyzToken}`)
      .send({ name: "XYZ Corporation" });
    xyzOrgId = orgXyz.body.data.organization.id;
    xyzAdminToken = orgXyz.body.data.accessToken || tempXyzToken;

    // Invite Manager in XYZ to allow submitting PRs in XYZ
    const xyzMgrInvite = await request(app)
      .post("/organizations/users")
      .set("Authorization", `Bearer ${xyzAdminToken}`)
      .send({ name: "XYZ Manager", email: `xyz.mgr.${Date.now()}@example.com`, role: "MANAGER" });
    await request(app)
      .post("/auth/accept-invitation")
      .send({ token: xyzMgrInvite.body.data.token, password: "XyzPassword123!" });

    // Create & submit PR in XYZ
    const xyzPrRes = await request(app)
      .post("/purchase-requests")
      .set("Authorization", `Bearer ${xyzAdminToken}`)
      .send({
        title: "XYZ Secret Server",
        items: [{ name: "Server", quantity: 1, estimatedUnitPrice: 100000 }],
      });
    xyzPrId = xyzPrRes.body.data.id;
    await request(app)
      .post(`/purchase-requests/${xyzPrId}/submit`)
      .set("Authorization", `Bearer ${xyzAdminToken}`);

    // 5. Create PRs for ABC (Ziyam)
    // PR 1: Draft
    const prDraftRes = await request(app)
      .post("/purchase-requests")
      .set("Authorization", `Bearer ${ziyamToken}`)
      .send({
        title: "Draft PR Only",
        items: [{ name: "Paper", quantity: 5, estimatedUnitPrice: 100 }],
      });
    prDraftId = prDraftRes.body.data.id;

    // PR 2: To Approve
    const pr1Res = await request(app)
      .post("/purchase-requests")
      .set("Authorization", `Bearer ${ziyamToken}`)
      .send({
        title: "Laptop Purchase",
        justification: "New employees",
        items: [{ name: "Laptop", quantity: 10, estimatedUnitPrice: 60000 }],
      });
    prToApproveId = pr1Res.body.data.id;
    await request(app)
      .post(`/purchase-requests/${prToApproveId}/submit`)
      .set("Authorization", `Bearer ${ziyamToken}`);

    // PR 3: To Reject
    const pr2Res = await request(app)
      .post("/purchase-requests")
      .set("Authorization", `Bearer ${ziyamToken}`)
      .send({
        title: "Luxury Gaming Chairs",
        justification: "Office comfort",
        items: [{ name: "Chair", quantity: 5, estimatedUnitPrice: 50000 }],
      });
    prToRejectId = pr2Res.body.data.id;
    await request(app)
      .post(`/purchase-requests/${prToRejectId}/submit`)
      .set("Authorization", `Bearer ${ziyamToken}`);
  });

  describe("1. Manager Listing Pending Approvals", () => {
    it("Rahul (MANAGER) sees pending approval requests for ABC", async () => {
      const res = await request(app)
        .get("/purchase-requests/pending-approval")
        .set("Authorization", `Bearer ${rahulToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const prs = res.body.data;
      expect(prs.length).toBeGreaterThanOrEqual(2);
      expect(prs.some((p: any) => p.id === prToApproveId)).toBe(true);
      expect(prs.some((p: any) => p.id === prToRejectId)).toBe(true);
    });

    it("Non-manager (Ziyam - EMPLOYEE) is blocked from pending approvals -> 403 Forbidden", async () => {
      const res = await request(app)
        .get("/purchase-requests/pending-approval")
        .set("Authorization", `Bearer ${ziyamToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it("ORG_ADMIN can view pending approvals -> 200 OK", async () => {
      const res = await request(app)
        .get("/purchase-requests/pending-approval")
        .set("Authorization", `Bearer ${abcAdminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe("2. Approve Purchase Request Workflow", () => {
    it("Rahul (MANAGER) approves Ziyam's request -> status APPROVED", async () => {
      const res = await request(app)
        .post(`/purchase-requests/${prToApproveId}/approve`)
        .set("Authorization", `Bearer ${rahulToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const pr = res.body.data;
      expect(pr.status).toBe("APPROVED");
      expect(pr.approval.status).toBe("APPROVED");
      expect(pr.approval.approver.id).toBe(rahulUserId);
      expect(pr.approval.approvedAt).toBeDefined();
    });

    it("Rejects approving an already APPROVED request -> 400 Bad Request", async () => {
      const res = await request(app)
        .post(`/purchase-requests/${prToApproveId}/approve`)
        .set("Authorization", `Bearer ${rahulToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Only PENDING_APPROVAL requests can be approved");
    });
  });

  describe("3. Reject Purchase Request Workflow", () => {
    it("Rejects rejection attempt with empty reason -> 400 Bad Request", async () => {
      const res = await request(app)
        .post(`/purchase-requests/${prToRejectId}/reject`)
        .set("Authorization", `Bearer ${rahulToken}`)
        .send({ reason: "" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("Rahul (MANAGER) rejects Ziyam's request with reason -> status REJECTED", async () => {
      const reasonText = "Budget is not available for luxury gaming chairs this month.";
      const res = await request(app)
        .post(`/purchase-requests/${prToRejectId}/reject`)
        .set("Authorization", `Bearer ${rahulToken}`)
        .send({ reason: reasonText })
        .expect(200);

      expect(res.body.success).toBe(true);
      const pr = res.body.data;
      expect(pr.status).toBe("REJECTED");
      expect(pr.approval.status).toBe("REJECTED");
      expect(pr.approval.rejectionReason).toBe(reasonText);
      expect(pr.approval.approver.id).toBe(rahulUserId);
      expect(pr.approval.rejectedAt).toBeDefined();
    });

    it("Rejects rejecting an already REJECTED request -> 400 Bad Request", async () => {
      const res = await request(app)
        .post(`/purchase-requests/${prToRejectId}/reject`)
        .set("Authorization", `Bearer ${rahulToken}`)
        .send({ reason: "Another reason" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe("4. State & Role Protections", () => {
    it("Manager CANNOT approve a DRAFT request -> 400 Bad Request", async () => {
      const res = await request(app)
        .post(`/purchase-requests/${prDraftId}/approve`)
        .set("Authorization", `Bearer ${rahulToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Only PENDING_APPROVAL requests can be approved");
    });

    it("EMPLOYEE (Ziyam) CANNOT approve a request -> 403 Forbidden", async () => {
      const res = await request(app)
        .post(`/purchase-requests/${prToRejectId}/approve`)
        .set("Authorization", `Bearer ${ziyamToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it("Self-Approval Protection: Manager CANNOT approve their own PR", async () => {
      // 1. Rahul (MANAGER) creates a PR for himself
      const prRes = await request(app)
        .post("/purchase-requests")
        .set("Authorization", `Bearer ${rahulToken}`)
        .send({
          title: "Manager Self PR",
          items: [{ name: "Monitor", quantity: 1, estimatedUnitPrice: 20000 }],
        });
      const selfPrId = prRes.body.data.id;

      // Submit
      await request(app)
        .post(`/purchase-requests/${selfPrId}/submit`)
        .set("Authorization", `Bearer ${rahulToken}`);

      // Rahul attempts to approve his own PR -> 403 Forbidden
      const approveRes = await request(app)
        .post(`/purchase-requests/${selfPrId}/approve`)
        .set("Authorization", `Bearer ${rahulToken}`)
        .expect(403);

      expect(approveRes.body.success).toBe(false);
      expect(approveRes.body.message).toContain("Self-approval forbidden");
    });
  });

  describe("5. Tenant Isolation Protection", () => {
    it("Rahul (ABC Manager) CANNOT approve XYZ Corporation's request -> 404 / 403", async () => {
      const res = await request(app)
        .post(`/purchase-requests/${xyzPrId}/approve`)
        .set("Authorization", `Bearer ${rahulToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it("Rahul (ABC Manager) CANNOT reject XYZ Corporation's request -> 404 / 403", async () => {
      const res = await request(app)
        .post(`/purchase-requests/${xyzPrId}/reject`)
        .set("Authorization", `Bearer ${rahulToken}`)
        .send({ reason: "Malicious cross-tenant rejection" })
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });
});
