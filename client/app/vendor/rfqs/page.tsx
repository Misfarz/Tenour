"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import {
  FileCode,
  Loader2,
  LogOut,
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

  const handleLogout = () => {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorInfo");
    router.push("/vendor/login");
  };

  if (loading && rfqs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading Vendor Portal RFQs...</span>
        </div>
      </div>
    );
  }

  if (!vendorInfo) return null;

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Navbar */}
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
            <Link href="/vendor/rfqs" className="text-[#2383E2] font-semibold">Assigned RFQs</Link>
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

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">Requests for Quotations (RFQs)</h1>
          <p className="text-slate-500 text-xs mt-1">
            Review RFQs issued to {vendorInfo.name} by enterprise buyers.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Vendor RFQ Cards Grid */}
        {rfqs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
            <FileCode className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm mb-1">No Assigned RFQs</h3>
            <p className="text-xs text-slate-500">You currently have no active sourcing RFQs assigned to {vendorInfo.name}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rfqs.map((rfq) => (
              <div key={rfq.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono font-bold text-[#2383E2] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                      {rfq.rfqNumber}
                    </span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {rfq.status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-950 text-base mb-1">{rfq.title}</h3>

                  <div className="space-y-1 text-xs text-slate-600 mt-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Buyer: <strong className="text-slate-900">{rfq.buyer.name}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Quotation Deadline: <strong className="text-slate-900">{new Date(rfq.quotationDeadline).toLocaleDateString()}</strong></span>
                    </div>
                  </div>

                  {rfq.items.length > 0 && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Requirement Summary</span>
                      <div className="font-semibold text-slate-900">
                        {rfq.items[0].quantity} {rfq.items[0].unit || "PCS"} — {rfq.items[0].name}
                      </div>
                      {rfq.items[0].specifications && (
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                          Specs: {rfq.items[0].specifications}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <Link
                    href={`/vendor/rfqs/${rfq.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs shadow-sm transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
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
