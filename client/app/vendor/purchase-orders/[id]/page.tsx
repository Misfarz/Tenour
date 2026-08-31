"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { VendorNavbar } from "@/components/vendor-navbar";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  FileCheck,
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

interface VendorPurchaseOrderDetail {
  id: string;
  poNumber: string;
  quotationId: string;
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
  organization: {
    id: string;
    name: string;
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

export default function VendorPurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const poId = resolvedParams.id;

  const router = useRouter();
  const [vendorInfo, setVendorInfo] = useState<{ id: string; name: string } | null>(null);

  const [po, setPo] = useState<VendorPurchaseOrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPoDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("vendorToken");
      const res = await apiClient<VendorPurchaseOrderDetail>(`/vendor/purchase-orders/${poId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    const token = localStorage.getItem("vendorToken");
    const info = localStorage.getItem("vendorInfo");

    if (!token || !info) {
      router.push("/vendor/login");
    } else {
      try {
        setVendorInfo(JSON.parse(info));
        fetchPoDetail();
      } catch (err) {
        router.push("/vendor/login");
      }
    }
  }, [poId, router]);

  const handleAcknowledgePo = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem("vendorToken");
      const res = await apiClient(`/vendor/purchase-orders/${poId}/acknowledge`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.success) {
        setSuccess("Purchase Order successfully acknowledged.");
        fetchPoDetail();
      }
    } catch (err: any) {
      setError(err.message || "Failed to acknowledge Purchase Order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectPo = async () => {
    if (!rejectionReason.trim()) {
      setError("Please state a reason for rejecting the Purchase Order");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem("vendorToken");
      const res = await apiClient(`/vendor/purchase-orders/${poId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });

      if (res.success) {
        setRejectModalOpen(false);
        setSuccess("Purchase Order rejected.");
        fetchPoDetail();
      }
    } catch (err: any) {
      setError(err.message || "Failed to reject Purchase Order");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30 font-mono";
      case "ACKNOWLEDGED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono font-bold";
      case "REJECTED":
        return "bg-red-500/10 text-red-400 border-red-500/30 font-mono";
      case "CANCELLED":
        return "bg-neutral-800 text-neutral-500 border-neutral-700 font-mono";
      default:
        return "bg-[#282828] text-neutral-400 border-neutral-700/60 font-mono";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400 font-sans">Loading Purchase Order details...</span>
        </div>
      </div>
    );
  }

  if (!vendorInfo || !po) return null;

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Navbar */}
      <VendorNavbar activePath="/vendor/purchase-orders" />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Top Link */}
        <Link
          href="/vendor/purchase-orders"
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition self-start font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Purchase Orders</span>
        </Link>

        {/* Notifications */}
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

        {/* Action Header Card */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                {po.poNumber}
              </span>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(po.status)}`}>
                {po.status}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">{po.rfq?.title}</h1>
          </div>

          {po.status === "SENT" && (
            <div className="flex items-center gap-3 self-start sm:self-auto font-sans">
              <button
                onClick={() => setRejectModalOpen(true)}
                disabled={submitting}
                className="px-4 py-2.5 bg-[#242424] border border-red-500/30 hover:bg-red-950/40 text-red-400 rounded-full text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject Order</span>
              </button>

              <button
                onClick={handleAcknowledgePo}
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                <span>Acknowledge Order</span>
              </button>
            </div>
          )}
        </div>

        {/* PO Details Body Card */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 font-sans">
          {/* Top Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-sans">
            <div className="bg-[#141414] p-4 rounded-2xl border border-neutral-800">
              <span className="text-neutral-500 font-mono text-[10px] uppercase block mb-1">Enterprise Buyer</span>
              <span className="font-semibold text-white">{po.organization.name}</span>
            </div>
            <div className="bg-[#141414] p-4 rounded-2xl border border-neutral-800">
              <span className="text-neutral-500 font-mono text-[10px] uppercase block mb-1">Delivery Deadline</span>
              <span className="font-semibold text-neutral-200 font-mono">
                {po.deliveryDeadline ? new Date(po.deliveryDeadline).toLocaleDateString() : "As per quotation"}
              </span>
            </div>
            <div className="bg-[#141414] p-4 rounded-2xl border border-neutral-800">
              <span className="text-neutral-500 font-mono text-[10px] uppercase block mb-1">Payment Terms</span>
              <span className="font-semibold text-neutral-200">{po.paymentTerms || "Net 30"}</span>
            </div>
            <div className="bg-[#141414] p-4 rounded-2xl border border-neutral-800">
              <span className="text-neutral-500 font-mono text-[10px] uppercase block mb-1">Quotation Ref</span>
              <span className="font-mono font-bold text-blue-400">{po.quotation?.quotationNumber}</span>
            </div>
          </div>

          {/* Delivery Address */}
          {po.deliveryAddress && (
            <div className="p-4 rounded-2xl bg-[#141414] border border-neutral-800 text-xs font-sans">
              <span className="text-neutral-500 font-mono text-[10px] uppercase block mb-1">Ship-To Address</span>
              <p className="font-medium text-white">{po.deliveryAddress}</p>
            </div>
          )}

          {/* Items Table */}
          <div className="pt-4 border-t border-neutral-800/80 font-sans">
            <h3 className="font-serif text-xl font-normal text-white mb-3">Order Items & Agreed Unit Pricing</h3>
            <div className="border border-neutral-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#181818] border-b border-neutral-800 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                    <th className="py-3.5 px-4">Item Name</th>
                    <th className="py-3.5 px-4">Agreed Unit Price (₹)</th>
                    <th className="py-3.5 px-4">Quantity</th>
                    <th className="py-3.5 px-4">Discount (₹)</th>
                    <th className="py-3.5 px-4">Tax (₹)</th>
                    <th className="py-3.5 px-4 text-right">Line Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {po.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#242424]">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-300">
                        ₹{item.unitPrice.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-neutral-300">
                        {item.quantity} {item.unit || "PCS"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400">
                        - ₹{item.discount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-400">
                        + ₹{item.tax.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        ₹{item.totalPrice.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mt-4 p-4 rounded-2xl bg-[#141414] border border-neutral-800 flex items-center justify-between font-sans">
              <span className="font-mono text-neutral-400 text-xs uppercase">Total Agreed Purchase Order Value:</span>
              <span className="text-xl font-mono font-bold text-white">
                ₹{po.totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Vendor Rejection Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-sans">
          <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <h3 className="font-serif text-xl font-normal text-white">Reject Purchase Order</h3>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Please state your reason for rejecting Purchase Order <strong className="text-white font-mono">{po.poNumber}</strong> (e.g., stock unavailability, delivery deadline mismatch).
            </p>

            <textarea
              rows={3}
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500 transition font-sans"
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800 font-sans">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-5 py-2.5 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleRejectPo}
                disabled={submitting}
                className="px-6 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-md transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : null}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
