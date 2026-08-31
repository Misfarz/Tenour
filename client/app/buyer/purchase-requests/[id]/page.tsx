"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  FileText,
  Loader2,
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  Save,
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

  const { user, organization, isAuthenticated, isLoading: authLoading } = useAuth();
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

  const fetchPrDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<PurchaseRequestDetail>(`/purchase-requests/${requestId}`);
      if (res.success && res.data) {
        setPr(res.data);
        setEditTitle(res.data.title);
        setEditDescription(res.data.description || "");
        setEditJustification(res.data.justification || "");
        setEditDeptId(res.data.departmentId || "");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load purchase request details");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await apiClient<Department[]>("/organizations/departments");
      if (res.success && res.data) {
        setDepartments(res.data);
      }
    } catch (err) {
      // Ignore department fetch error
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else {
        fetchPrDetail();
        fetchDepartments();
      }
    }
  }, [authLoading, isAuthenticated, requestId, router]);

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      setError("Title cannot be empty");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient(`/purchase-requests/${requestId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() || undefined,
          justification: editJustification.trim() || undefined,
          departmentId: editDeptId || undefined,
        }),
      });

      if (res.success) {
        setIsEditing(false);
        setSuccess("Request details updated");
        fetchPrDetail();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update purchase request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await apiClient(`/purchase-requests/${requestId}/submit`, {
        method: "POST",
      });

      if (res.success) {
        setSuccess(`Purchase Request ${pr?.requestNumber} submitted for approval`);
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
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400 font-sans">Loading details...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !pr) return null;

  const isOwner = pr.requesterId === user.id;
  const isDraft = pr.status === "DRAFT";

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Navbar */}
      <BuyerNavbar activePath="/buyer/purchase-requests" />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 font-sans">
        {/* Top Link */}
        <Link
          href="/buyer/purchase-requests"
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition self-start font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Purchase Requests</span>
        </Link>

        {/* Approval / Rejection Audit Banner */}
        {pr.status === "APPROVED" && pr.approval && (
          <div className="bg-[#1e1e1e] border border-emerald-500/30 rounded-3xl p-6 flex items-start gap-4 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-white">Purchase Request Approved</h3>
              <p className="text-xs text-neutral-300 mt-1 font-sans">
                Approved by <span className="font-semibold text-white">{pr.approval.approver?.name || "Manager"}</span> ({pr.approval.approver?.email}) on{" "}
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
          <div className="bg-[#1e1e1e] border border-red-500/30 rounded-3xl p-6 flex items-start gap-4 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-white">Purchase Request Rejected</h3>
              <p className="text-xs text-neutral-300 mt-1 font-sans">
                Rejected by <span className="font-semibold text-white">{pr.approval.approver?.name || "Manager"}</span> on{" "}
                {pr.approval.rejectedAt
                  ? new Date(pr.approval.rejectedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Date recorded"}
              </p>
              {pr.approval.rejectionReason && (
                <div className="mt-3 p-4 bg-[#141414] border border-red-500/30 rounded-2xl text-xs text-red-300 font-sans">
                  <span className="font-mono font-bold block text-[10px] uppercase tracking-wider text-red-400 mb-1">Rejection Reason:</span>
                  {pr.approval.rejectionReason}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between font-sans">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between font-sans">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* PR Header Card */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-extrabold">
                  {pr.requestNumber}
                </span>

                {pr.status === "DRAFT" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#282828] border border-neutral-700/60 text-neutral-400 text-xs font-mono font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                    DRAFT
                  </span>
                )}
                {pr.status === "PENDING_APPROVAL" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    PENDING APPROVAL
                  </span>
                )}
                {pr.status === "APPROVED" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    APPROVED
                  </span>
                )}
                {pr.status === "REJECTED" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    REJECTED
                  </span>
                )}
              </div>

              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full font-serif text-2xl font-normal text-white bg-[#141414] border border-neutral-800 rounded-2xl p-3 focus:outline-none focus:border-neutral-500 transition"
                />
              ) : (
                <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">{pr.title}</h1>
              )}
            </div>

            {/* Owner Actions */}
            {isOwner && isDraft && (
              <div className="flex items-center gap-2.5 self-start sm:self-auto font-sans">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 rounded-full text-xs font-medium transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={submitting}
                      className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                    >
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : <Save className="w-3.5 h-3.5 text-black" />}
                      <span>Save Changes</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-[#242424] border border-neutral-700/60 hover:bg-[#2e2e2e] text-white rounded-full text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                    >
                      <Edit className="w-3.5 h-3.5 text-neutral-300" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={submitting}
                      className="px-4 py-2 bg-[#242424] border border-red-500/30 hover:bg-red-950/40 text-red-400 rounded-full text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-5 py-2 bg-white hover:bg-neutral-200 text-black rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                    >
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : <Send className="w-3.5 h-3.5 text-black" />}
                      <span>Submit Request</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Details Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-b border-neutral-800/80 pb-6 font-sans">
            <div>
              <span className="block font-mono font-bold text-neutral-500 uppercase tracking-wider text-[10px] mb-1">
                Requester
              </span>
              <span className="font-semibold text-white">{pr.requester.name}</span>
              <span className="block text-neutral-400 text-[11px]">{pr.requester.email}</span>
            </div>

            <div>
              <span className="block font-mono font-bold text-neutral-500 uppercase tracking-wider text-[10px] mb-1">
                Department
              </span>
              {isEditing ? (
                <select
                  value={editDeptId}
                  onChange={(e) => setEditDeptId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141414] border border-neutral-800 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              ) : (
                <span className="font-semibold text-white">
                  {pr.department ? pr.department.name : "Unassigned"}
                </span>
              )}
            </div>

            <div>
              <span className="block font-mono font-bold text-neutral-500 uppercase tracking-wider text-[10px] mb-1">
                Created On
              </span>
              <span className="font-semibold text-white">
                {new Date(pr.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Description & Justification */}
          <div className="space-y-4 text-xs font-sans">
            <div>
              <h4 className="font-serif text-lg font-normal text-white mb-1.5">Description</h4>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white focus:outline-none focus:border-neutral-500 transition"
                />
              ) : (
                <p className="text-neutral-300 leading-relaxed bg-[#141414] p-4 rounded-2xl border border-neutral-800">
                  {pr.description || "No description provided."}
                </p>
              )}
            </div>

            <div>
              <h4 className="font-serif text-lg font-normal text-white mb-1.5">Business Justification</h4>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={editJustification}
                  onChange={(e) => setEditJustification(e.target.value)}
                  className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white focus:outline-none focus:border-neutral-500 transition"
                />
              ) : (
                <p className="text-neutral-300 leading-relaxed bg-[#141414] p-4 rounded-2xl border border-neutral-800">
                  {pr.justification || "No justification provided."}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="pt-4 border-t border-neutral-800/80 font-sans">
            <h3 className="font-serif text-xl font-normal text-white mb-3">Requested Items</h3>

            <div className="border border-neutral-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#181818] border-b border-neutral-800 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                    <th className="py-3.5 px-4">Item Name & Specs</th>
                    <th className="py-3.5 px-4 text-center">Quantity</th>
                    <th className="py-3.5 px-4 text-right">Est. Unit Price</th>
                    <th className="py-3.5 px-4 text-right">Est. Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {pr.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#242424]">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{item.name}</div>
                        {item.description && (
                          <div className="text-neutral-400 text-[11px]">{item.description}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-neutral-300 font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-neutral-400 font-mono">
                        ₹{item.estimatedUnitPrice.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-white font-mono">
                        ₹{item.estimatedTotal.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mt-4 p-4 rounded-2xl bg-[#141414] border border-neutral-800 flex items-center justify-between font-sans">
              <span className="font-mono text-neutral-400 text-xs uppercase">Overall Estimated Request Total:</span>
              <span className="text-xl font-mono font-bold text-white">
                ₹{pr.estimatedTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
