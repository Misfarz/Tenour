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
  Settings,
} from "lucide-react";

interface OrgSettings {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  createdAt: string;
}

export default function BuyerSettingsPage() {
  const { user, organization, role, isAuthenticated, isLoading: authLoading, checkAuth } = useAuth();
  const router = useRouter();

  const [settings, setSettings] = useState<OrgSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);
  const [orgName, setOrgName] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const displayRole = typeof role === "string" ? role : (role as any)?.name || "ORG_ADMIN";

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
      } else if (organization && displayRole === "ORG_ADMIN") {
        fetchSettings();
      }
    }
  }, [authLoading, isAuthenticated, organization, displayRole, router]);

  if (authLoading || (loadingSettings && displayRole === "ORG_ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400">Loading settings...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // 403 Forbidden Screen if non-admin user
  if (displayRole !== "ORG_ADMIN") {
    return (
      <div className="min-h-screen bg-[#161616] flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[#282828] text-red-400 flex items-center justify-center mx-auto mb-4 border border-neutral-700/60">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-normal text-white mb-2">403 — Access Denied</h1>
          <p className="text-neutral-400 text-xs leading-relaxed mb-6 font-sans">
            Only users with the <span className="font-semibold text-white">ORG_ADMIN</span> role can manage organization settings. Your current role is <span className="font-mono text-blue-400">{displayRole}</span>.
          </p>
          <Link
            href="/buyer/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 font-semibold text-xs transition font-sans"
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
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Top Navbar */}
      <BuyerNavbar activePath="/buyer/settings" />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Banner Container */}
        <div className="bg-[#1e1e1e] p-6 sm:p-8 rounded-3xl border border-neutral-800/80 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono font-extrabold uppercase tracking-widest mb-3">
            <Settings className="w-3.5 h-3.5" />
            <span>Organization Profile</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">
            Organization Configuration
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1.5 font-sans">
            Manage profile settings and workspace configurations for {organization?.name}.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between font-sans">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between font-sans">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl font-sans">
          <form onSubmit={handleUpdateSettings} className="space-y-6 max-w-xl text-xs font-sans">
            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-2">Organization Legal Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white focus:outline-none focus:border-neutral-500 transition"
              />
            </div>

            {settings && (
              <div className="grid grid-cols-2 gap-4 text-xs bg-[#141414] border border-neutral-800 p-5 rounded-2xl">
                <div>
                  <span className="text-neutral-500 text-[10px] font-mono uppercase block mb-1">Organization Slug</span>
                  <span className="font-mono font-semibold text-white">{settings.slug}</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] font-mono uppercase block mb-1">Organization ID</span>
                  <span className="font-mono font-semibold text-neutral-300 truncate block">{settings.id}</span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-neutral-800">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-white hover:bg-neutral-200 text-black font-semibold rounded-full shadow-md transition flex items-center gap-2 cursor-pointer font-sans text-xs"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Save className="w-4 h-4" />}
                <span>Save Organization Settings</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
