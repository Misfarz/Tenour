"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { Loader2, LogIn, Building2 } from "lucide-react";

export default function VendorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<{ accessToken: string; user: any; vendor: any }>("/auth/vendor/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.success && res.data) {
        localStorage.setItem("vendorToken", res.data.accessToken);
        localStorage.setItem("vendorInfo", JSON.stringify(res.data.vendor));
        router.push("/vendor/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in to Vendor Portal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFD] flex flex-col items-center justify-center p-6 text-slate-900 font-sans selection:bg-[#2383E2] selection:text-white">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-sm">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center text-white font-black text-xl shadow-sm">
            N
          </div>
          <span className="font-extrabold text-2xl text-slate-950 tracking-tight">Tenour</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            Vendor Portal
          </span>
        </div>

        <h2 className="text-xl font-extrabold text-center text-slate-950 mb-1">Vendor Portal Login</h2>
        <p className="text-slate-500 text-xs text-center mb-6">
          Sign in to view quotation requests, RFQs, and purchase orders.
        </p>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="sales@dell.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2383E2]"
            />
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            <span>Sign In to Vendor Portal</span>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Buyer Organization Member?{" "}
          <Link href="/buyer/login" className="font-bold text-[#2383E2] hover:underline">
            Buyer Workspace Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
