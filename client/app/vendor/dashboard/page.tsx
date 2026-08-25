"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  FileText,
  Clock,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Package,
  FileSpreadsheet,
  Receipt,
} from "lucide-react";

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

  const handleLogout = () => {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorInfo");
    router.push("/vendor/login");
  };

  if (!vendorInfo) return null;

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Vendor Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-md bg-slate-950 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
                N
              </div>
              <span className="font-extrabold text-xl text-slate-950 tracking-tight">Tenour</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              Vendor Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Vendor Dashboard Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
        {/* Welcome Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Vendor Account</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Welcome, {vendorInfo.name}
              </h1>
              <p className="text-slate-500 text-xs mt-2">
                Manage your incoming RFQs, submitted quotations, purchase orders, and deliveries.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Modules Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm opacity-80">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2383E2] flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-950">Pending RFQs</h3>
            <p className="text-xs text-slate-400 mt-1">Day 7 Sourcing module</p>
            <span className="mt-3 inline-block text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">0 Active</span>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm opacity-80">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-950">Submitted Quotations</h3>
            <p className="text-xs text-slate-400 mt-1">Vendor Quotations</p>
            <span className="mt-3 inline-block text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">0 Submitted</span>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm opacity-80">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-950">Purchase Orders</h3>
            <p className="text-xs text-slate-400 mt-1">Confirmed POs</p>
            <span className="mt-3 inline-block text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">0 Orders</span>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm opacity-80">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-950">Invoices & Delivery</h3>
            <p className="text-xs text-slate-400 mt-1">3-Way Matching</p>
            <span className="mt-3 inline-block text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">0 Invoices</span>
          </div>
        </div>

        {/* Vendor Identity Metadata */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Vendor Organization Context
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-slate-500 block mb-1">Vendor Company Name</span>
              <span className="font-semibold text-slate-950 text-sm">{vendorInfo.name}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-slate-500 block mb-1">Vendor ID</span>
              <span className="font-mono text-slate-600 text-xs truncate block">{vendorInfo.id}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
