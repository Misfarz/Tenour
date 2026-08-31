"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { VendorNavbar } from "@/components/vendor-navbar";
import {
  FileCode,
  ArrowLeft,
  Loader2,
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
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400 font-sans">Loading RFQ specifications...</span>
        </div>
      </div>
    );
  }

  if (!vendorInfo || !rfq) return null;

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Header */}
      <VendorNavbar activePath="/vendor/rfqs" />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Top Link */}
        <Link
          href="/vendor/rfqs"
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition self-start font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assigned RFQs</span>
        </Link>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between font-sans">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Info Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#1e1e1e] border border-blue-500/30 text-xs text-neutral-300 flex items-center justify-between gap-4 font-sans shadow-xl">
          <div className="flex items-center gap-3">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>
              This RFQ is issued by <strong className="text-white">{rfq.buyer.name}</strong>. Submit your quotation and commercial proposal before the deadline.
            </span>
          </div>
          {rfq.status === "OPEN" && (
            <Link
              href={`/vendor/quotations/new?rfqId=${rfq.id}`}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-md transition whitespace-nowrap"
            >
              <span>Create Quotation</span>
            </Link>
          )}
        </div>

        {/* RFQ Card */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 font-sans">
          <div className="border-b border-neutral-800/80 pb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                  {rfq.rfqNumber}
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {rfq.status}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">{rfq.title}</h1>
              {rfq.description && <p className="text-xs text-neutral-400 mt-2 font-sans">{rfq.description}</p>}
            </div>

            {rfq.status === "OPEN" && (
              <Link
                href={`/vendor/quotations/new?rfqId=${rfq.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-md transition font-sans"
              >
                <span>Create Quotation</span>
              </Link>
            )}
          </div>

          {/* Details Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            <div className="bg-[#141414] p-4 rounded-2xl border border-neutral-800">
              <span className="text-neutral-500 block font-mono text-[10px] uppercase mb-1">Enterprise Buyer</span>
              <span className="font-semibold text-white text-sm">{rfq.buyer.name}</span>
            </div>

            <div className="bg-[#141414] p-4 rounded-2xl border border-neutral-800">
              <span className="text-neutral-500 block font-mono text-[10px] uppercase mb-1">Quotation Deadline</span>
              <span className="font-semibold text-neutral-200">{new Date(rfq.quotationDeadline).toLocaleDateString()}</span>
            </div>

            <div className="bg-[#141414] p-4 rounded-2xl border border-neutral-800">
              <span className="text-neutral-500 block font-mono text-[10px] uppercase mb-1">Delivery Requirement</span>
              <span className="font-semibold text-neutral-200">{rfq.deliveryRequirement || "Standard delivery"}</span>
            </div>
          </div>

          {/* Line Items & Specifications Section */}
          <div className="pt-6 border-t border-neutral-800/80 font-sans">
            <h3 className="font-serif text-xl font-normal text-white mb-3">Line Items & Specifications</h3>
            <div className="border border-neutral-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#181818] border-b border-neutral-800 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                    <th className="py-3.5 px-4">Item Name</th>
                    <th className="py-3.5 px-4">Quantity & Unit</th>
                    <th className="py-3.5 px-4">Technical Specifications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {rfq.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#242424]">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {item.name}
                        {item.description && <div className="text-[11px] font-normal text-neutral-400">{item.description}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-300 font-mono">
                        {item.quantity} {item.unit || "PCS"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-300">
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
