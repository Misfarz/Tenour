"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { Lock, Loader2, CheckCircle2, Building2 } from "lucide-react";

function VendorAcceptInvitationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid invitation link. Token is missing.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await apiClient("/auth/vendor/accept-invitation", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/vendor/login");
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to accept vendor invitation");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950 mb-2">Vendor Account Activated!</h1>
          <p className="text-slate-600 text-xs leading-relaxed mb-6">
            Your password has been set successfully. Redirecting you to the Vendor Login portal...
          </p>
          <Link
            href="/vendor/login"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs transition"
          >
            Go to Vendor Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD] flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-sm">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center text-white font-black text-xl shadow-sm">
            N
          </div>
          <span className="font-extrabold text-2xl text-slate-950 tracking-tight">Tenour</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#EDF5FF] text-[#1D72C9] border border-[#D0E4FF]">
            Vendor Portal
          </span>
        </div>

        <h2 className="text-xl font-extrabold text-center text-slate-950 mb-1">Set Vendor Account Password</h2>
        <p className="text-slate-500 text-xs text-center mb-6">
          Set a secure password to activate your Tenour Vendor Portal account.
        </p>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2383E2]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2383E2]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Activate Vendor Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VendorAcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
      </div>
    }>
      <VendorAcceptInvitationContent />
    </Suspense>
  );
}
