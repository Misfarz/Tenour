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
  Users,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  LogOut,
  User as UserIcon,
  Loader2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function HomePage() {
  const { user, organization, isLoading, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"buyer" | "vendor">("buyer");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#071325] text-neutral-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#0065FF] animate-spin" />
          <p className="text-sm font-medium text-slate-300">Loading Tenour Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071325] text-slate-100 flex flex-col font-sans selection:bg-[#0052CC] selection:text-white">
      {/* Top Atlassian Jira-Style Navigation Bar */}
      <header className="border-b border-[#1E293B] bg-[#091E42]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Jira-style logo brand mark */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0052CC] via-[#0065FF] to-[#4C9AFF] flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#0052CC]/30 group-hover:scale-105 transition-transform">
                T
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-white tracking-tight">Tenour</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#0052CC]/20 text-[#4C9AFF] border border-[#0052CC]/30">
                    SaaS
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium leading-none">Procurement Cloud</span>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
              <a href="#portals" className="hover:text-white transition">Portals</a>
              <a href="#features" className="hover:text-white transition">Platform Solutions</a>
              <a href="#architecture" className="hover:text-white transition">Architecture</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={organization ? "/buyer/dashboard" : "/buyer/setup-organization"}
                  className="px-3.5 py-1.5 rounded-md bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold shadow-md shadow-[#0052CC]/20 transition flex items-center gap-1.5"
                >
                  <span>Dashboard</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-md bg-[#1E293B] hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/buyer/login"
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                >
                  Buyer Sign In
                </Link>
                <Link
                  href="/buyer/register"
                  className="px-3.5 py-1.5 rounded-md bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold shadow-md shadow-[#0052CC]/25 transition flex items-center gap-1"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* User Logged-in Notice Banner (If authenticated) */}
      {isAuthenticated && user && (
        <div className="bg-[#0052CC]/15 border-b border-[#0052CC]/30 py-2.5 px-4 text-center text-xs text-[#4C9AFF]">
          <span className="font-semibold">Logged in as {user.name} ({user.email})</span> — You are active in organization:{" "}
          <span className="font-bold text-white">{organization?.name || "Not setup"}</span>.{" "}
          <Link href="/buyer/dashboard" className="underline font-semibold ml-1 text-white hover:text-[#4C9AFF]">
            Go to Buyer Dashboard →
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Atlassian style radial backdrop glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#0052CC]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[250px] bg-[#00B8D9]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0052CC]/15 border border-[#0052CC]/30 text-[#4C9AFF] text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#00B8D9]" />
            <span>Jira-Inspired Enterprise Procurement Suite</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-3xl">
            Enterprise procurement, <br />
            <span className="bg-gradient-to-r from-[#4C9AFF] via-[#00B8D9] to-[#0052CC] bg-clip-text text-transparent">
              built with Jira agility.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
            Manage purchase requests, supplier quotations, multi-level approvals, and budget isolation in a unified, high-performance platform.
          </p>

          {/* Quick jump to portals */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#portals"
              className="px-6 py-3.5 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] text-white font-semibold text-sm shadow-xl shadow-[#0052CC]/30 transition flex items-center gap-2"
            >
              <span>Explore Access Portals</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#features"
              className="px-6 py-3.5 rounded-lg bg-[#172B4D] hover:bg-slate-800 text-slate-200 font-medium text-sm border border-slate-700 transition"
            >
              View Features
            </a>
          </div>
        </div>
      </section>

      {/* Main Portals Section (Buyer & Vendor Portals) */}
      <section id="portals" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Select Your Access Portal
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            Choose your gateway to enter Tenour's buyer workspace or supplier collaboration network.
          </p>
        </div>

        {/* Portals Toggle / Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Buyer Portal Card */}
          <div className="bg-[#091E42] border border-[#0052CC]/40 rounded-2xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between hover:border-[#0052CC] transition-all group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#0052CC]/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#0052CC]/20 border border-[#0052CC]/40 flex items-center justify-center text-[#4C9AFF] shadow-inner">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#0052CC]/20 text-[#4C9AFF] border border-[#0052CC]/30">
                  Buyer Workspace
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight mb-2">
                Buyer Portal
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                For corporate procurement officers, department managers, and finance administrators to manage purchase requests, approval chains, and organization settings.
              </p>

              <div className="space-y-2.5 mb-8 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00B8D9]" />
                  <span>Organization & Team Management (ORG_ADMIN)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00B8D9]" />
                  <span>Purchase Requests & Budget Multi-tenancy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00B8D9]" />
                  <span>Role-Based Access Control (RBAC)</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
              <Link
                href="/buyer/login"
                className="flex-1 py-3 px-4 bg-[#0052CC] hover:bg-[#0747A6] text-white font-semibold text-xs rounded-lg shadow-md shadow-[#0052CC]/25 transition flex items-center justify-center gap-2"
              >
                <span>Buyer Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/buyer/register"
                className="flex-1 py-3 px-4 bg-[#172B4D] hover:bg-slate-800 text-slate-200 font-medium text-xs rounded-lg border border-slate-700 transition flex items-center justify-center"
              >
                Create Buyer Account
              </Link>
            </div>
          </div>

          {/* Vendor Portal Card (UI Only) */}
          <div className="bg-[#091E42] border border-[#00B8D9]/40 rounded-2xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between hover:border-[#00B8D9] transition-all group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#00B8D9]/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#00B8D9]/20 border border-[#00B8D9]/40 flex items-center justify-center text-[#00B8D9] shadow-inner">
                  <Store className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#00B8D9]/20 text-[#00B8D9] border border-[#00B8D9]/30">
                  Supplier Network
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight mb-2">
                Vendor Portal <span className="text-xs font-normal text-slate-400">(UI Preview)</span>
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                For registered suppliers and vendors to review RFQs, submit competitive quotations, track purchase orders, and manage invoice payments.
              </p>

              <div className="space-y-2.5 mb-8 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4C9AFF]" />
                  <span>RFQ Bidding & Quotation Submission</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4C9AFF]" />
                  <span>Purchase Order & Delivery Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4C9AFF]" />
                  <span>Invoice & Payment Status Dashboard</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => alert("Vendor Portal authentication will be integrated in Day 4/5. Please use Buyer Portal for current active features.")}
                className="flex-1 py-3 px-4 bg-[#008DA6] hover:bg-[#007A91] text-white font-semibold text-xs rounded-lg shadow-md shadow-[#008DA6]/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Vendor Login</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => alert("Vendor Registration portal preview mode.")}
                className="flex-1 py-3 px-4 bg-[#172B4D] hover:bg-slate-800 text-slate-200 font-medium text-xs rounded-lg border border-slate-700 transition flex items-center justify-center cursor-pointer"
              >
                Vendor Registration
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section (Jira / Atlassian Design System Cards) */}
      <section id="features" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#4C9AFF] mb-2 block">
            Core Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Designed for Enterprise Governance & Speed
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#091E42]/60 border border-slate-800 p-6 rounded-xl backdrop-blur-sm hover:border-[#0052CC]/50 transition">
            <div className="w-10 h-10 rounded-lg bg-[#0052CC]/15 flex items-center justify-center text-[#4C9AFF] mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Multi-Tenant Isolation</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Complete separation of organizations, members, and procurement data with zero cross-tenant data leakage.
            </p>
          </div>

          <div className="bg-[#091E42]/60 border border-slate-800 p-6 rounded-xl backdrop-blur-sm hover:border-[#0052CC]/50 transition">
            <div className="w-10 h-10 rounded-lg bg-[#00B8D9]/15 flex items-center justify-center text-[#00B8D9] mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Role-Based Access (RBAC)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Define ORG_ADMIN, Procurement Managers, Finance Approvers, and Employees with granular field permissions.
            </p>
          </div>

          <div className="bg-[#091E42]/60 border border-slate-800 p-6 rounded-xl backdrop-blur-sm hover:border-[#0052CC]/50 transition">
            <div className="w-10 h-10 rounded-lg bg-[#36B37E]/15 flex items-center justify-center text-[#36B37E] mb-4">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">RFQ & Quotation Matrix</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Compare supplier bids side-by-side, automate vendor selection, and issue verified purchase orders instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#1E293B] bg-[#071325] py-8 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0052CC] text-white font-bold flex items-center justify-center text-xs">
              T
            </div>
            <span className="font-semibold text-slate-200">Tenour Platform</span>
            <span>© 2026 Tenour SaaS</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <a href="#portals" className="hover:text-white transition">Buyer Portal</a>
            <a href="#portals" className="hover:text-white transition">Vendor Portal</a>
            <a href="#features" className="hover:text-white transition">System Architecture</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
