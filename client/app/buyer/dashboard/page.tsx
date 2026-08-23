"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { LogOut, Building2, ShieldCheck, User as UserIcon, Loader2, Sparkles } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="flex items-center gap-3 bg-neutral-900/80 border border-neutral-800 px-6 py-4 rounded-2xl backdrop-blur-xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span className="text-sm font-medium text-neutral-300">Loading account session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const displayRole = typeof role === "string" ? role : (role as any)?.name || "ORG_ADMIN";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/30 via-neutral-950 to-neutral-950 text-neutral-100 flex flex-col">
      {/* Header / Navbar */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              T
            </div>
            <span className="font-bold text-lg tracking-tight text-white">Tenour</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full text-neutral-300">
              <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>{user.email}</span>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700/60 text-xs font-medium text-neutral-200 transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5 text-neutral-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col gap-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-neutral-900/80 via-neutral-900/50 to-neutral-950 border border-neutral-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buyer Account Active</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Welcome, {user.name}
              </h1>
              <p className="text-neutral-400 text-sm mt-2 max-w-xl">
                You are successfully logged in with Access & Refresh Token security.
              </p>
            </div>
          </div>
        </div>

        {/* Current User & Organization Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Card */}
          <div className="bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-neutral-700/80 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xs uppercase font-semibold text-neutral-500 tracking-wider">
                Organization
              </span>
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium mb-1">Active Organization</p>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {organization?.name || "No Organization"}
              </h3>
              {organization?.slug && (
                <p className="text-xs text-neutral-500 mt-1 font-mono">
                  Slug: {organization.slug}
                </p>
              )}
            </div>
          </div>

          {/* Role Card */}
          <div className="bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-neutral-700/80 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs uppercase font-semibold text-neutral-500 tracking-wider">
                Role
              </span>
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium mb-1">Assigned Role</p>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {displayRole}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Organization Administrative Privileges
              </p>
            </div>
          </div>
        </div>

        {/* User Summary Card */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4">
            Current User Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-xl">
              <span className="text-neutral-500 block mb-1">Full Name</span>
              <span className="font-medium text-white text-sm">
                {user.name}
              </span>
            </div>
            <div className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-xl">
              <span className="text-neutral-500 block mb-1">Email Address</span>
              <span className="font-medium text-white text-sm">{user.email}</span>
            </div>
            <div className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-xl">
              <span className="text-neutral-500 block mb-1">User ID</span>
              <span className="font-mono text-neutral-400 text-xs truncate block">{user.id}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
