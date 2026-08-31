"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { Loader2, CheckCircle2, Building2 } from "lucide-react";

function VendorAcceptInvitationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  interface InvitationDetails {
    name: string;
    email: string;
    vendorName: string;
    buyerOrganizationName: string;
  }

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);

  useEffect(() => {
    if (token) {
      apiClient<InvitationDetails>(`/vendors/invitation/${token}`)
        .then((res) => {
          if (res.success && res.data) {
            setInvitation(res.data);
          }
        })
        .catch(() => {});
    }
  }, [token]);

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
      <div className="min-h-screen bg-[#161616] flex flex-col items-center justify-center p-6 text-white font-sans selection:bg-white selection:text-black">
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-normal text-white mb-2">Vendor Account Activated!</h1>
          <p className="text-neutral-400 text-xs leading-relaxed mb-6 font-sans">
            Your password has been set successfully. Redirecting you to the Vendor Login portal...
          </p>
          <Link
            href="/vendor/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition shadow-md font-sans"
          >
            Go to Vendor Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161616] flex flex-col items-center justify-center p-6 text-white font-sans selection:bg-white selection:text-black">
      <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <span className="font-black text-2xl tracking-[-0.06em] text-white">Tenour.</span>
          <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
            Vendor Portal
          </span>
        </div>

        <h2 className="font-serif text-2xl font-normal text-center text-white mb-1.5">Set Vendor Account Password</h2>
        <p className="text-neutral-400 text-xs text-center mb-6 font-sans">
          Set a secure password to activate your Tenour Vendor Portal account.
        </p>

        {invitation && (
          <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-4 mb-5 text-xs space-y-2 font-sans">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
              <span className="text-neutral-500 font-mono text-[10px] uppercase">Vendor Company</span>
              <span className="font-semibold text-white">{invitation.vendorName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500 font-mono text-[10px] uppercase">Representative</span>
              <span className="font-medium text-neutral-300">{invitation.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500 font-mono text-[10px] uppercase">Registered Email</span>
              <span className="font-mono font-semibold text-emerald-400">{invitation.email}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs mb-4 font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">New Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">Confirm Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : "Activate Vendor Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VendorAcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#161616]">
        <Loader2 className="w-5 h-5 animate-spin text-white" />
      </div>
    }>
      <VendorAcceptInvitationContent />
    </Suspense>
  );
}
