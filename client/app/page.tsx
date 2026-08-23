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
  Search,
  User as UserIcon,
  HelpCircle,
  Truck,
  RotateCcw,
} from "lucide-react";

export default function HomePage() {
  const { user, organization, isLoading, isAuthenticated, logout } = useAuth();
  const [portalCategory, setPortalCategory] = useState<"all" | "buyer" | "vendor">("all");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#2383E2] animate-spin" />
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Loading Tenour Cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans tracking-tight selection:bg-slate-950 selection:text-white">
      {/* Top Minimal Announcement Bar */}
      <div className="bg-slate-950 text-white text-[11px] font-medium tracking-wide py-2 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 hover:text-slate-300 transition cursor-pointer">
              <Truck className="w-3.5 h-3.5" /> Fast Multi-Tenant Setup
            </span>
            <span className="hidden md:flex items-center gap-1.5 hover:text-slate-300 transition cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5" /> 100% Data Isolation
            </span>
          </div>
          <div className="flex items-center gap-6 text-slate-300">
            <span className="hover:text-white transition cursor-pointer">Documentation</span>
            <span className="hover:text-white transition cursor-pointer">API Status</span>
            <span className="flex items-center gap-1 hover:text-white transition cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5" /> Support
            </span>
          </div>
        </div>
      </div>

      {/* Main Clean Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-slate-950 flex items-center justify-center text-white font-extrabold text-lg tracking-tighter">
              T
            </div>
            <span className="font-extrabold text-2xl tracking-tighter text-slate-950 uppercase">
              TENOUR
            </span>
          </Link>

          {/* Search Input Bar (Matching Max Fashion screenshot) */}
          <div className="hidden md:flex flex-1 max-w-lg relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="What are you looking for? (e.g. Buyer Portal, RFQs, Organizations)"
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition"
            />
          </div>

          {/* User / Auth Actions */}
          <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <span className="hidden lg:inline text-slate-500 font-normal lowercase tracking-normal">
                  {user.email}
                </span>
                <Link
                  href={organization ? "/buyer/dashboard" : "/buyer/setup-organization"}
                  className="px-4 py-2.5 rounded bg-slate-950 hover:bg-slate-800 text-white transition flex items-center gap-1.5"
                >
                  <span>Dashboard</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-2.5 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/buyer/login"
                  className="px-4 py-2.5 border border-slate-300 hover:border-slate-950 text-slate-900 rounded transition"
                >
                  SIGN IN
                </Link>
                <Link
                  href="/buyer/register"
                  className="px-5 py-2.5 bg-[#2383E2] hover:bg-[#1D72C9] text-white rounded transition"
                >
                  REGISTER
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Minimal Category Sub-nav */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-center md:justify-start gap-8 h-12 text-xs font-medium text-slate-700 tracking-wide">
            <a href="#portals" className="hover:text-slate-950 transition font-semibold">
              BUYER PORTAL
            </a>
            <a href="#portals" className="hover:text-slate-950 transition font-semibold">
              VENDOR NETWORK
            </a>
            <a href="#features" className="hover:text-slate-950 transition">
              ORGANIZATION SETUP
            </a>
            <a href="#features" className="hover:text-slate-950 transition">
              RBAC ROLES
            </a>
            <a href="#features" className="hover:text-slate-950 transition">
              PRISMA SCHEMA
            </a>
          </div>
        </div>
      </header>

      {/* Logged in Notice Banner */}
      {isAuthenticated && user && (
        <div className="bg-[#EDF5FF] border-b border-[#C6E0FF] py-2 px-6 text-center text-xs font-medium text-[#1D72C9]">
          Active Account: <span className="font-bold text-slate-900">{user.name} ({user.email})</span> — Organization:{" "}
          <span className="font-bold text-slate-900">{organization?.name || "Not configured"}</span>.{" "}
          <Link href="/buyer/dashboard" className="underline font-bold text-[#2383E2] hover:text-[#1D72C9] ml-1">
            Open Dashboard →
          </Link>
        </div>
      )}

      {/* Hero Section with Minimalist Clean Typography */}
      <section className="py-16 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 bg-slate-100 text-slate-700 rounded mb-4">
          SAAS PROCUREMENT PLATFORM
        </span>

        {/* Main Minimalist Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-950 tracking-tight leading-tight max-w-4xl">
          Modern Procurement for Buyers and Suppliers.
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
          Manage purchase requests, organization permissions, and supplier quotation workflows in a unified clean workspace.
        </p>

        {/* Minimal Category Pills Filter (Matching screenshot 'Shop For: Women | Kids | Men') */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
            Filter Portals:
          </span>
          <button
            onClick={() => setPortalCategory("all")}
            className={`px-4 py-1.5 rounded text-xs font-semibold tracking-wide transition cursor-pointer ${
              portalCategory === "all"
                ? "bg-slate-950 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setPortalCategory("buyer")}
            className={`px-4 py-1.5 rounded text-xs font-semibold tracking-wide transition cursor-pointer ${
              portalCategory === "buyer"
                ? "bg-slate-950 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            BUYER PORTAL
          </button>
          <button
            onClick={() => setPortalCategory("vendor")}
            className={`px-4 py-1.5 rounded text-xs font-semibold tracking-wide transition cursor-pointer ${
              portalCategory === "vendor"
                ? "bg-slate-950 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            VENDOR NETWORK
          </button>
        </div>
      </section>

      {/* Portals Grid Section (Max Fashion / Minimal E-Commerce Product Card Aesthetic) */}
      <section id="portals" className="pb-20 px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Buyer Portal Card */}
          {(portalCategory === "all" || portalCategory === "buyer") && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2 py-0.5 bg-slate-950 text-white text-[10px] font-bold uppercase tracking-wider rounded">
                    ACTIVE
                  </span>
                  <span className="text-xs font-semibold text-slate-400">ORG_ADMIN</span>
                </div>

                <div className="w-10 h-10 rounded bg-[#EDF5FF] flex items-center justify-center text-[#2383E2] mb-4">
                  <Building2 className="w-5 h-5" />
                </div>

                <h3 className="text-xl font-bold text-slate-950 tracking-tight mb-2">
                  Buyer Workspace
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6 font-normal">
                  Corporate buyer workspace to create organizations, manage member roles, issue purchase requests, and handle multi-tenant isolation.
                </p>

                <div className="space-y-2 border-t border-slate-100 pt-4 mb-6 text-xs text-slate-700 font-medium">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Role Created</span>
                    <span className="font-semibold text-slate-900">ORG_ADMIN</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Isolation Mode</span>
                    <span className="font-semibold text-slate-900">Multi-Tenant</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Security</span>
                    <span className="font-semibold text-slate-900">JWT + Cookie</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <Link
                  href="/buyer/login"
                  className="flex-1 py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold uppercase tracking-wider rounded text-center transition"
                >
                  BUYER LOGIN
                </Link>
                <Link
                  href="/buyer/register"
                  className="flex-1 py-2.5 px-4 bg-[#EDF5FF] hover:bg-[#E0F2FE] text-[#1D72C9] text-xs font-semibold uppercase tracking-wider rounded text-center transition"
                >
                  REGISTER
                </Link>
              </div>
            </div>
          )}

          {/* Vendor Portal Card (UI Preview) */}
          {(portalCategory === "all" || portalCategory === "vendor") && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded">
                    PREVIEW
                  </span>
                  <span className="text-xs font-semibold text-slate-400">SUPPLIER</span>
                </div>

                <div className="w-10 h-10 rounded bg-sky-100 flex items-center justify-center text-sky-600 mb-4">
                  <Store className="w-5 h-5" />
                </div>

                <h3 className="text-xl font-bold text-slate-950 tracking-tight mb-2">
                  Vendor Network
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6 font-normal">
                  Dedicated portal for verified suppliers to respond to RFQs, submit binding quotations, and track purchase order fulfillment.
                </p>

                <div className="space-y-2 border-t border-slate-200 pt-4 mb-6 text-xs text-slate-700 font-medium">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">RFQ Submissions</span>
                    <span className="font-semibold text-slate-900">Quotations</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">PO Status</span>
                    <span className="font-semibold text-slate-900">Real-time</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Invoices</span>
                    <span className="font-semibold text-slate-900">Automated</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => alert("Vendor Portal authentication will be integrated in Day 4/5.")}
                  className="flex-1 py-2.5 px-4 bg-[#2383E2] hover:bg-[#1D72C9] text-white text-xs font-semibold uppercase tracking-wider rounded text-center transition cursor-pointer"
                >
                  VENDOR LOGIN
                </button>
                <button
                  onClick={() => alert("Vendor Registration portal preview mode.")}
                  className="flex-1 py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider rounded text-center transition cursor-pointer"
                >
                  REGISTER
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Clean Minimalist Feature Highlights */}
      <section id="features" className="py-16 bg-slate-50 border-t border-slate-200 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-950 tracking-tight uppercase">
              Architecture & Features
            </h2>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
              Day 2 Authentication & Multi-Tenancy Architecture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#2383E2] mb-2 block">
                01. DATABASE
              </span>
              <h3 className="text-sm font-bold text-slate-950 mb-2">Prisma & PostgreSQL</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Strict multi-tenant model mapping: Organization $\rightarrow$ OrganizationMember $\rightarrow$ User.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#2383E2] mb-2 block">
                02. SECURITY
              </span>
              <h3 className="text-sm font-bold text-slate-950 mb-2">JWT & Argon2 Hashing</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Secure access token generation, HttpOnly refresh cookies, and salted password hashing.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#2383E2] mb-2 block">
                03. WORKSPACE
              </span>
              <h3 className="text-sm font-bold text-slate-950 mb-2">Organization Setup</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Transactional organization creation assigning the initial user the ORG_ADMIN role.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (Matching Max Fashion clean footer) */}
      <footer className="bg-slate-950 text-white py-12 px-6 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-white text-slate-950 font-black flex items-center justify-center text-sm">
              T
            </div>
            <span className="font-extrabold tracking-tighter text-sm">TENOUR CLOUD</span>
          </div>

          <div className="flex items-center gap-8 text-slate-400 font-medium">
            <Link href="/buyer/login" className="hover:text-white transition">
              BUYER LOGIN
            </Link>
            <Link href="/buyer/register" className="hover:text-white transition">
              BUYER REGISTER
            </Link>
            <a href="#portals" className="hover:text-white transition">
              VENDOR NETWORK
            </a>
          </div>

          <span className="text-slate-500">© 2026 TENOUR PROCUREMENT platform</span>
        </div>
      </footer>
    </div>
  );
}
