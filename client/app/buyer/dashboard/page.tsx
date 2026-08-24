"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { LogOut, Building2, ShieldCheck, User as UserIcon, Loader2, Users, FolderGit2, Settings, FileText, Plus } from "lucide-react";
import Link from "next/link";

export default function BuyerDashboardPage() {
  const { user, organization, role, isAuthenticated, isLoading, logout } = useAuth();
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
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading account session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const displayRole = typeof role === "string" ? role : (role as any)?.name || "ORG_ADMIN";

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Header / Navbar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-md bg-slate-950 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
                N
              </div>
              <span className="font-extrabold text-xl text-slate-950 tracking-tight">
                Tenour
              </span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#EDF5FF] text-[#1D72C9] border border-[#D0E4FF]">
              Buyer Workspace
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            <Link href="/buyer/dashboard" className="text-[#2383E2] font-semibold">Dashboard</Link>
            <Link href="/buyer/purchase-requests" className="hover:text-slate-950 transition">Purchase Requests</Link>
            {displayRole === "ORG_ADMIN" && (
              <>
                <Link href="/buyer/users" className="hover:text-slate-950 transition">User Management</Link>
                <Link href="/buyer/departments" className="hover:text-slate-950 transition">Departments</Link>
                <Link href="/buyer/settings" className="hover:text-slate-950 transition">Organization Settings</Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-slate-700 font-medium">
              <UserIcon className="w-3.5 h-3.5 text-[#2383E2]" />
              <span>{user.email}</span>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition duration-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
        {/* Welcome Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Welcome, {user.name}
              </h1>
              <p className="text-slate-600 text-sm mt-2 max-w-xl">
                Your account is active in <span className="font-bold text-slate-900">{organization?.name}</span> with role <span className="font-bold text-[#2383E2]">{displayRole}</span>.
              </p>
            </div>
            <Link
              href="/buyer/purchase-requests/new"
              className="px-4 py-2.5 rounded-xl bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 self-start md:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Purchase Request</span>
            </Link>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/buyer/purchase-requests"
            className="bg-white border border-slate-200 hover:border-[#2383E2] p-5 rounded-2xl shadow-sm hover:shadow-md transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EDF5FF] flex items-center justify-center text-[#2383E2]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-950 group-hover:text-[#2383E2] transition">Purchase Requests</h3>
                <p className="text-xs text-slate-500">Create & track requisitions</p>
              </div>
            </div>
            <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          {displayRole === "ORG_ADMIN" && (
            <>
              <Link
                href="/buyer/users"
                className="bg-white border border-slate-200 hover:border-[#2383E2] p-5 rounded-2xl shadow-sm hover:shadow-md transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EDF5FF] flex items-center justify-center text-[#2383E2]">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-950 group-hover:text-[#2383E2] transition">User Management</h3>
                    <p className="text-xs text-slate-500">Manage members & roles</p>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <Link
                href="/buyer/departments"
                className="bg-white border border-slate-200 hover:border-[#2383E2] p-5 rounded-2xl shadow-sm hover:shadow-md transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EDF5FF] flex items-center justify-center text-[#2383E2]">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-950 group-hover:text-[#2383E2] transition">Departments</h3>
                    <p className="text-xs text-slate-500">Configure team units</p>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </>
          )}
        </div>

        {/* Current User & Organization Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EDF5FF] flex items-center justify-center text-[#2383E2]">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Organization
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Active Organization</p>
              <h3 className="text-xl font-bold text-slate-950 tracking-tight">
                {organization?.name || "No Organization"}
              </h3>
              {organization?.slug && (
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  Slug: {organization.slug}
                </p>
              )}
            </div>
          </div>

          {/* Role Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EDF5FF] flex items-center justify-center text-[#2383E2]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Role & RBAC
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Assigned Role</p>
              <h3 className="text-xl font-bold text-slate-950 tracking-tight">
                {displayRole}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {displayRole === "ORG_ADMIN"
                  ? "Full Organization Administration Privileges"
                  : `${displayRole} Member Access`}
              </p>
            </div>
          </div>
        </div>

        {/* User Summary Details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Account Metadata
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-slate-500 block mb-1">Full Name</span>
              <span className="font-semibold text-slate-950 text-sm">{user.name}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-slate-500 block mb-1">Email Address</span>
              <span className="font-semibold text-slate-950 text-sm">{user.email}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-slate-500 block mb-1">User ID</span>
              <span className="font-mono text-slate-600 text-xs truncate block">{user.id}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
