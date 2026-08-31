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
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col justify-center py-12 px-6 font-sans selection:bg-[#2383E2] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Brand Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#2383E2] flex items-center justify-center text-white font-black text-xl shadow-md">
            V
          </div>
          <span className="font-extrabold text-2xl text-slate-950 tracking-tight">Tenour Vendor Portal</span>
        </div>

        <h2 className="text-center text-2xl font-black tracking-tight text-slate-950">
          Register Vendor Company
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-500 font-medium">
          Create an enterprise vendor profile to receive RFQs, submit quotes, and manage Purchase Orders.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-8 border border-slate-200 rounded-3xl shadow-sm">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Company Legal Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
                />
              </div>
            </div>

            {/* Contact Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Contact Person *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="sales@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
                  />
                </div>
              </div>
            </div>

            {/* Password & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Portal Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
                  />
                </div>
              </div>
            </div>

            {/* Address & City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Company Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Street address, Technology Park..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="e.g. India"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-xs text-xs font-extrabold text-white bg-[#2383E2] hover:bg-[#1D72C9] focus:outline-none transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Vendor Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <p className="text-xs text-slate-500">
              Already registered your company?{" "}
              <Link href="/vendor/login" className="font-extrabold text-[#2383E2] hover:underline">
                Sign in to Vendor Portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
