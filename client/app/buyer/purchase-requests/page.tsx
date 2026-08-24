"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import {
  FileText,
  Plus,
  Loader2,
  LogOut,
  ArrowRight,
  Search,
  Filter,
  Eye,
  Building2,
  Trash2,
  Send,
  Edit,
} from "lucide-react";

interface PurchaseRequestItem {
  id: string;
  name: string;
  quantity: number;
  estimatedUnitPrice: number;
  estimatedTotal: number;
}

interface PurchaseRequest {
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

export default function BuyerPurchaseRequestsPage() {
  const { user, organization, role, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<PurchaseRequest[]>("/purchase-requests");
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load purchase requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else {
        fetchRequests();
      }
    }
  }, [authLoading, isAuthenticated, router]);

  const handleDelete = async (id: string, requestNumber: string) => {
    if (!confirm(`Are you sure you want to delete draft request ${requestNumber}?`)) return;
    try {
      const res = await apiClient(`/purchase-requests/${id}`, {
        method: "DELETE",
      });
      if (res.success) {
        setSuccess(`Purchase Request ${requestNumber} deleted successfully`);
        fetchRequests();
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete purchase request");
    }
  };

  const handleSubmit = async (id: string, requestNumber: string) => {
    if (!confirm(`Submit purchase request ${requestNumber} for approval?`)) return;
    try {
      const res = await apiClient(`/purchase-requests/${id}/submit`, {
        method: "POST",
      });
      if (res.success) {
        setSuccess(`Purchase Request ${requestNumber} submitted for approval`);
        fetchRequests();
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit purchase request");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading purchase requests...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const filteredRequests = requests.filter((pr) => {
    const matchesSearch =
      pr.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.requester.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || pr.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            <Link href="/buyer/dashboard" className="hover:text-slate-950 transition">Dashboard</Link>
            <Link href="/buyer/purchase-requests" className="text-[#2383E2] font-semibold">Purchase Requests</Link>
            {role === "ORG_ADMIN" && (
              <>
                <Link href="/buyer/users" className="hover:text-slate-950 transition">User Management</Link>
                <Link href="/buyer/departments" className="hover:text-slate-950 transition">Departments</Link>
                <Link href="/buyer/settings" className="hover:text-slate-950 transition">Organization Settings</Link>
              </>
            )}
          </nav>

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
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF5FF] border border-[#D0E4FF] text-[#1D72C9] text-xs font-semibold mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Procurement Workflow (Day 4)</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
              Purchase Requests
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Create, edit, and track requisitions for items and services needed by your team.
            </p>
          </div>

          <Link
            href="/buyer/purchase-requests/new"
            className="px-4 py-2.5 rounded-lg bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Request</span>
          </Link>
        </div>

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

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by request #, title, or requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#2383E2]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2383E2] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm mb-1">No purchase requests found</h3>
              <p className="text-xs text-slate-500 mb-4">You haven't created any purchase requests matching this filter.</p>
              <Link
                href="/buyer/purchase-requests/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2383E2] hover:bg-[#1D72C9] text-white rounded-lg font-semibold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Request</span>
              </Link>
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
                    <th className="py-3.5 px-6">Created Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRequests.map((pr) => (
                    <tr key={pr.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6 font-mono font-bold text-[#2383E2]">
                        <Link href={`/buyer/purchase-requests/${pr.id}`} className="hover:underline">
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
                        {pr.status === "DRAFT" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            DRAFT
                          </span>
                        )}
                        {pr.status === "PENDING_APPROVAL" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            PENDING APPROVAL
                          </span>
                        )}
                        {pr.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            APPROVED
                          </span>
                        )}
                        {pr.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            REJECTED
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {new Date(pr.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/buyer/purchase-requests/${pr.id}`}
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {pr.status === "DRAFT" && pr.requester.id === user.id && (
                            <>
                              <button
                                onClick={() => handleSubmit(pr.id, pr.requestNumber)}
                                className="px-2.5 py-1.5 rounded-md bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs flex items-center gap-1 transition"
                                title="Submit Request"
                              >
                                <Send className="w-3 h-3" />
                                <span>Submit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(pr.id, pr.requestNumber)}
                                className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                title="Delete Draft"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
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
