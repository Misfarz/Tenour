"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import {
  ArrowLeft,
  Loader2,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  LogOut,
  FileCheck,
  ShieldCheck,
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

  const handleLogout = () => {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorInfo");
    router.push("/vendor/login");
  };

  const handleAcknowledgePo = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem("vendorToken");
      const res = await apiClient<any>(`/vendor/purchase-orders/${poId}/acknowledge`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.success) {
        setSuccess("Purchase Order acknowledged successfully.");
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
      setError("Rejection reason is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem("vendorToken");
      const res = await apiClient<any>(`/vendor/purchase-orders/${poId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rejectionReason: rejectionReason.trim() }),
      });
      if (res.success) {
        setSuccess("Purchase Order rejected successfully.");
        setRejectModalOpen(false);
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
        return "bg-blue-50 text-blue-700 border-blue-200 font-bold";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading Purchase Order details...</span>
        </div>
      </div>
    );
  }

  if (!vendorInfo || !po) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] p-10 flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Purchase Order Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">{error || "The requested Purchase Order could not be found."}</p>
        <Link href="/vendor/purchase-orders" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
          Back to Purchase Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/vendor/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-md bg-[#2383E2] flex items-center justify-center text-white font-black text-lg shadow-sm">
                V
              </div>
              <span className="font-extrabold text-xl text-slate-950 tracking-tight">Vendor Portal</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-bold text-[#2383E2]">{vendorInfo.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Subheader */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <Link
            href="/vendor/purchase-orders"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Purchase Orders</span>
          </Link>
          <span className="text-xs font-mono font-bold text-[#2383E2]">
            PO #: {po.poNumber}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Notifications */}
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

        {/* Status Banners */}
        {po.status === "ACKNOWLEDGED" && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              You acknowledged this Purchase Order on {new Date(po.acknowledgedAt!).toLocaleDateString()}. Order status is now <strong>ACKNOWLEDGED</strong>. Proceed to delivery fulfillment for Day 10.
            </span>
          </div>
        )}

        {po.status === "REJECTED" && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm mb-0.5">Purchase Order Rejected</span>
              <span>Your rejection reason: <strong>{po.rejectionReason}</strong></span>
            </div>
          </div>
        )}

        {/* Primary PO Card */}
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
              <p className="text-xs text-slate-500 mt-1">Issued by Buyer: <strong className="text-slate-900">{po.organization.name}</strong></p>
            </div>

            {/* Vendor Actions */}
            {po.status === "SENT" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAcknowledgePo}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Acknowledge PO</span>
                </button>

                <button
                  onClick={() => setRejectModalOpen(true)}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition cursor-pointer"
                >
                  <span>Reject PO</span>
                </button>
              </div>
            )}
          </div>

          {/* Key Terms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold text-[10px] uppercase block mb-1">Total Amount</span>
              <span className="text-lg font-black text-slate-950">₹{po.totalAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold text-[10px] uppercase block mb-1">Delivery Deadline</span>
              <span className="font-extrabold text-slate-950">
                {po.deliveryDeadline ? new Date(po.deliveryDeadline).toLocaleDateString() : "As per quotation"}
              </span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold text-[10px] uppercase block mb-1">Payment Terms</span>
              <span className="font-semibold text-slate-950">{po.paymentTerms || "Net 30"}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold text-[10px] uppercase block mb-1">Quotation Ref</span>
              <span className="font-mono font-bold text-[#2383E2]">{po.quotation?.quotationNumber}</span>
            </div>
          </div>

          {/* Delivery Address */}
          {po.deliveryAddress && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ship-To Address</span>
              <p className="font-semibold text-slate-900">{po.deliveryAddress}</p>
            </div>
          )}

          {/* Items Table */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-extrabold text-slate-950 text-base mb-3">Order Items & Agreed Unit Pricing</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Agreed Unit Price (₹)</th>
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

      {/* Vendor Rejection Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 flex flex-col gap-4">
            <h3 className="text-lg font-black text-slate-950 tracking-tight">Reject Purchase Order</h3>
            <p className="text-xs text-slate-600">
              Please state your reason for rejecting Purchase Order <strong>{po.poNumber}</strong> (e.g., stock unavailability, delivery deadline mismatch).
            </p>

            <textarea
              rows={3}
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-red-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleRejectPo}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
