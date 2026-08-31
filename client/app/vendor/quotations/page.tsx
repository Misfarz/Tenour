"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import {
  FileText,
  Loader2,
  LogOut,
  Eye,
  Calendar,
  IndianRupee,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
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
      const token = localStorage.getItem("vendorToken");
      const endpoint = selectedStatus === "ALL"
        ? "/vendor/quotations"
        : `/vendor/quotations?status=${selectedStatus}`;
      const res = await apiClient<VendorQuotation[]>(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const handleLogout = () => {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorInfo");
    router.push("/vendor/login");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "SUBMITTED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "UNDER_REVIEW":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "SELECTED":
        return "bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";
      case "WITHDRAWN":
        return "bg-gray-100 text-gray-500 border-gray-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading && quotations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading your quotations...</span>
        </div>
      </div>
    );
  }

  if (!vendorInfo) return null;

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

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            <Link href="/vendor/dashboard" className="hover:text-slate-950 transition">Dashboard</Link>
            <Link href="/vendor/rfqs" className="hover:text-slate-950 transition">Assigned RFQs</Link>
            <Link href="/vendor/quotations" className="text-[#2383E2] font-semibold">Quotations</Link>
          </nav>

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

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Title Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">Submitted & Draft Quotations</h1>
            <p className="text-slate-500 text-xs mt-1">
              Manage your commercial proposals submitted to enterprise buyers.
            </p>
          </div>
          <Link
            href="/vendor/rfqs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2383E2] hover:bg-[#1D72C9] text-white font-bold text-xs shadow-sm transition"
          >
            <span>View Assigned RFQs</span>
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
          {["ALL", "DRAFT", "SUBMITTED", "SELECTED", "REJECTED", "WITHDRAWN"].map((status) => (
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

        {/* Quotations List */}
        {quotations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm mb-1">No Quotations Found</h3>
            <p className="text-xs text-slate-500">
              {selectedStatus === "ALL"
                ? "You have not created any quotations yet. Check your assigned RFQs to get started."
                : `No quotations found with status "${selectedStatus}".`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quotations.map((q) => (
              <div
                key={q.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4 hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
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

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Quotation Value</span>
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

                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Payment Terms:</span>
                      <span className="font-medium text-slate-800">{q.paymentTerms || "Standard"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Created Date:</span>
                      <span className="font-medium text-slate-800">{new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Link
                    href={`/vendor/quotations/${q.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
                  >
                    {q.status === "DRAFT" ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
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
