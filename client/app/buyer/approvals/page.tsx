"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  CheckCircle,
  FileText,
  Loader2,
  LogOut,
  Lock,
  ArrowLeft,
  Eye,
  Building2,
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
  const { user, organization, role, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [pendingPrs, setPendingPrs] = useState<PendingApprovalPR[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      } else if (role === "MANAGER") {
        fetchPendingApprovals();
      }
    }
  }, [authLoading, isAuthenticated, role, router]);

  if (authLoading || (loading && role === "MANAGER")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading manager approvals...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  // 403 Access Denied for Non-Managers
  if (role !== "MANAGER") {
    return (
      <div className="min-h-screen bg-[#FAFBFD] flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950 mb-2">Manager Access Only</h1>
          <p className="text-slate-600 text-xs leading-relaxed mb-6">
            Only users with the <span className="font-semibold text-slate-900">MANAGER</span> role can review and approve purchase requests in Day 5. Your role is <span className="font-semibold text-[#2383E2]">{role || "Member"}</span>.
          </p>
          <Link
            href="/buyer/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Navbar */}
      <BuyerNavbar activePath="/buyer/approvals" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Manager Approval Queue (Day 5)</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
              Pending Requisition Approvals
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Review and approve or reject purchase requests submitted by team members in {organization?.name}.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Pending Requests Grid / Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {pendingPrs.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm mb-1">No Pending Approvals</h3>
              <p className="text-xs text-slate-500">All purchase requests assigned to you have been reviewed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Request #</th>
                    <th className="py-3.5 px-6">Title</th>
                    <th className="py-3.5 px-6">Requester</th>
                    <th className="py-3.5 px-6">Department</th>
                    <th className="py-3.5 px-6">Estimated Total</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {pendingPrs.map((pr) => (
                    <tr key={pr.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6 font-mono font-bold text-[#2383E2]">
                        <Link href={`/buyer/approvals/${pr.id}`} className="hover:underline">
                          {pr.requestNumber}
                        </Link>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-950 max-w-xs truncate">{pr.title}</td>
                      <td className="py-4 px-6 text-slate-700">{pr.requester.name}</td>
                      <td className="py-4 px-6">
                        {pr.department ? (
                          <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium">
                            {pr.department.name}
                          </span>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-extrabold text-slate-950">
                        ₹{pr.estimatedTotal.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          PENDING APPROVAL
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/buyer/approvals/${pr.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs shadow-sm transition"
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
