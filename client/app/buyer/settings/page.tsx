"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  Building2,
  Save,
  Loader2,
  Lock,
  ArrowLeft,
  LogOut,
  ShieldCheck,
} from "lucide-react";

interface OrgSettings {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  createdAt: string;
}

export default function BuyerSettingsPage() {
  const { user, organization, role, isAuthenticated, isLoading: authLoading, logout, checkAuth } = useAuth();
  const router = useRouter();

  const [settings, setSettings] = useState<OrgSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);
  const [orgName, setOrgName] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await apiClient<OrgSettings>("/organizations/settings");
      if (res.success && res.data) {
        setSettings(res.data);
        setOrgName(res.data.name);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load organization settings");
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else if (organization && role === "ORG_ADMIN") {
        fetchSettings();
      }
    }
  }, [authLoading, isAuthenticated, organization, role, router]);

  if (authLoading || (loadingSettings && role === "ORG_ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading settings...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // 403 Forbidden Screen if non-admin user
  if (role !== "ORG_ADMIN") {
    return (
      <div className="min-h-screen bg-[#FAFBFD] flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950 mb-2">403 — Access Denied</h1>
          <p className="text-slate-600 text-xs leading-relaxed mb-6">
            Only users with the <span className="font-semibold text-slate-900">ORG_ADMIN</span> role can manage organization settings. Your current role is <span className="font-semibold text-[#2383E2]">{role || "Member"}</span>.
          </p>
          <Link
            href="/buyer/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await apiClient("/organizations/settings", {
        method: "PATCH",
        body: JSON.stringify({ name: orgName }),
      });

      if (res.success) {
        setSuccess("Organization settings updated successfully.");
        await checkAuth();
        fetchSettings();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update settings");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Top Navbar */}
      <BuyerNavbar activePath="/buyer/settings" />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF5FF] border border-[#D0E4FF] text-[#1D72C9] text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Organization Settings</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
            Organization Configuration
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Manage profile settings for {organization?.name}.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleUpdateSettings} className="space-y-6 max-w-xl text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Organization Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#2383E2] transition"
              />
            </div>

            {settings && (
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div>
                  <span className="text-slate-400 block mb-1">Organization Slug</span>
                  <span className="font-mono font-semibold text-slate-800">{settings.slug}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Organization ID</span>
                  <span className="font-mono font-semibold text-slate-800 truncate block">{settings.id}</span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Organization Settings</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
