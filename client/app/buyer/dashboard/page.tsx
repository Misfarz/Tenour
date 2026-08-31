"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Building2,
  Loader2,
  Users,
  FileText,
  Plus,
  CheckCircle,
  FileCode,
  Store,
  FileCheck,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { BuyerNavbar } from "@/components/buyer-navbar";

export default function BuyerDashboardPage() {
  const { user, organization, role, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

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
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400">Loading procurement workspace...</span>
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
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Header / Sidebar Navbar */}
      <BuyerNavbar activePath="/buyer/dashboard" />

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Welcome Header Container */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#282828] border border-neutral-700/60 flex items-center justify-center text-white font-serif font-bold text-2xl shrink-0">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-serif text-2xl sm:text-3xl font-normal text-white tracking-tight">
                    Welcome back, {user.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-extrabold uppercase tracking-widest">
                    {displayRole}
                  </span>
                </div>
                <p className="text-neutral-400 text-xs sm:text-sm mt-1 flex items-center gap-2 font-sans">
                  <Building2 className="w-4 h-4 text-neutral-500" />
                  <span>{organization?.name || "Organization Portal"}</span>
                  <span className="text-neutral-600">•</span>
                  <span className="text-neutral-500 font-mono text-xs">{organization?.slug}</span>
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/buyer/purchase-requests/new"
                className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer font-sans"
              >
                <Plus className="w-4 h-4" />
                <span>Create Requisition</span>
              </Link>

              {isProcurement && (
                <Link
                  href="/buyer/rfqs"
                  className="px-5 py-2.5 rounded-full bg-[#242424] hover:bg-[#2e2e2e] border border-neutral-700/60 text-neutral-200 font-medium text-xs shadow-sm transition flex items-center gap-2 cursor-pointer font-sans"
                >
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span>Sourcing RFQs</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Single Unified Workflow Operations Grid */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h2 className="font-serif text-xl font-normal text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#2383E2]" />
              <span>Procurement Modules & Workflow</span>
            </h2>
            <span className="text-xs font-sans text-neutral-400">Workspace Operations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Purchase Requests */}
            <Link
              href="/buyer/purchase-requests"
              className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 shadow-xl hover:border-neutral-700 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#282828] text-blue-400 flex items-center justify-center border border-neutral-700/60 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-serif text-lg font-normal text-white group-hover:text-neutral-200 transition">
                  Purchase Requests (PR)
                </h3>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-sans">
                  Create new internal purchase requisitions, submit items for line approval, and track lifecycle statuses.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-sans text-neutral-400">
                <span>View all requisitions</span>
                <span className="text-blue-400 font-semibold group-hover:underline">Open →</span>
              </div>
            </Link>

            {/* Manager Approvals (Conditional) */}
            {isManager && (
              <Link
                href="/buyer/approvals"
                className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 shadow-xl hover:border-neutral-700 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#282828] text-amber-400 flex items-center justify-center border border-neutral-700/60 group-hover:scale-105 transition-transform">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-serif text-lg font-normal text-white group-hover:text-neutral-200 transition">
                    Manager Approvals
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-sans">
                    Review pending purchase requests submitted by team members, approve budget lines, or reject requests.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-sans text-neutral-400">
                  <span>Pending approval queue</span>
                  <span className="text-amber-400 font-semibold group-hover:underline">Review →</span>
                </div>
              </Link>
            )}

            {/* Sourcing & RFQs */}
            <Link
              href="/buyer/rfqs"
              className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 shadow-xl hover:border-neutral-700 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#282828] text-indigo-400 flex items-center justify-center border border-neutral-700/60 group-hover:scale-105 transition-transform">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-serif text-lg font-normal text-white group-hover:text-neutral-200 transition">
                  RFQs & Sourcing
                </h3>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-sans">
                  Convert approved PRs into formal Requests For Quotations (RFQ), invite vendors, and compare bids.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-sans text-neutral-400">
                <span>Manage sourcing events</span>
                <span className="text-indigo-400 font-semibold group-hover:underline">Sourcing →</span>
              </div>
            </Link>

            {/* Purchase Orders */}
            <Link
              href="/buyer/purchase-orders"
              className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 shadow-xl hover:border-neutral-700 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#282828] text-emerald-400 flex items-center justify-center border border-neutral-700/60 group-hover:scale-105 transition-transform">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-serif text-lg font-normal text-white group-hover:text-neutral-200 transition">
                  Purchase Orders (PO)
                </h3>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-sans">
                  Generate binding Purchase Orders from accepted vendor quotations and track order fulfillment.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-sans text-neutral-400">
                <span>Issued purchase orders</span>
                <span className="text-emerald-400 font-semibold group-hover:underline">Orders →</span>
              </div>
            </Link>

            {/* Vendor Directory */}
            <Link
              href="/buyer/vendors"
              className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 shadow-xl hover:border-neutral-700 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#282828] text-purple-400 flex items-center justify-center border border-neutral-700/60 group-hover:scale-105 transition-transform">
                    <Store className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-serif text-lg font-normal text-white group-hover:text-neutral-200 transition">
                  Vendor Directory
                </h3>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-sans">
                  Access self-registered platform suppliers and private organization vendor contacts.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-sans text-neutral-400">
                <span>Explore vendor database</span>
                <span className="text-purple-400 font-semibold group-hover:underline">Vendors →</span>
              </div>
            </Link>

            {/* Administration (Admin only) */}
            {isAdmin && (
              <Link
                href="/buyer/users"
                className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 shadow-xl hover:border-neutral-700 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#282828] text-rose-400 flex items-center justify-center border border-neutral-700/60 group-hover:scale-105 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-serif text-lg font-normal text-white group-hover:text-neutral-200 transition">
                    User Management & Roles
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-sans">
                    Invite organization members, assign role permissions, and configure department structures.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-sans text-neutral-400">
                  <span>Organization admin</span>
                  <span className="text-rose-400 font-semibold group-hover:underline">Admin →</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
