"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import {
  FileCode,
  ArrowLeft,
  Loader2,
  Calendar,
  Building2,
  Clock,
  Info,
} from "lucide-react";

interface VendorRfqItem {
  id: string;
  name: string;
  description?: string | null;
  quantity: number;
  unit?: string | null;
  specifications?: string | null;
}

interface VendorRfqDetail {
  id: string;
  rfqNumber: string;
  title: string;
  description?: string | null;
  status: string;
  quotationDeadline: string;
  deliveryRequirement?: string | null;
  createdAt: string;
  buyer: {
    id: string;
    name: string;
  };
  items: VendorRfqItem[];
}

export default function VendorRfqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const rfqId = resolvedParams.id;

  const router = useRouter();
  const [vendorInfo, setVendorInfo] = useState<{ id: string; name: string; email?: string } | null>(null);

  const [rfq, setRfq] = useState<VendorRfqDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRfqDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<VendorRfqDetail>(`/vendor/rfqs/${rfqId}`);
      if (res.success && res.data) {
        setRfq(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load RFQ specifications");
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
        fetchRfqDetail();
      } catch (err) {
        router.push("/vendor/login");
      }
    }
  }, [rfqId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading RFQ specifications...</span>
        </div>
      </div>
    );
  }

  if (!vendorInfo || !rfq) return null;

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/vendor/rfqs" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Assigned RFQs</span>
          </Link>
          <div className="text-xs font-bold text-[#2383E2]">{vendorInfo.name}</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Info Banner */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-[#2383E2] flex-shrink-0" />
            <span>
              This RFQ is issued by <strong>{rfq.buyer.name}</strong>. Submit your quotation and pricing terms before the deadline.
            </span>
          </div>
          {rfq.status === "OPEN" && (
            <Link
              href={`/vendor/quotations/new?rfqId=${rfq.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2383E2] hover:bg-[#1D72C9] text-white font-bold text-xs shadow-sm transition whitespace-nowrap"
            >
              <span>Create Quotation</span>
            </Link>
          )}
        </div>

        {/* RFQ Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col gap-6">
          <div className="border-b border-slate-100 pb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono font-extrabold text-[#2383E2] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                  {rfq.rfqNumber}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {rfq.status}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">{rfq.title}</h1>
              {rfq.description && <p className="text-xs text-slate-600 mt-1 font-medium">{rfq.description}</p>}
            </div>

            {rfq.status === "OPEN" && (
              <Link
                href={`/vendor/quotations/new?rfqId=${rfq.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2383E2] hover:bg-[#1D72C9] text-white font-bold text-xs shadow-md transition"
              >
                <span>Create Quotation</span>
              </Link>
            )}
          </div>

          {/* Details Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-bold text-[10px] uppercase mb-1">Enterprise Buyer</span>
              <span className="font-extrabold text-slate-950 text-sm">{rfq.buyer.name}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-bold text-[10px] uppercase mb-1">Quotation Deadline</span>
              <span className="font-semibold text-slate-950">{new Date(rfq.quotationDeadline).toLocaleDateString()}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-bold text-[10px] uppercase mb-1">Delivery Requirement</span>
              <span className="font-semibold text-slate-950">{rfq.deliveryRequirement || "Standard delivery"}</span>
            </div>
          </div>

          {/* Line Items & Specifications Section */}
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
                      <td className="py-3.5 px-4 font-bold text-slate-950">
                        {item.name}
                        {item.description && <div className="text-[11px] font-normal text-slate-500">{item.description}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {item.quantity} {item.unit || "PCS"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                        {item.specifications || "Standard Specs Required"}
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
