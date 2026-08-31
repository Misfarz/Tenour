"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { VendorNavbar } from "@/components/vendor-navbar";
import {
  ArrowLeft,
  Loader2,
  Send,
  Info,
  Lock,
} from "lucide-react";

interface QuotationItem {
  id: string;
  rfqItemId: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  tax: number;
  totalPrice: number;
  notes?: string | null;
  rfqItem: {
    name: string;
    description?: string | null;
    quantity: number;
    unit?: string | null;
    specifications?: string | null;
  };
}

interface QuotationDetail {
  id: string;
  quotationNumber: string;
  rfqId: string;
  vendorId: string;
  status: string;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  deliveryDays?: number | null;
  paymentTerms?: string | null;
  warrantyTerms?: string | null;
  validUntil?: string | null;
  notes?: string | null;
  submittedAt?: string | null;
  createdAt: string;
  rfq: {
    id: string;
    rfqNumber: string;
    title: string;
    status: string;
  };
  items: QuotationItem[];
}

export default function VendorQuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const quotationId = resolvedParams.id;

  const router = useRouter();
  const [vendorInfo, setVendorInfo] = useState<{ id: string; name: string } | null>(null);

  const [quotation, setQuotation] = useState<QuotationDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotationDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("vendorToken");
      const res = await apiClient<QuotationDetail>(`/vendor/quotations/${quotationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.success && res.data) {
        setQuotation(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load quotation details");
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
        fetchQuotationDetail();
      } catch (err) {
        router.push("/vendor/login");
      }
    }
  }, [quotationId, router]);

  const handleSubmitDraft = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("vendorToken");
      const res = await apiClient(`/vendor/quotations/${quotationId}/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.success) {
        fetchQuotationDetail();
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit draft quotation");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-[#282828] text-neutral-400 border-neutral-700/60 font-mono";
      case "SUBMITTED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30 font-mono";
      case "SELECTED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono font-bold";
      case "REJECTED":
        return "bg-red-500/10 text-red-400 border-red-500/30 font-mono";
      default:
        return "bg-[#282828] text-neutral-400 border-neutral-700/60 font-mono";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400 font-sans">Loading quotation details...</span>
        </div>
      </div>
    );
  }

  if (!vendorInfo || !quotation) return null;

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Navbar */}
      <VendorNavbar activePath="/vendor/quotations" />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Top Link */}
        <Link
          href="/vendor/quotations"
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition self-start font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quotations List</span>
        </Link>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between font-sans">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Status Notification Banner */}
        {quotation.status !== "DRAFT" ? (
          <div className="p-4 sm:p-5 rounded-3xl bg-[#1e1e1e] border border-neutral-800 text-neutral-300 text-xs flex items-center gap-3 font-sans shadow-xl">
            <Lock className="w-4 h-4 text-neutral-500 flex-shrink-0" />
            <span>
              This quotation is in <strong className="text-white font-mono">{quotation.status}</strong> state and commercial pricing is immutable.
            </span>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-3xl bg-[#1e1e1e] border border-blue-500/30 text-neutral-300 text-xs flex items-center justify-between gap-4 font-sans shadow-xl">
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>This quotation is currently a <strong className="text-white font-mono">DRAFT</strong>. Submit it so the buyer can review your proposal.</span>
            </div>
            <button
              onClick={handleSubmitDraft}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs transition cursor-pointer shadow-md disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : <Send className="w-3.5 h-3.5 text-black" />}
              <span>Submit Now</span>
            </button>
          </div>
        )}

        {/* Quotation Header Card */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 font-sans">
          <div className="border-b border-neutral-800/80 pb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                  {quotation.quotationNumber}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  RFQ: {quotation.rfq.rfqNumber}
                </span>
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(quotation.status)}`}>
                  {quotation.status}
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">{quotation.rfq.title}</h1>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block">Grand Total</span>
              <span className="text-2xl sm:text-3xl font-mono font-bold text-white">₹{quotation.totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Terms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-sans">
            <div className="bg-[#141414] p-4 rounded-2xl border border-neutral-800">
              <span className="text-neutral-500 font-mono text-[10px] uppercase block mb-1">Delivery Timeline</span>
              <span className="font-semibold text-white">{quotation.deliveryDays ? `${quotation.deliveryDays} Days` : "Standard"}</span>
            </div>
            <div className="bg-[#141414] p-4 rounded-2xl border border-neutral-800">
              <span className="text-neutral-500 font-mono text-[10px] uppercase block mb-1">Payment Terms</span>
              <span className="font-semibold text-neutral-200">{quotation.paymentTerms || "Net 30"}</span>
            </div>
            <div className="bg-[#141414] p-4 rounded-2xl border border-neutral-800">
              <span className="text-neutral-500 font-mono text-[10px] uppercase block mb-1">Warranty Terms</span>
              <span className="font-semibold text-neutral-200">{quotation.warrantyTerms || "Standard Warranty"}</span>
            </div>
            <div className="bg-[#141414] p-4 rounded-2xl border border-neutral-800">
              <span className="text-neutral-500 font-mono text-[10px] uppercase block mb-1">Valid Until</span>
              <span className="font-semibold text-neutral-200 font-mono">
                {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>

          {/* Items Breakdown Table */}
          <div className="pt-6 border-t border-neutral-800/80 font-sans">
            <h3 className="font-serif text-xl font-normal text-white mb-3">Item Breakdown</h3>
            <div className="border border-neutral-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#181818] border-b border-neutral-800 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                    <th className="py-3.5 px-4">Item Name</th>
                    <th className="py-3.5 px-4">Unit Price (₹)</th>
                    <th className="py-3.5 px-4">Quantity</th>
                    <th className="py-3.5 px-4">Discount (₹)</th>
                    <th className="py-3.5 px-4">Tax (₹)</th>
                    <th className="py-3.5 px-4 text-right">Line Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {quotation.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#242424]">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {item.rfqItem?.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-300">
                        ₹{item.unitPrice.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-neutral-300">
                        {item.quantity} {item.rfqItem?.unit || "PCS"}
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
          </div>
        </div>
      </main>
    </div>
  );
}
