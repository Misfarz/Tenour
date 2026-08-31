"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { VendorNavbar } from "@/components/vendor-navbar";
import {
  FileText,
  Loader2,
  Eye,
  Edit3,
} from "lucide-react";

interface VendorQuotationItem {
  id: string;
  rfqItemId: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  tax: number;
  totalPrice: number;
}

interface VendorQuotation {
  id: string;
  quotationNumber: string;
  rfqId: string;
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
  submittedAt?: string | null;
  createdAt: string;
  rfq: {
    id: string;
    rfqNumber: string;
    title: string;
    status: string;
    quotationDeadline: string;
  };
  items: VendorQuotationItem[];
}

export default function VendorQuotationsPage() {
  const router = useRouter();
  const [vendorInfo, setVendorInfo] = useState<{ id: string; name: string; email?: string } | null>(null);

  const [quotations, setQuotations] = useState<VendorQuotation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const fetchQuotations = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = selectedStatus === "ALL"
        ? "/vendor/quotations"
        : `/vendor/quotations?status=${selectedStatus}`;
      const res = await apiClient<VendorQuotation[]>(endpoint);
      if (res.success && res.data) {
        setQuotations(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load quotations");
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
        fetchQuotations();
      } catch (err) {
        router.push("/vendor/login");
      }
    }
  }, [router, selectedStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-[#282828] text-neutral-400 border-neutral-700/60 font-mono";
      case "SUBMITTED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30 font-mono";
      case "UNDER_REVIEW":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono";
      case "SELECTED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono font-bold";
      case "REJECTED":
        return "bg-red-500/10 text-red-400 border-red-500/30 font-mono";
      case "WITHDRAWN":
        return "bg-neutral-800 text-neutral-500 border-neutral-700 font-mono";
      default:
        return "bg-[#282828] text-neutral-400 border-neutral-700/60 font-mono";
    }
  };

  if (loading && quotations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400">Loading your quotations...</span>
        </div>
      </div>
    );
  }

  if (!vendorInfo) return null;

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Vendor Navigation Navbar */}
      <VendorNavbar activePath="/vendor/quotations" />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Title Header Banner */}
        <div className="bg-[#1e1e1e] p-6 sm:p-8 rounded-3xl border border-neutral-800/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-mono font-extrabold uppercase tracking-widest mb-3">
              <FileText className="w-3.5 h-3.5" />
              <span>Quotations Catalog</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">
              Submitted & Draft Quotations
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1.5 font-sans">
              Manage your commercial proposals submitted to enterprise buyers.
            </p>
          </div>
          <Link
            href="/vendor/rfqs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#242424] hover:bg-[#2e2e2e] border border-neutral-700/60 text-white font-semibold text-xs shadow-md transition font-sans"
          >
            <span>View Assigned RFQs</span>
          </Link>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between font-sans">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-sans">
          {["ALL", "DRAFT", "SUBMITTED", "SELECTED", "REJECTED", "WITHDRAWN"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-full font-medium transition cursor-pointer ${
                selectedStatus === status
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "bg-[#1e1e1e] text-neutral-400 border border-neutral-800 hover:text-white hover:bg-[#242424]"
              }`}
            >
              {status === "ALL" ? "All Quotations" : status}
            </button>
          ))}
        </div>

        {/* Quotations List */}
        {quotations.length === 0 ? (
          <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-12 text-center text-neutral-400 shadow-2xl font-sans">
            <FileText className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="font-serif text-lg text-white mb-1">No Quotations Found</h3>
            <p className="text-xs text-neutral-400">
              {selectedStatus === "ALL"
                ? "You have not created any quotations yet. Check your assigned RFQs to get started."
                : `No quotations found with status "${selectedStatus}".`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
            {quotations.map((q) => (
              <div
                key={q.id}
                className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-5 hover:border-neutral-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                        {q.quotationNumber}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        RFQ: {q.rfq.rfqNumber}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(q.status)}`}>
                      {q.status}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-normal text-white mb-2">{q.rfq.title}</h3>

                  <div className="p-4 rounded-2xl bg-[#141414] border border-neutral-800 flex items-center justify-between font-sans">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase block">Total Quotation Value</span>
                      <span className="text-lg font-mono font-bold text-white">
                        ₹{q.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    {q.deliveryDays && (
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase block">Delivery Time</span>
                        <span className="text-xs font-semibold text-neutral-300">{q.deliveryDays} Days</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-neutral-400 font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Payment Terms:</span>
                      <span className="font-medium text-neutral-300">{q.paymentTerms || "Standard"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Created Date:</span>
                      <span className="font-medium text-neutral-300">{new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-end gap-2 font-sans">
                  <Link
                    href={`/vendor/quotations/${q.id}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-md transition"
                  >
                    {q.status === "DRAFT" ? <Edit3 className="w-3.5 h-3.5 text-black" /> : <Eye className="w-3.5 h-3.5 text-black" />}
                    <span>{q.status === "DRAFT" ? "Edit Draft" : "View Details"}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
