"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  CheckCircle,
  Loader2,
  Lock,
  ArrowLeft,
  Eye,
  Clock,
} from "lucide-react";

interface PurchaseRequestItem {
  id: string;
  name: string;
  quantity: number;
  estimatedUnitPrice: number;
  estimatedTotal: number;
}

interface PendingApprovalPR {
  id: string;
  requestNumber: string;
  title: string;
  description?: string;
  justification?: string;
  status: string;
  estimatedTotal: number;
  createdAt: string;
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
}

export default function ManagerApprovalsPage() {
  const { user, organization, role, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [pendingPrs, setPendingPrs] = useState<PendingApprovalPR[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const displayRole = typeof role === "string" ? role : (role as any)?.name || "ORG_ADMIN";
  const isManagerOrAdmin = displayRole === "MANAGER" || displayRole === "ORG_ADMIN";

  const fetchPendingApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<PendingApprovalPR[]>("/purchase-requests/pending-approval");
      if (res.success && res.data) {
        setPendingPrs(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else if (isManagerOrAdmin) {
        fetchPendingApprovals();
      }
    }
  }, [authLoading, isAuthenticated, isManagerOrAdmin, router]);

  if (authLoading || (loading && isManagerOrAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400">Loading manager approvals...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  // 403 Access Denied for Non-Managers
  if (!isManagerOrAdmin) {
    return (
      <div className="min-h-screen bg-[#161616] flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[#282828] text-amber-400 flex items-center justify-center mx-auto mb-4 border border-neutral-700/60">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-normal text-white mb-2">Manager Access Only</h1>
          <p className="text-neutral-400 text-xs leading-relaxed mb-6 font-sans">
            Only users with the <span className="font-semibold text-white">MANAGER</span> or <span className="font-semibold text-white">ORG_ADMIN</span> role can review and approve purchase requests. Your role is <span className="font-mono text-amber-400">{displayRole}</span>.
          </p>
          <Link
            href="/buyer/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 font-semibold text-xs transition font-sans"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Navbar */}
      <BuyerNavbar activePath="/buyer/approvals" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Banner Container */}
        <div className="bg-[#1e1e1e] p-6 sm:p-8 rounded-3xl border border-neutral-800/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-extrabold uppercase tracking-widest mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>Manager Approval Queue</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">
              Pending Requisition Approvals
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1.5 font-sans">
              Review and approve or reject purchase requests submitted by team members in {organization?.name}.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between font-sans">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Pending Requests Grid / Table */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl shadow-2xl overflow-hidden font-sans">
          {pendingPrs.length === 0 ? (
            <div className="p-12 text-center text-neutral-400">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-serif text-lg text-white mb-1">No Pending Approvals</h3>
              <p className="text-xs text-neutral-400">All purchase requests assigned to your queue have been reviewed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#181818] border-b border-neutral-800/80 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                    <th className="py-4 px-6">Request #</th>
                    <th className="py-4 px-6">Title</th>
                    <th className="py-4 px-6">Requester</th>
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6">Estimated Total</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-xs">
                  {pendingPrs.map((pr) => (
                    <tr key={pr.id} className="hover:bg-[#242424] transition">
                      <td className="py-4 px-6 font-mono font-bold text-blue-400">
                        <Link href={`/buyer/approvals/${pr.id}`} className="hover:underline">
                          {pr.requestNumber}
                        </Link>
                      </td>
                      <td className="py-4 px-6 font-medium text-white max-w-xs truncate">{pr.title}</td>
                      <td className="py-4 px-6 text-neutral-300">{pr.requester.name}</td>
                      <td className="py-4 px-6">
                        {pr.department ? (
                          <span className="px-2.5 py-1 rounded-full bg-[#282828] border border-neutral-700/60 text-neutral-300 text-[11px] font-medium">
                            {pr.department.name}
                          </span>
                        ) : (
                          <span className="text-neutral-500">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-white">
                        ₹{pr.estimatedTotal.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          PENDING APPROVAL
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/buyer/approvals/${pr.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-sm transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review Request</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
