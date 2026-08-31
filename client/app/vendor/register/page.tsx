"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import {
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Globe,
  Loader2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Store,
} from "lucide-react";

export default function VendorRegisterPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [country, setCountry] = useState<string>("India");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiClient<any>("/auth/vendor/register", {
        method: "POST",
        body: JSON.stringify({
          companyName: companyName.trim(),
          contactName: contactName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          country: country.trim() || undefined,
        }),
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || "Vendor registration failed");
      }

      // Store vendor auth tokens and metadata
      localStorage.setItem("vendorToken", res.data.accessToken);
      localStorage.setItem("vendorInfo", JSON.stringify(res.data.vendor));

      // Redirect to Vendor Portal Dashboard
      router.push("/vendor/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to register vendor company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Navigation Header */}
      <header className="border-b border-neutral-900 bg-black/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-1">
            <span className="text-xl md:text-2xl font-black tracking-[-0.06em] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-neutral-400 font-sans group-hover:opacity-90 transition">
              Tenour<span className="text-emerald-400 font-mono font-normal">.</span>
            </span>
          </Link>

          <Link
            href="/vendor/login"
            className="text-[11px] font-mono font-bold tracking-widest text-neutral-400 hover:text-white uppercase transition flex items-center gap-1"
          >
            <span>Already Registered? Sign In</span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
          </Link>
        </div>
      </header>

      {/* Main Registration Form Container */}
      <main className="flex-1 flex items-center justify-center p-6 py-12 bg-gradient-to-b from-black via-[#090D0A] to-black relative">
        {/* Ambient Emerald Background Light */}
        <div className="absolute w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-lg relative z-10">
          <div className="bg-[#0B0C0E] border border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-extrabold uppercase tracking-widest mb-3">
                <Store className="w-3 h-3" />
                <span>VENDOR REGISTRATION</span>
              </span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Register Supplier Profile
              </h1>
              <p className="text-xs text-neutral-400 mt-1.5">
                Join Tenour's global supplier network to receive RFQs and submit commercial bids
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="font-bold cursor-pointer text-red-400">✕</button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Company Legal Name */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">
                  Company Legal Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Acme Tech Solutions Pvt Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 bg-[#141518] border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition"
                  />
                </div>
              </div>

              {/* Contact Person & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">
                    Contact Person *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Rajesh Kumar"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 bg-[#141518] border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">
                    Business Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="sales@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 bg-[#141518] border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 bg-[#141518] border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 bg-[#141518] border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">
                  Company Street Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Street address, Tech Park..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 bg-[#141518] border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#141518] border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. India"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#141518] border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs tracking-widest uppercase shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <>
                    <span>Register Supplier Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-neutral-900 text-center text-[11px] text-neutral-400">
              <p>
                Already registered?{" "}
                <Link href="/vendor/login" className="font-bold text-emerald-400 hover:underline">
                  Sign in to Vendor Portal →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-900 bg-black py-6 px-6 text-[11px] text-neutral-500 text-center">
        © {new Date().getFullYear()} Tenour Inc. All rights reserved.
      </footer>
    </div>
  );
}
