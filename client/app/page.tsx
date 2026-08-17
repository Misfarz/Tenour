"use client";

import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { LogOut, User as UserIcon, Mail, ShieldCheck, Sparkles, Loader2, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-neutral-950 to-neutral-950">
        <div className="w-full max-w-md text-center p-8 bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-2xl">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-6 shadow-xl shadow-indigo-500/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Tenour Platform</h1>
          <p className="text-neutral-400 text-sm mb-8">
            Experience clean architecture and secure authentication.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="w-full py-3 px-4 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 font-medium text-sm rounded-xl border border-neutral-700/80 transition flex items-center justify-center"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
              T
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">Tenour</h1>
              <span className="text-xs text-neutral-400">Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Authenticated
            </div>

            <button
              onClick={logout}
              className="px-4 py-2 bg-neutral-800 hover:bg-red-950/60 hover:border-red-800/60 text-neutral-300 hover:text-red-300 text-xs font-medium rounded-xl border border-neutral-700/60 transition duration-200 flex items-center gap-2 group cursor-pointer"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col gap-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-neutral-900/80 border border-indigo-500/20 shadow-2xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Welcome back
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Hello, {user.firstName} {user.lastName || ""}!
            </h2>
            <p className="text-neutral-400 text-sm mt-2 leading-relaxed">
              You are signed in to your Tenour account. Everything is setup and operating smoothly.
            </p>
          </div>
        </div>

        {/* User Info & Session Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-indigo-400" />
                Profile Information
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                User Profile
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-neutral-800/60">
                <span className="text-neutral-500 text-xs">User ID</span>
                <span className="font-mono text-xs text-neutral-300 truncate max-w-[200px]">
                  {user.id}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-neutral-800/60">
                <span className="text-neutral-500 text-xs">Full Name</span>
                <span className="text-neutral-200 font-medium">
                  {user.firstName} {user.lastName || ""}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-neutral-500 text-xs">Email</span>
                <span className="text-neutral-200 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  {user.email}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Security & Session
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                  Active Session
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Your session is secured using HttpOnly cookies and Argon2 password encryption.
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-800/60">
              <button
                onClick={logout}
                className="w-full py-3 px-4 bg-red-950/40 hover:bg-red-900/60 text-red-300 font-medium text-xs rounded-xl border border-red-800/50 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout of Tenour</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/60 py-6 text-center text-xs text-neutral-500">
        Tenour Platform • Clean Architecture Auth Module
      </footer>
    </div>
  );
}
