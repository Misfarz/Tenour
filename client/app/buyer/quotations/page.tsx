"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  FileText,
  Loader2,
  Eye,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  Filter,
  Layers,
} from "lucide-react";

interface BuyerQuotation {
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
  submittedAt?: string | null;
  createdAt: string;
  vendor: {
    id: string;
    name: string;
    email?: string | null;
  };
  rfq: {
    id: string;
    rfqNumber: string;
    title: string;
    status: string;
  };
}

export default function BuyerQuotationsDashboard() {
  const router = useRouter();
  const { user, role, isLoading: authLoading, isAuthenticated } = useAuth();

  const [quotations, setQuotations] = useState<BuyerQuotation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const fetchQuotations = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = selectedStatus === "ALL" ? "/quotations" : `/quotations?status=${selectedStatus}`;
      const res = await apiClient<BuyerQuotation[]>(endpoint);
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
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else if (role !== "ORG_ADMIN" && role !== "PROCUREMENT") {
        router.push("/buyer/dashboard");
      } else {
        fetchQuotations();
      }
    }
  }, [authLoading, isAuthenticated, role, router, selectedStatus]);

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

  if (authLoading || (loading && quotations.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading received quotations...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Buyer Header Navbar */}
      <BuyerNavbar activePath="/buyer/quotations" />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">Received Vendor Quotations</h1>
            <p className="text-slate-500 text-xs mt-1">
              Review and compare proposals submitted by vendors for your organization's RFQs.
            </p>
          </div>
          <Link
            href="/buyer/rfqs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition"
          >
            <span>View All RFQs</span>
          </Link>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {["ALL", "SUBMITTED", "SELECTED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-xl font-bold border transition cursor-pointer ${
                selectedStatus === status
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {status === "ALL" ? "All Quotations" : status}
            </button>
          ))}
        </div>

        {/* Quotation Cards Grid */}
        {quotations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm mb-1">No Received Quotations</h3>
            <p className="text-xs text-slate-500">No submitted vendor quotations were found for your organization.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quotations.map((q) => (
              <div
                key={q.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4 hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-extrabold text-[#2383E2] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                        {q.quotationNumber}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        RFQ: {q.rfq.rfqNumber}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(q.status)}`}>
                      {q.status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-950 text-base mb-1">{q.rfq.title}</h3>

                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Vendor: <strong className="text-slate-900">{q.vendor.name}</strong></span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Quoted Price</span>
                      <span className="text-lg font-black text-slate-950">
                        ₹{q.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    {q.deliveryDays && (
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Delivery</span>
                        <span className="text-xs font-bold text-slate-700">{q.deliveryDays} Days</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Submitted: {q.submittedAt ? new Date(q.submittedAt).toLocaleDateString() : new Date(q.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/buyer/rfqs/${q.rfqId}/compare`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#2383E2]" />
                      <span>Compare</span>
                    </Link>
                    <Link
                      href={`/buyer/quotations/${q.id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Detail</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
