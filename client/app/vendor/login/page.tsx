"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiClient } from "@/lib/api-client";
import { Loader2, Store, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-[#161616] text-white flex flex-col justify-between font-sans selection:bg-white selection:text-black p-6 md:p-12">
      {/* Top Header Row (Minimal Text Logo & Back Button) */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="group flex items-center">
          <span className="text-2xl md:text-3xl font-black tracking-[-0.06em] text-white font-sans group-hover:opacity-90 transition">
            Tenour<span className="text-emerald-400 font-mono font-normal">.</span>
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-sans text-neutral-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Split Screen Hero Container */}
      <main className="max-w-7xl w-full mx-auto py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Headline & Claude.ai Style Login Card */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight leading-[1.08]">
              Fulfill what’s next
            </h1>
            <p className="font-sans text-neutral-400 text-sm sm:text-base mt-4 max-w-xl">
              Your commercial partner for global supply network bidding and order fulfillment.
            </p>
          </div>

          {/* Form Card Box */}
          <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 max-w-md shadow-2xl">
            {error && (
              <div className="mb-6 p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 font-sans">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="space-y-3 mb-5 font-sans">
              <button
                type="button"
                className="w-full py-3 px-4 rounded-2xl bg-[#282828] hover:bg-[#323232] text-white text-xs font-medium border border-neutral-700/60 transition flex items-center justify-center gap-3 cursor-pointer"
              >
                <span className="text-sm font-bold text-blue-400">G</span>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                className="w-full py-3 px-4 rounded-2xl bg-[#282828] hover:bg-[#323232] text-white text-xs font-medium border border-neutral-700/60 transition flex items-center justify-center gap-3 cursor-pointer"
              >
                <Store className="w-4 h-4 text-emerald-400" />
                <span>Continue as Verified Vendor</span>
              </button>
            </div>

            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800" />
              </div>
              <span className="relative px-3 bg-[#1e1e1e] text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                OR
              </span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4 font-sans">
              <div>
                <input
                  type="email"
                  required
                  placeholder="Enter vendor email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 focus:border-neutral-500 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none transition"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  placeholder="Enter vendor password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 focus:border-neutral-500 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition shadow-md cursor-pointer mt-2 disabled:opacity-50 flex items-center justify-center gap-2 font-sans"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <span>Continue with vendor email</span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 flex flex-col gap-2.5 text-center font-sans">
              <Link
                href="/vendor/register"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-[#282828] hover:bg-[#323232] text-emerald-400 text-xs font-medium border border-neutral-700/60 transition"
              >
                <span>New Vendor? Self Register Account →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Editorial Image Card */}
        <div className="lg:col-span-6 hidden lg:block">
          <div className="relative rounded-3xl overflow-hidden border border-neutral-800/80 shadow-2xl aspect-[4/3] max-h-[540px] w-full">
            <Image
              src="/claude_hero.jpg"
              alt="Tenour Commercial Vendor Hub"
              fill
              className="object-cover hover:scale-102 transition-transform duration-700"
              priority
            />
          </div>
        </div>
      </main>

      {/* Footer Copy */}
      <footer className="max-w-7xl w-full mx-auto text-xs text-neutral-500 font-sans text-center md:text-left">
        © {new Date().getFullYear()} Tenour Inc. All rights reserved.
      </footer>
    </div>
  );
}
