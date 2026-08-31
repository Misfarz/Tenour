"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
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

  const { user, organization, role, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [pr, setPr] = useState<PurchaseRequestDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Modal Controls
  const [showApproveModal, setShowApproveModal] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  const displayRole = typeof role === "string" ? role : (role as any)?.name || "ORG_ADMIN";

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
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400 font-sans">Loading review details...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !pr) return null;

  const isPending = pr.status === "PENDING_APPROVAL";
  const isManagerOrAdmin = displayRole === "MANAGER" || displayRole === "ORG_ADMIN";
  const isSelf = pr.requesterId === user.id;

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Navbar */}
      <BuyerNavbar activePath="/buyer/approvals" />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Top Link */}
        <Link
          href="/buyer/approvals"
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition self-start font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pending Approvals</span>
        </Link>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between font-sans">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* PR Review Card */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-extrabold">
                  {pr.requestNumber}
                </span>

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

              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-white tracking-tight">{pr.title}</h1>
            </div>

            {/* Manager Review Action Buttons */}
            {isManagerOrAdmin && isPending && !isSelf && (
              <div className="flex items-center gap-3 self-start sm:self-auto font-sans">
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={submitting}
                  className="px-4 py-2 bg-[#242424] border border-red-500/30 hover:bg-red-950/40 text-red-400 rounded-full text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => setShowApproveModal(true)}
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
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
              <span className="font-semibold text-white">
                {pr.department ? pr.department.name : "Unassigned"}
              </span>
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
              <h4 className="font-serif text-base font-normal text-white mb-1.5">Description</h4>
              <p className="text-neutral-300 leading-relaxed bg-[#141414] p-4 rounded-2xl border border-neutral-800">
                {pr.description || "No description provided."}
              </p>
            </div>

            <div>
              <h4 className="font-serif text-base font-normal text-white mb-1.5">Business Justification</h4>
              <p className="text-neutral-300 leading-relaxed bg-[#141414] p-4 rounded-2xl border border-neutral-800">
                {pr.justification || "No justification provided."}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="pt-4 border-t border-neutral-800/80 font-sans">
            <h3 className="font-serif text-lg font-normal text-white mb-3">Requested Items</h3>

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

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl font-sans">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-normal text-white mb-2">Approve Purchase Request?</h3>
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed font-sans">
              Are you sure you want to approve request <span className="font-mono text-white font-semibold">{pr.requestNumber}</span> ({pr.title}) for <span className="font-mono text-emerald-400 font-bold">₹{pr.estimatedTotal.toLocaleString("en-IN")}</span>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-5 py-2.5 bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 rounded-full text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveConfirm}
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : "Approve Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl font-sans">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4 border border-red-500/30">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-normal text-white mb-2">Reject Purchase Request</h3>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed font-sans">
              Please provide a reason for rejecting <span className="font-mono text-white font-semibold">{pr.requestNumber}</span>:
            </p>

            <form onSubmit={handleRejectConfirm} className="space-y-4 font-sans">
              <textarea
                required
                rows={3}
                placeholder="e.g. Budget is not available for this department this quarter."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500 transition"
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-5 py-2.5 bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 rounded-full text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : "Reject Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
