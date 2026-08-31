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
  Layers,
  FileText,
  CheckCircle2,
  XCircle,
  FileCheck,
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
  vendor: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  rfq: {
    id: string;
    rfqNumber: string;
    title: string;
    status: string;
  };
  items: QuotationItem[];
}

export default function BuyerQuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const quotationId = resolvedParams.id;

  const router = useRouter();
  const { user, role, isLoading: authLoading, isAuthenticated } = useAuth();

  const [quotation, setQuotation] = useState<QuotationDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotationDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<QuotationDetail>(`/quotations/${quotationId}`);
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
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else if (role !== "ORG_ADMIN" && role !== "PROCUREMENT") {
        router.push("/buyer/dashboard");
      } else {
        fetchQuotationDetail();
      }
    }
  }, [authLoading, isAuthenticated, quotationId, role, router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "UNDER_REVIEW":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "SELECTED":
        return "bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading quotation specification...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !quotation) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] p-10 flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Quotation Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">{error || "The requested quotation does not exist or access is restricted."}</p>
        <Link href="/buyer/quotations" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
          Back to Quotations
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Buyer Navbar */}
      <BuyerNavbar activePath="/buyer/quotations" />

      {/* Secondary Bar */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <Link href="/buyer/quotations" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Received Quotations</span>
          </Link>

          <Link
            href={`/buyer/rfqs/${quotation.rfqId}/compare`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2383E2] hover:bg-[#1D72C9] text-white font-bold text-xs shadow-sm transition"
          >
            <Layers className="w-4 h-4" />
            <span>Compare Side-by-Side</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Quotation Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col gap-6">
          <div className="border-b border-slate-100 pb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono font-extrabold text-[#2383E2] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                  {quotation.quotationNumber}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  RFQ: {quotation.rfq.rfqNumber}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(quotation.status)}`}>
                  {quotation.status}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">{quotation.rfq.title}</h1>
              <p className="text-xs text-slate-500 mt-1">Vendor: <strong className="text-slate-900">{quotation.vendor.name}</strong> ({quotation.vendor.email || "N/A"})</p>
            </div>

            <div className="text-right flex flex-col items-end gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Grand Total Amount</span>
                <span className="text-3xl font-black text-slate-950">₹{quotation.totalAmount.toLocaleString("en-IN")}</span>
              </div>
              {quotation.status === "SELECTED" && (
                <Link
                  href={`/buyer/purchase-orders/new?quotationId=${quotation.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2383E2] hover:bg-[#1D72C9] text-white font-extrabold text-xs shadow-sm transition"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Create Purchase Order</span>
                </Link>
              )}
            </div>
          </div>

          {/* Terms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold text-[10px] uppercase block mb-1">Delivery Timeline</span>
              <span className="font-extrabold text-slate-950">{quotation.deliveryDays ? `${quotation.deliveryDays} Days` : "Standard"}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold text-[10px] uppercase block mb-1">Payment Terms</span>
              <span className="font-semibold text-slate-950">{quotation.paymentTerms || "Net 30"}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold text-[10px] uppercase block mb-1">Warranty Terms</span>
              <span className="font-semibold text-slate-950">{quotation.warrantyTerms || "Standard Warranty"}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold text-[10px] uppercase block mb-1">Valid Until</span>
              <span className="font-semibold text-slate-950">
                {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>

          {/* Items Breakdown Table */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-extrabold text-slate-950 text-base mb-3">Itemized Proposal Breakdown</h3>
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
                  {quotation.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.rfqItem?.name}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        ₹{item.unitPrice.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {item.quantity} {item.rfqItem?.unit || "PCS"}
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
    </div>
  );
}
