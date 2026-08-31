"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  ArrowLeft,
  Loader2,
  Building2,
  Calendar,
  Send,
  XCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Lock,
  FileCheck,
  AlertTriangle,
} from "lucide-react";

interface PoItem {
  id: string;
  name: string;
  description?: string | null;
  quantity: number;
  unit?: string | null;
  unitPrice: number;
  discount: number;
  tax: number;
  totalPrice: number;
}

interface PurchaseOrderDetail {
  id: string;
  poNumber: string;
  quotationId: string;
  vendorId: string;
  rfqId: string;
  status: string;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  deliveryAddress?: string | null;
  deliveryDeadline?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  rejectionReason?: string | null;
  cancelReason?: string | null;
  sentAt?: string | null;
  acknowledgedAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  vendor: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  rfq: {
    id: string;
    rfqNumber: string;
    title: string;
  };
  quotation: {
    id: string;
    quotationNumber: string;
  };
  items: PoItem[];
}

export default function BuyerPurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const poId = resolvedParams.id;

  const router = useRouter();
  const { user, role, isLoading: authLoading, isAuthenticated } = useAuth();

  const [po, setPo] = useState<PurchaseOrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPoDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<PurchaseOrderDetail>(`/purchase-orders/${poId}`);
      if (res.success && res.data) {
        setPo(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load Purchase Order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else if (role !== "ORG_ADMIN" && role !== "PROCUREMENT") {
        router.push("/buyer/dashboard");
      } else {
        fetchPoDetail();
      }
    }
  }, [authLoading, isAuthenticated, poId, role, router]);

  const handleSendPo = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await apiClient<any>(`/purchase-orders/${poId}/send`, {
        method: "POST",
      });
      if (res.success) {
        setSuccess("Purchase Order sent successfully to vendor.");
        fetchPoDetail();
      }
    } catch (err: any) {
      setError(err.message || "Failed to send Purchase Order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPo = async () => {
    if (!cancelReason.trim()) {
      setError("Cancellation reason is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await apiClient<any>(`/purchase-orders/${poId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ cancelReason: cancelReason.trim() }),
      });
      if (res.success) {
        setSuccess("Purchase Order cancelled successfully.");
        setCancelModalOpen(false);
        fetchPoDetail();
      }
    } catch (err: any) {
      setError(err.message || "Failed to cancel Purchase Order");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "SENT":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ACKNOWLEDGED":
        return "bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-500 border-gray-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading Purchase Order details...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !po) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] p-10 flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Purchase Order Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">{error || "The requested order does not exist or access is restricted."}</p>
        <Link href="/buyer/purchase-orders" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
          Back to Purchase Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Buyer Navbar */}
      <BuyerNavbar activePath="/buyer/purchase-orders" />

      {/* Subheader */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <Link
            href="/buyer/purchase-orders"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Purchase Orders</span>
          </Link>
          <span className="text-xs font-mono font-bold text-[#2383E2]">
            {po.poNumber}
          </span>
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
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Status Special Banners */}
        {po.status === "REJECTED" && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm mb-0.5">Purchase Order Rejected by Vendor</span>
              <span>Reason: <strong>{po.rejectionReason}</strong></span>
            </div>
          </div>
        )}

        {po.status === "CANCELLED" && (
          <div className="p-4 rounded-xl bg-gray-100 border border-gray-300 text-gray-800 text-xs flex items-start gap-3">
            <XCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm mb-0.5">Purchase Order Cancelled</span>
              <span>Reason: <strong>{po.cancelReason}</strong></span>
            </div>
          </div>
        )}

        {po.status === "ACKNOWLEDGED" && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              Vendor <strong>{po.vendor.name}</strong> acknowledged this Purchase Order on {new Date(po.acknowledgedAt!).toLocaleDateString()}. Ready for Day 10 Delivery & Receiving.
            </span>
          </div>
        )}

        {/* Header Action Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col gap-6">
          <div className="border-b border-slate-100 pb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono font-extrabold text-[#2383E2] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                  {po.poNumber}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  RFQ: {po.rfq?.rfqNumber}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(po.status)}`}>
                  {po.status}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">{po.rfq?.title}</h1>
              <p className="text-xs text-slate-500 mt-1">Vendor: <strong className="text-slate-900">{po.vendor.name}</strong> ({po.vendor.email || "N/A"})</p>
            </div>

            <div className="flex items-center gap-2">
              {po.status === "DRAFT" && (
                <>
                  <button
                    onClick={handleSendPo}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2383E2] hover:bg-[#1D72C9] text-white font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Send PO to Vendor</span>
                  </button>
                  <button
                    onClick={() => setCancelModalOpen(true)}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition cursor-pointer"
                  >
                    <span>Cancel Order</span>
                  </button>
                </>
              )}

              {po.status === "SENT" && (
                <button
                  onClick={() => setCancelModalOpen(true)}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition cursor-pointer"
                >
                  <span>Cancel Sent PO</span>
                </button>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold text-[10px] uppercase block mb-1">Total Order Value</span>
              <span className="text-lg font-black text-slate-950">₹{po.totalAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold text-[10px] uppercase block mb-1">Delivery Deadline</span>
              <span className="font-extrabold text-slate-950">
                {po.deliveryDeadline ? new Date(po.deliveryDeadline).toLocaleDateString() : "Not set"}
              </span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold text-[10px] uppercase block mb-1">Payment Terms</span>
              <span className="font-semibold text-slate-950">{po.paymentTerms || "Net 30"}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold text-[10px] uppercase block mb-1">Quotation Reference</span>
              <span className="font-mono font-bold text-[#2383E2]">{po.quotation?.quotationNumber}</span>
            </div>
          </div>

          {/* Delivery Address */}
          {po.deliveryAddress && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Delivery Address</span>
              <p className="font-semibold text-slate-900">{po.deliveryAddress}</p>
            </div>
          )}

          {/* Items Breakdown Table */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-extrabold text-slate-950 text-base mb-3">Itemized Commercial Snapshot</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Unit Price (₹)</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Discount (₹)</th>
                    <th className="py-3 px-4">Tax (₹)</th>
                    <th className="py-3 px-4 text-right">Line Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {po.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.name}
                        {item.description && <div className="text-[10px] text-slate-400 font-normal">{item.description}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        ₹{item.unitPrice.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {item.quantity} {item.unit || "PCS"}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 font-medium">
                        - ₹{item.discount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        + ₹{item.tax.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-950">
                        ₹{item.totalPrice.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-sans">
          <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <h3 className="font-serif text-xl font-normal text-white">Cancel Purchase Order</h3>
            <p className="text-xs text-neutral-400 font-sans">
              Please provide an official reason for cancelling Purchase Order <strong className="text-white font-mono">{po.poNumber}</strong>.
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Budget reallocation / Scope change..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500 transition font-sans"
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800 font-sans">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-5 py-2.5 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 text-xs font-medium transition cursor-pointer"
              >
                Keep Order
              </button>

              <button
                onClick={handleCancelPo}
                disabled={submitting}
                className="px-6 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-md transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : null}
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
