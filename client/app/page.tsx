"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import {
  Building2,
  Store,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  LogOut,
  Loader2,
  X,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  const { user, organization, isLoading, isAuthenticated, logout } = useAuth();
  const [showPromo, setShowPromo] = useState(true);
  const [activePortalTab, setActivePortalTab] = useState<"buyer" | "vendor">("buyer");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-white animate-spin" />
          <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase font-mono">
            Loading Tenour Platform...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161616] text-white font-sans selection:bg-white selection:text-black">
      {/* Top Banner */}
      {showPromo && (
        <div className="bg-[#1c1c1c] border-b border-neutral-800/80 text-xs py-2 px-4 text-center relative flex items-center justify-center gap-2 text-neutral-300">
          <span>Get <strong>50% off</strong> enterprise setup plans. Use code at checkout:</span>
          <span className="bg-[#282828] text-white font-mono px-2 py-0.5 rounded-full font-bold border border-neutral-700 text-[11px]">
            TENOUR50
          </span>
          <button
            onClick={() => setShowPromo(false)}
            className="absolute right-4 text-neutral-400 hover:text-white transition cursor-pointer"
            aria-label="Close promo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Header */}
      <header className="px-6 md:px-10 h-20 flex items-center justify-between border-b border-neutral-800/60 bg-[#161616]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-10">
          {/* Minimal Text Logo */}
          <Link href="/" className="group flex items-center">
            <span className="text-xl md:text-2xl font-black tracking-[-0.06em] text-white font-sans group-hover:opacity-90 transition">
              Tenour<span className="text-amber-500 font-mono font-normal">.</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-neutral-300">
            <div className="flex items-center gap-1 hover:text-white transition cursor-pointer">
              <span>Meet Tenour</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            </div>
            <div className="flex items-center gap-1 hover:text-white transition cursor-pointer">
              <span>Platform</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            </div>
            <div className="flex items-center gap-1 hover:text-white transition cursor-pointer">
              <span>Solutions</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            </div>
            <div className="flex items-center gap-1 hover:text-white transition cursor-pointer">
              <span>Pricing</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            </div>
            <a href="#portals" className="hover:text-white transition">
              Workspaces
            </a>
          </nav>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5">
              <Link
                href={organization ? "/buyer/dashboard" : "/buyer/setup-organization"}
                className="px-5 py-2 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-sm transition"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="px-3.5 py-2 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 text-xs font-medium border border-neutral-700/60 transition cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/buyer/login"
                className="px-4 py-2 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-neutral-200 text-xs font-medium border border-neutral-700/60 transition"
              >
                Contact sales
              </Link>
              <Link
                href="/buyer/login"
                className="px-5 py-2 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-sm transition"
              >
                Try Tenour
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal text-white tracking-tight leading-[1.08] max-w-4xl">
          Question what’s next
        </h1>

        <p className="font-sans text-neutral-400 text-base sm:text-lg mt-4 max-w-2xl">
          Your thinking partner for enterprise sourcing, multi-stage approvals, and global supplier bidding.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link
            href="/buyer/login"
            className="px-7 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-md transition flex items-center gap-2"
          >
            <span>Try Tenour for Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/vendor/login"
            className="px-6 py-3.5 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-neutral-200 text-xs font-medium border border-neutral-700/60 transition"
          >
            Vendor Portal Sign In
          </Link>
        </div>

        {/* Editorial Photo Showcase */}
        <div className="relative rounded-3xl overflow-hidden border border-neutral-800/80 shadow-2xl max-w-5xl w-full my-14 aspect-[16/9] bg-[#1e1e1e]">
          <Image
            src="/claude_hero.jpg"
            alt="Tenour Sourcing Workspace"
            fill
            className="object-cover hover:scale-102 transition-transform duration-700"
            priority
          />
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full max-w-4xl my-8 border-y border-neutral-800/80 py-10">
          <div className="flex flex-col items-center">
            <span className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight">
              14M+
            </span>
            <span className="text-xs font-medium text-neutral-400 mt-2">
              Procurement Requests Served
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight">
              $36B+
            </span>
            <span className="text-xs font-medium text-neutral-400 mt-2">
              Earned by Verified Suppliers
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight">
              200+
            </span>
            <span className="text-xs font-medium text-neutral-400 mt-2">
              Countries & Enterprise Networks
            </span>
          </div>
        </div>

        {/* Feature Cards Grid (Claude.ai Aesthetic) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl text-left mt-8">
          {/* Card 1 */}
          <div className="bg-[#1e1e1e] border border-neutral-800/80 hover:border-neutral-700 p-7 rounded-3xl flex flex-col justify-between transition group">
            <div>
              <div className="w-9 h-9 rounded-2xl bg-[#282828] text-white flex items-center justify-center mb-5 border border-neutral-700/60">
                <Building2 className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="font-serif text-xl font-normal text-white mb-2.5 tracking-tight">
                Design your procurement with ease
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed mb-6">
                Create high-quality, professional purchase requisitions and competitive RFQs in minutes using our intuitive workflow engine.
              </p>
            </div>
            <Link
              href="/buyer/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-neutral-300 transition group-hover:translate-x-1"
            >
              <span>Explore Buyer Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-[#1e1e1e] border border-neutral-800/80 hover:border-neutral-700 p-7 rounded-3xl flex flex-col justify-between transition group">
            <div>
              <div className="w-9 h-9 rounded-2xl bg-[#282828] text-white flex items-center justify-center mb-5 border border-neutral-700/60">
                <Store className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="font-serif text-xl font-normal text-white mb-2.5 tracking-tight">
                Manage your entire vendor network
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed mb-6">
                All the tools you need to discover verified platform suppliers, manage private directories, evaluate quotations, and communicate seamlessly.
              </p>
            </div>
            <Link
              href="/vendor/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-neutral-300 transition group-hover:translate-x-1"
            >
              <span>Explore Vendor Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-[#1e1e1e] border border-neutral-800/80 hover:border-neutral-700 p-7 rounded-3xl flex flex-col justify-between transition group">
            <div>
              <div className="w-9 h-9 rounded-2xl bg-[#282828] text-white flex items-center justify-center mb-5 border border-neutral-700/60">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="font-serif text-xl font-normal text-white mb-2.5 tracking-tight">
                Get paid for commercial work
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed mb-6">
                Receive official binding POs, generate Goods Received Notes (GRN), and automate 3-way invoice matching directly on Tenour.
              </p>
            </div>
            <Link
              href="/vendor/register"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-neutral-300 transition group-hover:translate-x-1"
            >
              <span>Vendor Self-Registration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Workspaces Section */}
      <section id="portals" className="py-20 bg-[#161616] border-t border-neutral-800/60 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl">
            {/* Header & Tab Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-neutral-800 mb-8">
              <div>
                <span className="text-[11px] font-mono font-semibold tracking-widest text-amber-500 uppercase block mb-1">
                  / WORKSPACE PORTALS
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-white tracking-tight">
                  Access Tenour Workspaces
                </h2>
              </div>

              <div className="inline-flex p-1 rounded-full bg-[#282828] border border-neutral-700/60 text-xs font-medium">
                <button
                  onClick={() => setActivePortalTab("buyer")}
                  className={`px-5 py-2 rounded-full transition cursor-pointer ${activePortalTab === "buyer"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                    }`}
                >
                  01 — BUYER
                </button>
                <button
                  onClick={() => setActivePortalTab("vendor")}
                  className={`px-5 py-2 rounded-full transition cursor-pointer ${activePortalTab === "vendor"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                    }`}
                >
                  02 — VENDOR
                </button>
              </div>
            </div>

            {/* Display Area */}
            <div>
              {activePortalTab === "buyer" ? (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-2">
                    <div className="max-w-xl">
                      <span className="text-xs font-mono text-blue-400 tracking-widest uppercase block mb-2 font-semibold">
                        / BUYER PROCUREMENT WORKSPACE
                      </span>
                      <h3 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight leading-tight">
                        Enterprise Sourcing & Approvals
                      </h3>
                      <p className="text-neutral-400 text-xs sm:text-sm mt-3 leading-relaxed max-w-lg">
                        Designed for procurement leaders to manage multi-tiered Purchase Request approvals, issue competitive RFQs to verified suppliers, and automate bid evaluations.
                      </p>
                    </div>

                    <div className="shrink-0">
                      <Link
                        href="/buyer/login"
                        className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-md transition group"
                      >
                        <span>Enter Buyer Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-2">
                    <div className="max-w-xl">
                      <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase block mb-2 font-semibold">
                        02 / SUPPLIER & VENDOR WORKSPACE
                      </span>
                      <h3 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight leading-tight">
                        Commercial Bidding & Order Fulfillment
                      </h3>
                      <p className="text-neutral-400 text-xs sm:text-sm mt-3 leading-relaxed max-w-lg">
                        Built for verified suppliers and commercial vendors to receive RFQs directly from enterprise buyers, submit quotations, and fulfill confirmed Purchase Orders.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                      <Link
                        href="/vendor/login"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-md transition group"
                      >
                        <span>Vendor Login</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link
                        href="/vendor/register"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#282828] hover:bg-[#323232] text-emerald-400 border border-neutral-700/60 text-xs font-medium transition"
                      >
                        <span>Self Register</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Our Clients & Enterprise Brands Section */}
      <section className="py-16 bg-[#161616] border-t border-neutral-800/60 px-6">
        <div className="max-w-5xl p-10 mx-auto text-center">
          <span className="text-[11px] font-mono font-medium tracking-widest text-neutral-400 uppercase block mb-10">
            TRUSTED BY GLOBAL INDUSTRY LEADERS & ENTERPRISE PROCUREMENT TEAMS
          </span>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {/* Dell Logo SVG */}
            <div className="text-neutral-400 hover:text-white transition opacity-70 hover:opacity-100 flex items-center justify-center cursor-pointer" title="Dell Technologies">
              <svg className="h-5 md:h-6 w-auto fill-current" viewBox="0 0 110 32">
                <path d="M12.8 3.2C6.4 3.2 1.2 8.4 1.2 14.8s5.2 11.6 11.6 11.6c6.4 0 11.6-5.2 11.6-11.6S19.2 3.2 12.8 3.2zm0 18.8c-4 0-7.2-3.2-7.2-7.2s3.2-7.2 7.2-7.2 7.2 3.2 7.2 7.2-3.2 7.2-7.2 7.2zM28.4 3.6h5.2v22.4h-5.2V3.6zm9.2 0h5.2v22.4h-5.2V3.6zM46.8 3.6h14.4v4.4h-9.2v4.4h8V16.8h-8v5.6h9.6v4.4H46.8V3.6z" />
              </svg>
            </div>

            {/* Lenovo Logo SVG */}
            <div className="text-neutral-400 hover:text-white transition opacity-70 hover:opacity-100 flex items-center justify-center cursor-pointer" title="Lenovo Global">
              <svg className="h-5 md:h-6 w-auto fill-current" viewBox="0 0 120 32">
                <path d="M4 4h7.2v18.4H24v4.8H4V4zm25.6 11.6c0-6.4 4.8-12 11.6-12 6.4 0 11.2 4.8 11.2 11.6v1.6H34.8c.4 3.6 3.2 6.4 6.8 6.4 2.8 0 4.8-1.2 6-3.2h5.6c-1.6 4.8-6 8-11.6 8-7.2 0-12-5.2-12-12.4zm17.2-2.4c-.4-3.2-3.2-5.6-6-5.6-3.2 0-5.6 2.4-6 5.6h12zM58 8.8h5.2v3.2c1.6-2.4 4.4-3.6 7.6-3.6 5.6 0 9.2 4 9.2 10.4V27.2H74.8V19.2c0-3.6-2-5.6-4.8-5.6-3.2 0-5.2 2.4-5.2 6v7.6H58V8.8zM85.2 18c0-5.6 4.4-9.6 10.4-9.6 6 0 10.4 4 10.4 9.6 0 5.6-4.4 9.6-10.4 9.6-6 0-10.4-4-10.4-9.6zm15.6 0c0-3.2-2.4-5.2-5.2-5.2-3.2 0-5.2 2-5.2 5.2 0 3.2 2 5.2 5.2 5.2 2.8 0 5.2-2 5.2-5.2z" />
              </svg>
            </div>

            {/* 7-Eleven Logo SVG */}
            <div className="text-neutral-400 hover:text-white transition opacity-70 hover:opacity-100 flex items-center justify-center cursor-pointer" title="7-Eleven Retail">
              <svg className="h-6 md:h-7 w-auto fill-current" viewBox="0 0 100 32">
                <path d="M8 4h18.4L18 27.2h-6L20 9.6H8V4zm22.4 0H42v23.2h-5.6V9.6h-6V4zm16 0h12v4.8h-6.4v4.4h5.6v4.8h-5.6v4.4h6.8v4.8h-12.4V4zm16 0h5.6l5.2 14.8L78.4 4H84v23.2h-5.2V12.4L73.2 27.2h-4.8L63.2 12.4v14.8h-5.2V4z" />
              </svg>
            </div>

            {/* HP Logo SVG */}
            <div className="text-neutral-400 hover:text-white transition opacity-70 hover:opacity-100 flex items-center justify-center cursor-pointer" title="HP Enterprise">
              <svg className="h-6 md:h-7 w-auto fill-current" viewBox="0 0 70 32">
                <circle cx="28" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <path d="M21 9l-4 14h3.5l1.8-6.3h4.2l-1.8 6.3H32L36 9h-3.5l-1.8 6.3h-4.2L28.3 9H21zm14 0l-4 14h3.5l1.8-6.3h3.2c3 0 5.2-1.8 5.2-4.5 0-2.2-1.8-3.2-4.5-3.2H35zm4.2 2.5h1.8c1.6 0 2.5.6 2.5 1.8 0 1.2-.8 2-2.5 2h-1.8l1.2-3.8z" />
              </svg>
            </div>

            {/* Siemens Logo SVG */}
            <div className="text-neutral-400 hover:text-white transition opacity-70 hover:opacity-100 flex items-center justify-center cursor-pointer" title="Siemens Logistics">
              <svg className="h-4.5 md:h-5 w-auto fill-current" viewBox="0 0 120 28">
                <path d="M4 18.8c2.4 2.8 6 4.4 9.6 4.4 4.4 0 7.2-2.4 7.2-5.6 0-3.6-3.2-4.8-7.6-6-4.8-1.2-9.6-3.2-9.6-8.8C3.6 7.2 8 3.2 14.4 3.2c4.4 0 8 1.6 10.4 4.4l-3.6 3.6c-2-2.4-4.8-3.6-7.2-3.6-3.6 0-5.6 1.8-5.6 4 0 3.2 3.2 4.4 7.2 5.6 5.2 1.2 10 3.2 10 9.2 0 6-4.8 9.6-11.6 9.6-4.8 0-9.6-2-12.8-5.2l3.6-4zm24-14.8h5.2v21.6H28V4zm11.2 0h14.4v4.4h-9.2v4.4h8v4.4h-8v4.4h9.6v4.4H39.2V4zm28 0h5.2l4.8 14 4.8-14h5.2v21.6H82V12.4l-4.4 13.2h-3.6L69.6 12.4v13.2h-5.2V4zm28 0h14.4v4.4h-9.2v4.4h8v4.4h-8v4.4h9.6v4.4H95.2V4z" />
              </svg>
            </div>

            {/* Schneider Electric Logo SVG */}
            <div className="text-neutral-400 hover:text-white transition opacity-70 hover:opacity-100 flex items-center justify-center cursor-pointer" title="Schneider Electric">
              <svg className="h-5 md:h-6 w-auto fill-current" viewBox="0 0 140 30">
                <path d="M4 18.8c2.4 2.8 5.6 4.4 9.2 4.4 4 0 6.4-2.4 6.4-5.2 0-3.2-3.2-4.4-6.8-5.6C8 11.2 4 9.2 4 5.2 4 2 7.6 0 12.8 0c4 0 7.6 1.6 9.6 4.4l-3.2 3.2C17.6 5.6 15.2 4.4 13 4.4c-2.8 0-4.4 1.2-4.4 2.8 0 2.4 2.8 3.6 6 4.4 5.2 1.2 9.2 3.2 9.2 8C23.8 24 19.6 26.4 13 26.4c-4.4 0-8.8-1.6-11.6-4.8L4 18.8zm23.6-14h4.4v8.8h6.8V4.8H43v20.8h-4.4v-8.4h-6.8v8.4h-4.4V4.8zm20.8 12c0-5.2 4-9.2 9.6-9.2 5.6 0 9.6 4 9.6 9.2 0 5.2-4 9.2-9.6 9.2-5.6 0-9.6-4-9.6-9.2zm14.8 0c0-3.2-2.4-5.6-5.2-5.6-3.2 0-5.2 2.4-5.2 5.6 0 3.2 2 5.6 5.2 5.6 2.8 0 5.2-2.4 5.2-5.6zm10-12H78v20.8h-4.4V4.8zm7.6 0h4.4v20.8h-4.4V4.8zm8.8 0h12v3.6h-7.6v4.8h6.8v3.6h-6.8v5.2h8V25.6H94.4V4.8zm16 0h8.4c3.6 0 6 2 6 5.2 0 2.4-1.6 4.4-4 4.8l4.4 10.8h-4.8l-4-9.6h-1.6v9.6h-4.4V4.8zm4.4 8h3.6c1.6 0 2.8-1 2.8-2.4s-1.2-2-2.8-2h-3.6v4.4z" />
              </svg>
            </div>

            {/* Intel Logo SVG */}
            <div className="text-neutral-400 hover:text-white transition opacity-70 hover:opacity-100 flex items-center justify-center cursor-pointer" title="Intel Sourcing">
              <svg className="h-5 md:h-6 w-auto fill-current" viewBox="0 0 90 32">
                <path d="M4 10h5.2v16H4V10zm2.6-8c1.8 0 3.2 1.4 3.2 3.2S8.4 8.4 6.6 8.4C4.8 8.4 3.4 7 3.4 5.2 3.4 3.4 4.8 2 6.6 2zM13.2 10h5.2v2.8c1.6-2 4.4-3.2 7.2-3.2 5.6 0 9.2 4 9.2 10v6.4h-5.2V19.6c0-3.6-2-5.6-4.8-5.6-3.2 0-5.2 2.4-5.2 6v6h-5.2V10zm26.8 0h4.8v3.2h-4.8V20c0 2.4 1.2 3.2 3.2 3.2h1.6V26h-2.8c-4.4 0-6.8-2.4-6.8-6.8V13.2h-3.2V10h3.2V5.2h4.8V10zm11.2 8c0-5.2 4-9.6 9.6-9.6 5.6 0 9.2 4 9.2 9.6v1.6H56.4c.4 3.2 2.8 5.6 6 5.6 2.4 0 4.4-1.2 5.2-2.8h5.2c-1.6 4.4-5.6 7.2-10.4 7.2-6 0-11.2-4.4-11.2-11.6zm13.6-2c-.4-2.8-2.4-4.8-5.2-4.8-2.8 0-4.8 2-5.2 4.8h10.4zm10.8-16h5.2v26h-5.2V0z" />
              </svg>
            </div>

            {/* Cisco Logo SVG */}
            <div className="text-neutral-400 hover:text-white transition opacity-70 hover:opacity-100 flex items-center justify-center cursor-pointer" title="Cisco Systems">
              <svg className="h-5 md:h-6 w-auto fill-current" viewBox="0 0 100 32">
                <path d="M12 4h4v8h-4V4zm16-2h4v10h-4V2zm16 4h4v6h-4V6zm16-4h4v10h-4V2zm16 4h4v6h-4V6zM4 19.6c2.4-2.8 6-4.4 9.6-4.4 5.6 0 9.2 3.6 9.2 8.4 0 4.8-3.6 8.4-9.2 8.4-3.6 0-7.2-1.6-9.6-4.4l3.6-3.2c1.6 2 3.6 3.2 6 3.2 2.8 0 4.4-1.8 4.4-4s-1.6-4-4.4-4c-2.4 0-4.4 1.2-6 3.2L4 19.6zm22.4-4h4.8v16h-4.8v-16zm9.2 11.2c2 1.6 4.8 2.4 7.6 2.4 3.2 0 4.8-1.2 4.8-2.8 0-2-2-2.8-5.2-3.6-4.4-1.2-7.6-2.4-7.6-6.4 0-4 3.6-6.8 8.8-6.8 3.6 0 6.8 1.2 9.2 3.6l-3.2 3.2c-1.6-1.6-3.6-2.4-5.6-2.4-2.4 0-4 1.2-4 2.4 0 1.6 1.6 2.4 4.8 3.2 4.8 1.2 8 2.8 8 6.8 0 4.4-3.6 7.2-9.6 7.2-4.4 0-8-1.6-10.4-4.4l3.2-3.2zm23.6-11.2c5.6 0 9.6 4 9.6 9.6 0 5.6-4 9.6-9.6 9.6-5.6 0-9.6-4-9.6-9.6 0-5.6 4-9.6 9.6-9.6zm0 14.4c2.8 0 4.8-2 4.8-4.8 0-2.8-2-4.8-4.8-4.8-2.8 0-4.8 2-4.8 4.8 0 2.8 2 4.8 4.8 4.8z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Claude-style Footer */}
      <footer className="border-t border-neutral-800/60 bg-[#161616] py-12 px-6 text-xs text-neutral-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="group flex items-center">
            <span className="text-xl font-black tracking-[-0.06em] text-white font-sans">
              Tenour<span className="text-amber-500 font-mono font-normal">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-6 text-neutral-300 font-medium">
            <Link href="/buyer/login" className="hover:text-white transition">
              Buyer Portal
            </Link>
            <Link href="/vendor/login" className="hover:text-white transition">
              Vendor Portal
            </Link>
            <Link href="/vendor/register" className="hover:text-white transition">
              Vendor Self-Registration
            </Link>
          </div>

          <p>© {new Date().getFullYear()} Tenour Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
