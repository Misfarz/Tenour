"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { VendorNavbar } from "@/components/vendor-navbar";
import {
  FileCode,
  Loader2,
  Eye,
  Calendar,
  Building2,
} from "lucide-react";

interface VendorRfqItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string | null;
  specifications?: string | null;
}

interface VendorRfq {
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
  itemsCount: number;
  items: VendorRfqItem[];
}

export default function VendorRfqsPage() {
  const router = useRouter();
  const [vendorInfo, setVendorInfo] = useState<{ id: string; name: string; email?: string } | null>(null);

  const [rfqs, setRfqs] = useState<VendorRfq[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendorRfqs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<VendorRfq[]>("/vendor/rfqs");
      if (res.success && res.data) {
        setRfqs(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load vendor RFQs");
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
        fetchVendorRfqs();
      } catch (err) {
        router.push("/vendor/login");
      }
    }
  }, [router]);

  if (loading && rfqs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400">Loading Vendor Portal RFQs...</span>
        </div>
      </div>
    );
  }

  if (!vendorInfo) return null;

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Vendor Navigation Navbar */}
      <VendorNavbar activePath="/vendor/rfqs" />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Banner Container */}
        <div className="bg-[#1e1e1e] p-6 sm:p-8 rounded-3xl border border-neutral-800/80 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono font-extrabold uppercase tracking-widest mb-3">
            <FileCode className="w-3.5 h-3.5" />
            <span>Buyer RFQs</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">
            Requests for Quotations (RFQs)
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1.5 font-sans">
            Review RFQs issued to {vendorInfo.name} by enterprise buyers.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between font-sans">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Vendor RFQ Cards Grid */}
        {rfqs.length === 0 ? (
          <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-12 text-center text-neutral-400 shadow-2xl font-sans">
            <FileCode className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="font-serif text-lg text-white mb-1">No Assigned RFQs</h3>
            <p className="text-xs text-neutral-400">You currently have no active sourcing RFQs assigned to {vendorInfo.name}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
            {rfqs.map((rfq) => (
              <div key={rfq.id} className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-5 hover:border-neutral-700 transition">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                      {rfq.rfqNumber}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {rfq.status}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-normal text-white mb-2">{rfq.title}</h3>

                  <div className="space-y-1.5 text-xs text-neutral-400 mt-3 font-sans">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Buyer: <strong className="text-white">{rfq.buyer.name}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Quotation Deadline: <strong className="text-white">{new Date(rfq.quotationDeadline).toLocaleDateString()}</strong></span>
                    </div>
                  </div>

                  {rfq.items.length > 0 && (
                    <div className="mt-4 p-4 rounded-2xl bg-[#141414] border border-neutral-800 text-xs font-sans">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Requirement Summary</span>
                      <div className="font-semibold text-white">
                        {rfq.items[0].quantity} {rfq.items[0].unit || "PCS"} — {rfq.items[0].name}
                      </div>
                      {rfq.items[0].specifications && (
                        <div className="text-[11px] text-neutral-400 font-mono mt-1 truncate">
                          Specs: {rfq.items[0].specifications}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-end font-sans">
                  <Link
                    href={`/vendor/rfqs/${rfq.id}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition shadow-md"
                  >
                    <Eye className="w-3.5 h-3.5 text-black" />
                    <span>View RFQ</span>
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
