"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import {
  Building2,
  Store,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  LogOut,
  Loader2,
  ChevronRight,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

export default function HomePage() {
  const { user, organization, isLoading, isAuthenticated, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#2383E2] animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading Tenour Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Top Notion-Style Navigation Bar */}
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            {/* Notion style minimalist brand logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-md bg-slate-950 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
                N
              </div>
              <span className="font-extrabold text-xl text-slate-950 tracking-tight">
                Tenour
              </span>
            </Link>

            {/* Notion style dropdown links */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-1 hover:text-slate-950 transition cursor-pointer">
                <span>Product</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="flex items-center gap-1 hover:text-slate-950 transition cursor-pointer">
                <span>Solutions</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <a href="#portals" className="hover:text-slate-950 transition">
                Portals
              </a>
              <a href="#features" className="hover:text-slate-950 transition">
                Enterprise
              </a>
              <a href="#pricing" className="hover:text-slate-950 transition">
                Pricing
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={organization ? "/buyer/dashboard" : "/buyer/setup-organization"}
                  className="px-4 py-2 rounded-lg bg-[#2383E2] hover:bg-[#1D72C9] text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                >
                  <span>Go to Dashboard</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/buyer/login"
                  className="text-sm font-medium text-slate-700 hover:text-slate-950 transition px-2 py-1"
                >
                  Log in
                </Link>
                <Link
                  href="/buyer/register"
                  className="px-4 py-2 rounded-lg bg-[#2383E2] hover:bg-[#1D72C9] text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                >
                  <span>Get Tenour free</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logged in notification bar */}
      {isAuthenticated && user && (
        <div className="bg-[#EDF5FF] border-b border-[#D0E4FF] py-2 px-4 text-center text-xs text-[#1D72C9]">
          <span className="font-semibold">Active Session: {user.name} ({user.email})</span> — Organization:{" "}
          <span className="font-bold text-slate-900">{organization?.name || "Not configured"}</span>.{" "}
          <Link href="/buyer/dashboard" className="underline font-bold ml-1 text-[#2383E2] hover:text-[#1D72C9]">
            Open Dashboard →
          </Link>
        </div>
      )}

      {/* Notion-Style Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Main Headline with highlighted text pill */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-950 tracking-tight leading-[1.08] max-w-4xl">
          Where teams and <br />
          suppliers{" "}
          <span className="inline-flex items-center gap-2 px-5 py-1 rounded-full bg-[#FFEDD5] text-slate-950 font-bold border border-[#FDBA74]">
            <span className="w-3 h-3 rounded-full bg-[#EA580C]" />
            Procure
          </span>{" "}
          together.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
          Capture context, manage purchase requests, and automate vendor quotations with software built for your team.
        </p>

        {/* Action Buttons (Notion style: Primary Blue + Soft Light Blue) */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/buyer/register"
            className="px-6 py-3.5 rounded-lg bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-sm shadow-md shadow-[#2383E2]/20 transition"
          >
            Get Tenour free
          </Link>
          <a
            href="#portals"
            className="px-6 py-3.5 rounded-lg bg-[#EDF5FF] hover:bg-[#E0F2FE] text-[#1D72C9] font-medium text-sm transition"
          >
            Request a demo
          </a>
        </div>

        {/* Social Proof Logos Bar (Exactly matching Notion hero bottom) */}
        <div className="mt-16 pt-8 border-t border-slate-100 w-full max-w-4xl">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-6">
            TRUSTED BY FORWARD-THINKING PROCUREMENT TEAMS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all font-bold text-slate-800 text-sm tracking-tight">
            <span>OpenAI</span>
            <span>Figma</span>
            <span>ramp ⚡</span>
            <span>CURSOR</span>
            <span>▲ Vercel</span>
            <span>NVIDIA</span>
            <span>VOLVO</span>
            <span>L'ORÉAL</span>
            <span>Discord</span>
          </div>
        </div>
      </section>

      {/* Access Portals Section (Buyer & Vendor Login UI) */}
      <section id="portals" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="px-3 py-1 rounded-full bg-[#EDF5FF] text-[#1D72C9] text-xs font-semibold mb-3 inline-block">
            Portal Gateway
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Select Your Access Portal
          </h2>
          <p className="text-slate-600 text-sm mt-2 max-w-xl mx-auto">
            Choose your login destination for buyers or vendor suppliers.
          </p>
        </div>

        {/* Dual Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Buyer Portal Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-[#2383E2]/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#EDF5FF] flex items-center justify-center text-[#2383E2]">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  Buyer Workspace
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-950 tracking-tight mb-2">
                Buyer Portal
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                For corporate buyers, department heads, and procurement admins to manage purchase requests, approval pipelines, and multi-tenant setup.
              </p>

              <div className="space-y-3 mb-8 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2383E2]" />
                  <span>Organization Setup & ORG_ADMIN Management</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2383E2]" />
                  <span>Purchase Requests & Multi-Tenant Isolation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2383E2]" />
                  <span>JWT Session & Cookie Authentication</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <Link
                href="/buyer/login"
                className="flex-1 py-3 px-4 bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2"
              >
                <span>Buyer Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/buyer/register"
                className="flex-1 py-3 px-4 bg-[#EDF5FF] hover:bg-[#E0F2FE] text-[#1D72C9] font-medium text-xs rounded-lg transition flex items-center justify-center"
              >
                Create Buyer Account
              </Link>
            </div>
          </div>

          {/* Vendor Portal Card (UI Only) */}
          <div className="bg-[#FAFBFD] border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-[#2383E2]/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
                  <Store className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  Supplier Network
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-950 tracking-tight mb-2">
                Vendor Portal <span className="text-xs font-medium text-slate-400">(UI Preview)</span>
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                For registered suppliers and vendors to view open RFQs, submit competitive quotations, track purchase orders, and manage invoices.
              </p>

              <div className="space-y-3 mb-8 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <span>RFQ Bidding & Quotation Submissions</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <span>Purchase Order & Delivery Status</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <span>Invoice & Payment Tracking Dashboard</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => alert("Vendor Portal authentication will be integrated in Day 4/5. Please use Buyer Portal for current active features.")}
                className="flex-1 py-3 px-4 bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Vendor Login</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => alert("Vendor Registration portal preview mode.")}
                className="flex-1 py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg transition flex items-center justify-center cursor-pointer"
              >
                Vendor Registration
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section (Notion Card Style Grid) */}
      <section id="features" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            Building Blocks for Modern Procurement
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Everything your team needs to run transparent, compliant procurement workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-[#EDF5FF] flex items-center justify-center text-[#2383E2] mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-950 mb-2">Multi-Tenancy Isolation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete organization partitioning so every company operates in their own secure environment.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-[#EDF5FF] flex items-center justify-center text-[#2383E2] mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-950 mb-2">Role-Based Access (RBAC)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Granular role assignment for ORG_ADMIN, Department Managers, Procurement Officers, and Finance.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-[#EDF5FF] flex items-center justify-center text-[#2383E2] mb-4">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-950 mb-2">RFQ & Vendor Bidding</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Collect competitive quotes from trusted suppliers and streamline purchase order approvals.
            </p>
          </div>
        </div>
      </section>

      {/* Notion-Style Clean Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-10 px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-slate-950 text-white font-bold flex items-center justify-center text-xs">
              N
            </div>
            <span className="font-semibold text-slate-900">Tenour Cloud</span>
            <span>© 2026 Tenour, Inc.</span>
          </div>
          <div className="flex items-center gap-6 text-slate-600">
            <Link href="/buyer/login" className="hover:text-slate-950 transition">
              Buyer Portal
            </Link>
            <a href="#portals" className="hover:text-slate-950 transition">
              Vendor Portal
            </a>
            <a href="#features" className="hover:text-slate-950 transition">
              Security & Compliance
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
