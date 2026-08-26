"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  FileCode,
  Plus,
  Search,
  Filter,
  LogOut,
  Loader2,
  Eye,
  Calendar,
  Building2,
  Send,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface RfqItem {
  id: string;
  name: string;
  quantity: number;
}

interface RfqVendor {
  id: string;
  vendor: {
    id: string;
    name: string;
  };
}

interface Rfq {
  id: string;
  rfqNumber: string;
  title: string;
  description?: string | null;
  status: string;
  quotationDeadline: string;
  deliveryRequirement?: string | null;
  createdAt: string;
  purchaseRequest: {
    id: string;
    requestNumber: string;
    title: string;
  };
  items: RfqItem[];
  vendors: RfqVendor[];
}

export default function BuyerRfqsPage() {
  const { user, organization, role, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchRfqs = async () => {
    setLoading(true);
    setError(null);
    try {
      let queryParams = new URLSearchParams();
      if (searchTerm.trim()) queryParams.set("search", searchTerm.trim());
      if (statusFilter !== "ALL") queryParams.set("status", statusFilter);

      const res = await apiClient<Rfq[]>(`/rfqs?${queryParams.toString()}`);
      if (res.success && res.data) {
        setRfqs(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load RFQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else {
        fetchRfqs();
      }
    }
  }, [authLoading, isAuthenticated, statusFilter, router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRfqs();
  };

  if (authLoading || (loading && rfqs.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading RFQs & Sourcing...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const canManageRfqs = role === "ORG_ADMIN" || role === "PROCUREMENT";

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Navbar */}
      <BuyerNavbar activePath="/buyer/rfqs" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">RFQ & Sourcing</h1>
            <p className="text-slate-500 text-xs mt-1">
              Create Requests for Quotations, invite qualified vendors, and gather competitive bids for {organization?.name}.
            </p>
          </div>

          {canManageRfqs && (
            <Link
              href="/buyer/rfqs/new"
              className="px-4 py-2.5 rounded-xl bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create RFQ</span>
            </Link>
          )}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search RFQ by title or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#2383E2]"
            />
          </form>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="OPEN">OPEN</option>
              <option value="CLOSED">CLOSED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* RFQs Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {rfqs.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FileCode className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm mb-1">No RFQs Found</h3>
              <p className="text-xs text-slate-500 mb-4">Create a new RFQ from an approved Purchase Request to initiate sourcing.</p>
              {canManageRfqs && (
                <Link
                  href="/buyer/rfqs/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2383E2] text-white font-semibold text-xs shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First RFQ</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">RFQ Number & Title</th>
                    <th className="py-3.5 px-6">Purchase Request</th>
                    <th className="py-3.5 px-6">Items & Vendors</th>
                    <th className="py-3.5 px-6">Quotation Deadline</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {rfqs.map((rfq) => (
                    <tr key={rfq.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6">
                        <Link href={`/buyer/rfqs/${rfq.id}`} className="font-bold text-slate-950 hover:text-[#2383E2] transition block">
                          {rfq.title}
                        </Link>
                        <div className="text-[11px] font-mono text-slate-400 font-semibold">{rfq.rfqNumber}</div>
                      </td>
                      <td className="py-4 px-6">
                        <Link href={`/buyer/purchase-requests/${rfq.purchaseRequest.id}`} className="font-medium text-slate-800 hover:text-[#2383E2] transition">
                          {rfq.purchaseRequest.title}
                        </Link>
                        <div className="text-[11px] font-mono text-slate-400">{rfq.purchaseRequest.requestNumber}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-slate-800 font-medium">{rfq.items.length} Line Item(s)</div>
                        <div className="text-[11px] text-slate-400">{rfq.vendors.length} Vendor(s) Selected</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(rfq.quotationDeadline).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {rfq.status === "OPEN" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            OPEN
                          </span>
                        )}
                        {rfq.status === "DRAFT" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-600 font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            DRAFT
                          </span>
                        )}
                        {rfq.status === "CLOSED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            CLOSED
                          </span>
                        )}
                        {rfq.status === "CANCELLED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            CANCELLED
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/buyer/rfqs/${rfq.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
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
