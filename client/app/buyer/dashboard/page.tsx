"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Building2,
  ShieldCheck,
  User as UserIcon,
  Loader2,
  Users,
  FolderGit2,
  FileText,
  Plus,
  CheckCircle,
  FileCode,
  Store,
  FileCheck,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  Search,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { BuyerNavbar } from "@/components/buyer-navbar";

export default function BuyerDashboardPage() {
  const { user, organization, role, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "operations" | "admin">("overview");

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else if (!organization) {
        router.push("/buyer/setup-organization");
      }
    }
  }, [isLoading, isAuthenticated, organization, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading your procurement workspace...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const displayRole = typeof role === "string" ? role : (role as any)?.name || "ORG_ADMIN";
  const isManager = displayRole === "MANAGER" || displayRole === "ORG_ADMIN";
  const isAdmin = displayRole === "ORG_ADMIN";
  const isProcurement = displayRole === "PROCUREMENT" || displayRole === "ORG_ADMIN";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Header / Navbar */}
      <BuyerNavbar activePath="/buyer/dashboard" />

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Welcome Header & Quick Actions */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#2383E2]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-40 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2383E2] to-blue-400 flex items-center justify-center text-white shadow-lg font-bold text-xl ring-4 ring-white/10 shrink-0">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Welcome back, {user.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold tracking-wide uppercase">
                    {displayRole}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>{organization?.name || "Organization Portal"}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 font-mono text-xs">{organization?.slug}</span>
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/buyer/purchase-requests/new"
                className="px-4 py-2.5 rounded-xl bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Create Requisition</span>
              </Link>
              
              {isProcurement && (
                <Link
                  href="/buyer/rfqs"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span>Sourcing RFQs</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Quick KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* KPI 1 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purchase Requests</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2383E2] flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 tracking-tight">PR Hub</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Requisitions & approvals</p>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">RFQs & Sourcing</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCode className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 tracking-tight">Sourcing</span>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Live Quotes
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Bids & vendor comparison</p>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purchase Orders</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 tracking-tight">Orders</span>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  PO Cycle
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Issued POs & vendor delivery</p>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Vendor Portal</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 tracking-tight">Vendors</span>
                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                  Directory
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Suppliers & contact database</p>
            </div>
          </div>
        </div>

        {/* Section 1: Workflow Operations Matrix */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#2383E2]" />
              <span>Procurement Operations & Workflow</span>
            </h2>
            <span className="text-xs font-medium text-slate-500">Quick Access Modules</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Purchase Requests */}
            <Link
              href="/buyer/purchase-requests"
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#2383E2] transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2383E2] flex items-center justify-center font-bold group-hover:bg-[#2383E2] group-hover:text-white transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-[#2383E2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h3 className="font-bold text-base text-slate-950 group-hover:text-[#2383E2] transition-colors">
                Purchase Requests (PR)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Create new internal purchase requisitions, submit items for line approval, and track lifecycle statuses.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>View all requisitions</span>
                <span className="text-[#2383E2] group-hover:underline">Open →</span>
              </div>
            </Link>

            {/* Manager Approvals (Conditional) */}
            {isManager && (
              <Link
                href="/buyer/approvals"
                className="bg-white border border-amber-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-amber-400 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <h3 className="font-bold text-base text-slate-950 group-hover:text-amber-600 transition-colors">
                  Manager Approvals
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Review pending purchase requests submitted by team members, approve budget lines, or reject requests with notes.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-medium">
                  <span>Pending approval queue</span>
                  <span className="text-amber-600 group-hover:underline">Review →</span>
                </div>
              </Link>
            )}

            {/* Sourcing & RFQs */}
            <Link
              href="/buyer/rfqs"
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-500 transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FileCode className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h3 className="font-bold text-base text-slate-950 group-hover:text-indigo-600 transition-colors">
                RFQs & Sourcing
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Convert approved PRs into formal Requests For Quotations (RFQ), invite vendors, and compare submitted bids.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Manage sourcing events</span>
                <span className="text-indigo-600 group-hover:underline">Sourcing →</span>
              </div>
            </Link>

            {/* Purchase Orders */}
            <Link
              href="/buyer/purchase-orders"
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <FileCheck className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h3 className="font-bold text-base text-slate-950 group-hover:text-emerald-600 transition-colors">
                Purchase Orders (PO)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Issue official purchase orders to winning vendors, manage delivery deadlines, and track vendor acknowledgments.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>View purchase orders</span>
                <span className="text-emerald-600 group-hover:underline">Orders →</span>
              </div>
            </Link>

            {/* Vendor Management */}
            <Link
              href="/buyer/vendors"
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-purple-500 transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Store className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h3 className="font-bold text-base text-slate-950 group-hover:text-purple-600 transition-colors">
                Vendor Management
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Maintain vendor master directory, invite supplier contacts, and inspect onboarding status across suppliers.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Supplier directory</span>
                <span className="text-purple-600 group-hover:underline">Directory →</span>
              </div>
            </Link>

            {/* Administration (Admin only) */}
            {isAdmin && (
              <Link
                href="/buyer/users"
                className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-600 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Users className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <h3 className="font-bold text-base text-slate-950 group-hover:text-[#2383E2] transition-colors">
                  User & Team Control
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Invite internal organization members, assign RBAC roles (Procurement, Manager, Employee), and configure departments.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>Organization users</span>
                  <span className="text-slate-900 group-hover:underline">Manage →</span>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Section 2: Account & Organization Governance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Organization Info */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2383E2] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Organization Profile
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-950">{organization?.name || "Organization"}</h3>
              <p className="text-xs text-slate-500 mt-1 font-mono">Slug: {organization?.slug}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Tenant Status</span>
              <span className="font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ACTIVE
              </span>
            </div>
          </div>

          {/* RBAC Role Info */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Assigned Security Role
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-950">{displayRole}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {displayRole === "ORG_ADMIN"
                  ? "Full administrative control over organization settings, users, and procurement."
                  : displayRole === "PROCUREMENT"
                  ? "Sourcing, RFQs, Quote evaluation, and PO issuance privileges."
                  : displayRole === "MANAGER"
                  ? "Line item review and purchase request approval authority."
                  : "Standard employee purchase request creator."}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Security Level</span>
              <span className="font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                VERIFIED
              </span>
            </div>
          </div>

          {/* User Account Info */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <UserIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Account Details
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-950">{user.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{user.email}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Account Status</span>
              <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                AUTHENTICATED
              </span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

