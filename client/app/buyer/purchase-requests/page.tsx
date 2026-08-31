"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  FileText,
  Plus,
  Loader2,
  Search,
  Filter,
  Eye,
  Trash2,
  Send,
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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
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
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400">Loading purchase requests...</span>
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
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Navbar */}
      <BuyerNavbar activePath="/buyer/purchase-requests" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Banner Container */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1e1e1e] p-6 sm:p-8 rounded-3xl border border-neutral-800/80 shadow-2xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono font-extrabold uppercase tracking-widest mb-3">
              <FileText className="w-3.5 h-3.5" />
              <span>Procurement Workflow</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">
              Purchase Requests
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1.5 font-sans">
              Create, edit, and track requisitions for items and services needed by your team.
            </p>
          </div>

          <Link
            href="/buyer/purchase-requests/new"
            className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-md transition flex items-center gap-2 self-start sm:self-auto cursor-pointer font-sans"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Request</span>
          </Link>
        </div>

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

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#1e1e1e] p-4 rounded-3xl border border-neutral-800/80 shadow-xl font-sans">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by request #, title, or requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-xs font-medium text-neutral-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#141414] border border-neutral-800 rounded-2xl text-xs font-semibold text-white focus:outline-none focus:border-neutral-500 cursor-pointer"
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
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl shadow-2xl overflow-hidden font-sans">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-neutral-400">
              <FileText className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <h3 className="font-serif text-lg text-white mb-1">No purchase requests found</h3>
              <p className="text-xs text-neutral-400 mb-4">You haven't created any purchase requests matching this filter.</p>
              <Link
                href="/buyer/purchase-requests/new"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-full font-semibold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Request</span>
              </Link>
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
                    <th className="py-4 px-6">Created Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-xs">
                  {filteredRequests.map((pr) => (
                    <tr key={pr.id} className="hover:bg-[#242424] transition">
                      <td className="py-4 px-6 font-mono font-bold text-blue-400">
                        <Link href={`/buyer/purchase-requests/${pr.id}`} className="hover:underline">
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
                        {pr.status === "DRAFT" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#282828] border border-neutral-700/60 text-neutral-300 text-[10px] font-mono font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                            DRAFT
                          </span>
                        )}
                        {pr.status === "PENDING_APPROVAL" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            PENDING APPROVAL
                          </span>
                        )}
                        {pr.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            APPROVED
                          </span>
                        )}
                        {pr.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            REJECTED
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-neutral-400">
                        {new Date(pr.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/buyer/purchase-requests/${pr.id}`}
                            className="p-1.5 rounded-xl bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 hover:text-white transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {pr.status === "DRAFT" && pr.requester.id === user.id && (
                            <>
                              <button
                                onClick={() => handleSubmit(pr.id, pr.requestNumber)}
                                className="px-3 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
                                title="Submit Request"
                              >
                                <Send className="w-3 h-3" />
                                <span>Submit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(pr.id, pr.requestNumber)}
                                className="p-1.5 rounded-xl bg-[#242424] hover:bg-red-950/40 text-neutral-400 hover:text-red-400 transition cursor-pointer"
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
