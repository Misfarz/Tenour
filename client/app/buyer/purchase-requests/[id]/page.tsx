"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import {
  FileText,
  Loader2,
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  Save,
  Plus,
  ShieldCheck,
} from "lucide-react";

interface PurchaseRequestItem {
  id: string;
  name: string;
  description?: string | null;
  quantity: number;
  estimatedUnitPrice: number;
  estimatedTotal: number;
}

interface PurchaseApprovalDetail {
  id: string;
  status: string;
  rejectionReason?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  approver?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface PurchaseRequestDetail {
  id: string;
  requestNumber: string;
  title: string;
  description?: string | null;
  justification?: string | null;
  status: string;
  estimatedTotal: number;
  createdAt: string;
  updatedAt: string;
  requesterId: string;
  requester: {
    id: string;
    name: string;
    email: string;
  };
  department?: {
    id: string;
    name: string;
  } | null;
  departmentId?: string | null;
  items: PurchaseRequestItem[];
  approval?: PurchaseApprovalDetail | null;
}

interface Department {
  id: string;
  name: string;
}

export default function BuyerPurchaseRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const requestId = resolvedParams.id;

  const { user, organization, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [pr, setPr] = useState<PurchaseRequestDetail | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editJustification, setEditJustification] = useState<string>("");
  const [editDeptId, setEditDeptId] = useState<string>("");
  const [editItems, setEditItems] = useState<
    { name: string; description: string; quantity: number; estimatedUnitPrice: number }[]
  >([]);

  const fetchPrDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prRes, deptsRes] = await Promise.all([
        apiClient<PurchaseRequestDetail>(`/purchase-requests/${requestId}`),
        apiClient<Department[]>("/organizations/departments"),
      ]);

      if (prRes.success && prRes.data) {
        setPr(prRes.data);
        setEditTitle(prRes.data.title);
        setEditDescription(prRes.data.description || "");
        setEditJustification(prRes.data.justification || "");
        setEditDeptId(prRes.data.departmentId || "");
        setEditItems(
          prRes.data.items.map((it) => ({
            name: it.name,
            description: it.description || "",
            quantity: it.quantity,
            estimatedUnitPrice: it.estimatedUnitPrice,
          }))
        );
      }
      if (deptsRes.success && deptsRes.data) {
        setDepartments(deptsRes.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load purchase request details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else {
        fetchPrDetail();
      }
    }
  }, [authLoading, isAuthenticated, requestId, router]);

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      setError("Title cannot be empty");
      return;
    }

    if (editItems.length === 0) {
      setError("At least one item is required");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient<PurchaseRequestDetail>(`/purchase-requests/${requestId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() || undefined,
          justification: editJustification.trim() || undefined,
          departmentId: editDeptId || undefined,
          items: editItems.map((it) => ({
            name: it.name.trim(),
            description: it.description.trim() || undefined,
            quantity: Number(it.quantity),
            estimatedUnitPrice: Number(it.estimatedUnitPrice),
          })),
        }),
      });

      if (res.success) {
        setSuccess("Purchase request updated successfully");
        setIsEditing(false);
        fetchPrDetail();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update purchase request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!pr || !confirm(`Submit purchase request ${pr.requestNumber} for approval?`)) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient(`/purchase-requests/${requestId}/submit`, {
        method: "POST",
      });
      if (res.success) {
        setSuccess(`Purchase Request ${pr.requestNumber} submitted for approval`);
        fetchPrDetail();
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit purchase request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pr || !confirm(`Are you sure you want to delete draft request ${pr.requestNumber}?`)) return;
    setSubmitting(true);
    try {
      const res = await apiClient(`/purchase-requests/${requestId}`, {
        method: "DELETE",
      });
      if (res.success) {
        router.push("/buyer/purchase-requests");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete purchase request");
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700 font-sans">Loading details...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !pr) return null;

  const isOwner = pr.requesterId === user.id;
  const isDraft = pr.status === "DRAFT";

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-md bg-slate-950 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
                N
              </div>
              <span className="font-extrabold text-xl text-slate-950 tracking-tight">Tenour</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-slate-600">{organization?.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Top Link */}
        <Link
          href="/buyer/purchase-requests"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Purchase Requests</span>
        </Link>

        {/* Approval / Rejection Audit Banner */}
        {pr.status === "APPROVED" && pr.approval && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-950 text-sm">Purchase Request Approved</h3>
              <p className="text-xs text-emerald-800 mt-1">
                Approved by <span className="font-semibold">{pr.approval.approver?.name || "Manager"}</span> ({pr.approval.approver?.email}) on{" "}
                {pr.approval.approvedAt
                  ? new Date(pr.approval.approvedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Date recorded"}
              </p>
            </div>
          </div>
        )}

        {pr.status === "REJECTED" && pr.approval && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-red-950 text-sm">Purchase Request Rejected</h3>
              <p className="text-xs text-red-800 mt-1">
                Rejected by <span className="font-semibold">{pr.approval.approver?.name || "Manager"}</span> on{" "}
                {pr.approval.rejectedAt
                  ? new Date(pr.approval.rejectedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Date recorded"}
              </p>
              {pr.approval.rejectionReason && (
                <div className="mt-3 p-3 bg-white/80 border border-red-200 rounded-xl text-xs text-red-900 font-medium">
                  <span className="font-bold block text-[11px] uppercase tracking-wider text-red-700 mb-0.5">Rejection Reason:</span>
                  {pr.approval.rejectionReason}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* PR Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-[#EDF5FF] border border-[#D0E4FF] text-[#1D72C9] text-xs font-mono font-extrabold">
                  {pr.requestNumber}
                </span>

                {pr.status === "DRAFT" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    DRAFT
                  </span>
                )}
                {pr.status === "PENDING_APPROVAL" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    PENDING APPROVAL
                  </span>
                )}
                {pr.status === "APPROVED" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    APPROVED
                  </span>
                )}
                {pr.status === "REJECTED" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    REJECTED
                  </span>
                )}
              </div>

              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-2xl font-extrabold text-slate-950 border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:border-[#2383E2]"
                />
              ) : (
                <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">{pr.title}</h1>
              )}
            </div>

            {/* Owner Actions */}
            {isOwner && isDraft && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={submitting}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Save Changes</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-slate-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={submitting}
                      className="px-3.5 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-4 py-2 bg-[#2383E2] hover:bg-[#1D72C9] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Submit Request</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Details Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-b border-slate-100 pb-6">
            <div>
              <span className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Requester
              </span>
              <span className="font-semibold text-slate-950">{pr.requester.name}</span>
              <span className="block text-slate-500 text-[11px]">{pr.requester.email}</span>
            </div>

            <div>
              <span className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Department
              </span>
              {isEditing ? (
                <select
                  value={editDeptId}
                  onChange={(e) => setEditDeptId(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs"
                >
                  <option value="">Unassigned</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              ) : (
                <span className="font-semibold text-slate-950">
                  {pr.department ? pr.department.name : "Unassigned"}
                </span>
              )}
            </div>

            <div>
              <span className="block font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Created On
              </span>
              <span className="font-semibold text-slate-950">
                {new Date(pr.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Description & Justification */}
          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-extrabold text-slate-950 mb-1">Description</h4>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              ) : (
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {pr.description || "No description provided."}
                </p>
              )}
            </div>

            <div>
              <h4 className="font-extrabold text-slate-950 mb-1">Business Justification</h4>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={editJustification}
                  onChange={(e) => setEditJustification(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              ) : (
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {pr.justification || "No justification provided."}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-extrabold text-slate-950 text-sm mb-3">Requested Items</h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Item Name & Specs</th>
                    <th className="py-3 px-4 text-center">Quantity</th>
                    <th className="py-3 px-4 text-right">Est. Unit Price</th>
                    <th className="py-3 px-4 text-right">Est. Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pr.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-950">{item.name}</div>
                        {item.description && (
                          <div className="text-slate-500 text-[11px]">{item.description}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        ₹{item.estimatedUnitPrice.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-950">
                        ₹{item.estimatedTotal.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mt-4 p-4 rounded-xl bg-[#EDF5FF] border border-[#D0E4FF] flex items-center justify-between">
              <span className="font-bold text-slate-700 text-xs">Overall Estimated Request Total:</span>
              <span className="text-2xl font-black text-[#1D72C9]">
                ₹{pr.estimatedTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
