"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  FileCode,
  ArrowLeft,
  Loader2,
  Calendar,
  Building2,
  Send,
  XCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
} from "lucide-react";

interface RfqItem {
  id: string;
  name: string;
  description?: string | null;
  quantity: number;
  unit?: string | null;
  specifications?: string | null;
}

interface RfqVendor {
  id: string;
  status: string;
  sentAt?: string | null;
  vendor: {
    id: string;
    name: string;
    email?: string | null;
  };
}

interface RfqDetail {
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
    status: string;
    requester?: {
      name: string;
      email: string;
    };
  };
  items: RfqItem[];
  vendors: RfqVendor[];
}

export default function BuyerRfqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const rfqId = resolvedParams.id;

  const { user, organization, role, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [rfq, setRfq] = useState<RfqDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchRfqDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<RfqDetail>(`/rfqs/${rfqId}`);
      if (res.success && res.data) {
        setRfq(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load RFQ details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else {
        fetchRfqDetail();
      }
    }
  }, [authLoading, isAuthenticated, rfqId, router]);

  const handleSendRfq = async () => {
    if (!confirm("Are you sure you want to send this RFQ to selected vendors? This will transition status to OPEN.")) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient(`/rfqs/${rfqId}/send`, { method: "POST" });
      if (res.success) {
        setSuccess("RFQ sent successfully to selected vendors! Status is now OPEN.");
        fetchRfqDetail();
      }
    } catch (err: any) {
      setError(err.message || "Failed to send RFQ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRfq = async () => {
    if (!confirm("Are you sure you want to cancel this RFQ? This action cannot be undone.")) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient(`/rfqs/${rfqId}/cancel`, { method: "POST" });
      if (res.success) {
        setSuccess("RFQ cancelled successfully.");
        fetchRfqDetail();
      }
    } catch (err: any) {
      setError(err.message || "Failed to cancel RFQ");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading RFQ details...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !rfq) return null;

  const canManage = role === "ORG_ADMIN" || role === "PROCUREMENT";

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Navbar */}
      <BuyerNavbar activePath="/buyer/rfqs" />
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <Link href="/buyer/rfqs" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to RFQ Directory</span>
          </Link>

          <Link
            href={`/vendor/rfqs/${rfq.id}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition"
            title="Preview Vendor View of this RFQ"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#2383E2]" />
            <span>Vendor Preview View</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
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

        {/* RFQ Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
                  {rfq.rfqNumber}
                </span>

                {rfq.status === "OPEN" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    OPEN FOR QUOTATIONS
                  </span>
                )}
                {rfq.status === "DRAFT" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-600 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    DRAFT (UNSENT)
                  </span>
                )}
                {rfq.status === "CLOSED" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    CLOSED
                  </span>
                )}
                {rfq.status === "CANCELLED" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    CANCELLED
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">{rfq.title}</h1>
              {rfq.description && <p className="text-xs text-slate-600 mt-1 font-medium">{rfq.description}</p>}
            </div>

            {canManage && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {(rfq.status === "OPEN" || rfq.status === "CLOSED") && (
                  <Link
                    href={`/buyer/rfqs/${rfq.id}/compare`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Compare Quotations</span>
                  </Link>
                )}
                {rfq.status === "DRAFT" && (
                  <button
                    onClick={handleSendRfq}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2383E2] hover:bg-[#1D72C9] text-white font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Send RFQ to Vendors</span>
                  </button>
                )}

                {(rfq.status === "DRAFT" || rfq.status === "OPEN") && (
                  <button
                    onClick={handleCancelRfq}
                    disabled={submitting}
                    className="px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancel RFQ</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Details Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-bold text-[10px] uppercase mb-1">Quotation Deadline</span>
              <span className="font-semibold text-slate-950">{new Date(rfq.quotationDeadline).toLocaleDateString()}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-bold text-[10px] uppercase mb-1">Delivery Requirement</span>
              <span className="font-semibold text-slate-950">{rfq.deliveryRequirement || "Standard delivery terms"}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-bold text-[10px] uppercase mb-1">Associated PR</span>
              <Link href={`/buyer/purchase-requests/${rfq.purchaseRequest.id}`} className="font-semibold text-[#2383E2] hover:underline block truncate">
                {rfq.purchaseRequest.requestNumber} — {rfq.purchaseRequest.title}
              </Link>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-bold text-[10px] uppercase mb-1">Created Date</span>
              <span className="font-semibold text-slate-950">{new Date(rfq.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-extrabold text-slate-950 text-base mb-3">Line Items & Specifications</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Quantity & Unit</th>
                    <th className="py-3 px-4">Technical Specifications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rfq.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-950">
                        {item.name}
                        {item.description && <div className="text-[11px] font-normal text-slate-500">{item.description}</div>}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {item.quantity} {item.unit || "PCS"}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        {item.specifications || "Standard Specifications"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invited Vendors Section */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-extrabold text-slate-950 text-base mb-1">Invited Suppliers ({rfq.vendors.length})</h3>
            <p className="text-xs text-slate-500 mb-3">Vendors designated to participate in this sourcing RFQ.</p>

            {rfq.vendors.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs text-center">
                No vendors selected for this RFQ.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rfq.vendors.map((rv) => (
                  <div key={rv.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-950">{rv.vendor.name}</h4>
                      {rv.vendor.email && <div className="text-[11px] text-slate-500">{rv.vendor.email}</div>}
                    </div>
                    {rv.status === "SENT" ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                        SENT
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-600 text-[10px] font-bold">
                        PENDING SEND
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
