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
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  Building2,
  AlertTriangle,
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
  items: PurchaseRequestItem[];
  approval?: PurchaseApprovalDetail | null;
}

export default function ManagerApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const requestId = resolvedParams.id;

  const { user, organization, role, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [pr, setPr] = useState<PurchaseRequestDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Modal Controls
  const [showApproveModal, setShowApproveModal] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  const fetchPrDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<PurchaseRequestDetail>(`/purchase-requests/${requestId}`);
      if (res.success && res.data) {
        setPr(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load purchase request for approval");
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

  const handleApproveConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient(`/purchase-requests/${requestId}/approve`, {
        method: "POST",
      });

      if (res.success) {
        setShowApproveModal(false);
        router.push("/buyer/approvals");
      }
    } catch (err: any) {
      setError(err.message || "Failed to approve purchase request");
      setShowApproveModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setError("Please provide a reason for rejection.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient(`/purchase-requests/${requestId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });

      if (res.success) {
        setShowRejectModal(false);
        router.push("/buyer/approvals");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reject purchase request");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700 font-sans">Loading review details...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !pr) return null;

  const isPending = pr.status === "PENDING_APPROVAL";
  const isManager = role === "MANAGER";
  const isSelf = pr.requesterId === user.id;

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
          href="/buyer/approvals"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pending Approvals</span>
        </Link>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* PR Review Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-[#EDF5FF] border border-[#D0E4FF] text-[#1D72C9] text-xs font-mono font-extrabold">
                  {pr.requestNumber}
                </span>

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

              <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">{pr.title}</h1>
            </div>

            {/* Manager Review Action Buttons */}
            {isManager && isPending && !isSelf && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={submitting}
                  className="px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => setShowApproveModal(true)}
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
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
              <span className="font-semibold text-slate-950">
                {pr.department ? pr.department.name : "Unassigned"}
              </span>
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
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {pr.description || "No description provided."}
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-950 mb-1">Business Justification</h4>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {pr.justification || "No justification provided."}
              </p>
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

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-950 mb-1">Approve Purchase Request?</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to approve request <span className="font-bold text-slate-900">{pr.requestNumber}</span> ({pr.title}) for <span className="font-bold text-[#1D72C9]">₹{pr.estimatedTotal.toLocaleString("en-IN")}</span>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveConfirm}
                disabled={submitting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Approve Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-950 mb-1">Reject Purchase Request</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Please provide a reason for rejecting <span className="font-bold text-slate-900">{pr.requestNumber}</span>:
            </p>

            <form onSubmit={handleRejectConfirm} className="space-y-4">
              <textarea
                required
                rows={3}
                placeholder="e.g. Budget is not available for this department this quarter."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-red-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Reject Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
