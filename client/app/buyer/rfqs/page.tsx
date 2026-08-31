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
  Loader2,
  Eye,
  Calendar,
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
  const { user, organization, role, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const displayRole = typeof role === "string" ? role : (role as any)?.name || "ORG_ADMIN";

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
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400">Loading RFQs & Sourcing...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const canManageRfqs = displayRole === "ORG_ADMIN" || displayRole === "PROCUREMENT";

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Navbar */}
      <BuyerNavbar activePath="/buyer/rfqs" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Banner Container */}
        <div className="bg-[#1e1e1e] p-6 sm:p-8 rounded-3xl border border-neutral-800/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-mono font-extrabold uppercase tracking-widest mb-3">
              <FileCode className="w-3.5 h-3.5" />
              <span>Sourcing & Bidding</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">
              RFQs & Sourcing
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1.5 font-sans">
              Create Requests for Quotations, invite qualified vendors, and gather competitive bids for {organization?.name}.
            </p>
          </div>

          {canManageRfqs && (
            <Link
              href="/buyer/rfqs/new"
              className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-md transition flex items-center gap-2 self-start sm:self-auto cursor-pointer font-sans"
            >
              <Plus className="w-4 h-4" />
              <span>Create RFQ</span>
            </Link>
          )}
        </div>

        {/* Filters & Search Container */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#1e1e1e] p-4 rounded-3xl border border-neutral-800/80 shadow-xl font-sans">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
            <input
              type="text"
              placeholder="Search RFQ by title or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition"
            />
          </form>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#141414] border border-neutral-800 rounded-2xl text-xs font-semibold text-white focus:outline-none focus:border-neutral-500 cursor-pointer"
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
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between font-sans">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* RFQs Table */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl shadow-2xl overflow-hidden font-sans">
          {rfqs.length === 0 ? (
            <div className="p-12 text-center text-neutral-400">
              <FileCode className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <h3 className="font-serif text-lg text-white mb-1">No RFQs Found</h3>
              <p className="text-xs text-neutral-400 mb-4">Create a new RFQ from an approved Purchase Request to initiate sourcing.</p>
              {canManageRfqs && (
                <Link
                  href="/buyer/rfqs/new"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 font-semibold text-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First RFQ</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#181818] border-b border-neutral-800/80 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                    <th className="py-4 px-6">RFQ Number & Title</th>
                    <th className="py-4 px-6">Purchase Request</th>
                    <th className="py-4 px-6">Items & Vendors</th>
                    <th className="py-4 px-6">Quotation Deadline</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-xs">
                  {rfqs.map((rfq) => (
                    <tr key={rfq.id} className="hover:bg-[#242424] transition">
                      <td className="py-4 px-6">
                        <Link href={`/buyer/rfqs/${rfq.id}`} className="font-semibold text-white hover:text-blue-400 transition block">
                          {rfq.title}
                        </Link>
                        <div className="text-[11px] font-mono text-indigo-400 font-bold">{rfq.rfqNumber}</div>
                      </td>
                      <td className="py-4 px-6">
                        <Link href={`/buyer/purchase-requests/${rfq.purchaseRequest.id}`} className="font-medium text-neutral-300 hover:text-white transition">
                          {rfq.purchaseRequest.title}
                        </Link>
                        <div className="text-[11px] font-mono text-neutral-500">{rfq.purchaseRequest.requestNumber}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-neutral-200 font-medium">{rfq.items.length} Line Item(s)</div>
                        <div className="text-[11px] text-neutral-400">{rfq.vendors.length} Vendor(s) Selected</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{new Date(rfq.quotationDeadline).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {rfq.status === "OPEN" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            OPEN
                          </span>
                        )}
                        {rfq.status === "DRAFT" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#282828] border border-neutral-700/60 text-neutral-400 text-[10px] font-mono font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                            DRAFT
                          </span>
                        )}
                        {rfq.status === "CLOSED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            CLOSED
                          </span>
                        )}
                        {rfq.status === "CANCELLED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            CANCELLED
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/buyer/rfqs/${rfq.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#242424] hover:bg-[#2e2e2e] border border-neutral-700/60 text-neutral-200 font-semibold text-xs transition"
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
