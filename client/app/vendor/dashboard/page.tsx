"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Package,
  FileSpreadsheet,
  Receipt,
} from "lucide-react";

import { VendorNavbar } from "@/components/vendor-navbar";

export default function VendorDashboardPage() {
  const router = useRouter();
  const [vendorInfo, setVendorInfo] = useState<{ id: string; name: string; email?: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("vendorToken");
    const info = localStorage.getItem("vendorInfo");

    if (!token || !info) {
      router.push("/vendor/login");
    } else {
      try {
        setVendorInfo(JSON.parse(info));
      } catch (err) {
        router.push("/vendor/login");
      }
    }
  }, [router]);

  if (!vendorInfo) return null;

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Vendor Navigation Navbar */}
      <VendorNavbar activePath="/vendor/dashboard" />

      {/* Main Vendor Dashboard Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
        {/* Welcome Banner Container */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-extrabold uppercase tracking-widest mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Vendor Profile</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">
                Welcome, {vendorInfo.name}
              </h1>
              <p className="text-neutral-400 text-xs sm:text-sm mt-2 max-w-lg font-sans">
                Manage your incoming RFQs, submitted quotations, confirmed purchase orders, and commercial deliveries.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Modules Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          <Link href="/vendor/rfqs" className="bg-[#1e1e1e] border border-neutral-800/80 p-6 rounded-3xl shadow-xl hover:border-neutral-700 transition group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#282828] text-blue-400 flex items-center justify-center mb-4 border border-neutral-700/60 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-normal text-white group-hover:text-neutral-200 transition">Assigned RFQs</h3>
              <p className="text-xs text-neutral-400 mt-1 font-sans">View Sourcing RFQs</p>
            </div>
            <span className="mt-4 inline-block text-[11px] font-mono font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full w-fit">View RFQs →</span>
          </Link>

          <Link href="/vendor/quotations" className="bg-[#1e1e1e] border border-neutral-800/80 p-6 rounded-3xl shadow-xl hover:border-neutral-700 transition group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#282828] text-purple-400 flex items-center justify-center mb-4 border border-neutral-700/60 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-normal text-white group-hover:text-neutral-200 transition">Submitted Quotations</h3>
              <p className="text-xs text-neutral-400 mt-1 font-sans">Vendor Quotations</p>
            </div>
            <span className="mt-4 inline-block text-[11px] font-mono font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full w-fit">View Quotes →</span>
          </Link>

          <Link href="/vendor/purchase-orders" className="bg-[#1e1e1e] border border-neutral-800/80 p-6 rounded-3xl shadow-xl hover:border-neutral-700 transition group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#282828] text-amber-400 flex items-center justify-center mb-4 border border-neutral-700/60 group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-normal text-white group-hover:text-neutral-200 transition">Purchase Orders</h3>
              <p className="text-xs text-neutral-400 mt-1 font-sans">Confirmed POs</p>
            </div>
            <span className="mt-4 inline-block text-[11px] font-mono font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full w-fit">View Orders →</span>
          </Link>

          <div className="bg-[#1e1e1e] border border-neutral-800/80 p-6 rounded-3xl shadow-xl opacity-70 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#282828] text-emerald-400 flex items-center justify-center mb-4 border border-neutral-700/60">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-normal text-white">Invoices & Delivery</h3>
              <p className="text-xs text-neutral-400 mt-1 font-sans">3-Way Matching</p>
            </div>
            <span className="mt-4 inline-block text-[11px] font-mono text-neutral-400 bg-[#282828] border border-neutral-700/60 px-3 py-1 rounded-full w-fit">Automated</span>
          </div>
        </div>
      </main>
    </div>
  );
}
