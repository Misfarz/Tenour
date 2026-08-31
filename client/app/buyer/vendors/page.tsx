"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Loader2,
  Eye,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

interface VendorInvitation {
  id: string;
  token: string;
  email: string;
  name: string;
  usedAt?: string | null;
  expiresAt: string;
}

interface Vendor {
  id: string;
  name: string;
  legalName?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  taxId?: string | null;
  city?: string | null;
  country?: string | null;
  buyerVendorStatus: string;
  source?: string;
  hasVendorPortal?: boolean;
  latestInvitation?: VendorInvitation | null;
}

export default function BuyerVendorsPage() {
  const { user, organization, role, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<"ALL" | "PLATFORM_REGISTERED" | "MANUALLY_ADDED">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const displayRole = typeof role === "string" ? role : (role as any)?.name || "ORG_ADMIN";

  // Create Vendor Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formName, setFormName] = useState<string>("");
  const [formLegalName, setFormLegalName] = useState<string>("");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formPhone, setFormPhone] = useState<string>("");
  const [formTaxId, setFormTaxId] = useState<string>("");
  const [formCity, setFormCity] = useState<string>("");
  const [formCountry, setFormCountry] = useState<string>("");

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      let queryParams = new URLSearchParams();
      if (searchTerm.trim()) queryParams.set("search", searchTerm.trim());
      if (sourceFilter !== "ALL") queryParams.set("source", sourceFilter);
      if (statusFilter !== "ALL") queryParams.set("status", statusFilter);

      const res = await apiClient<Vendor[]>(`/vendors?${queryParams.toString()}`);
      if (res.success && res.data) {
        setVendors(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else {
        fetchVendors();
      }
    }
  }, [authLoading, isAuthenticated, sourceFilter, statusFilter, router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVendors();
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError("Vendor name is required");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient<Vendor>("/vendors", {
        method: "POST",
        body: JSON.stringify({
          name: formName.trim(),
          legalName: formLegalName.trim() || undefined,
          email: formEmail.trim() || undefined,
          phone: formPhone.trim() || undefined,
          taxId: formTaxId.trim() || undefined,
          city: formCity.trim() || undefined,
          country: formCountry.trim() || undefined,
        }),
      });

      if (res.success) {
        setShowAddModal(false);
        setFormName("");
        setFormLegalName("");
        setFormEmail("");
        setFormPhone("");
        setFormTaxId("");
        setFormCity("");
        setFormCountry("");
        fetchVendors();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create vendor");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || (loading && vendors.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400">Loading vendor directory...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const canManageVendors = displayRole === "ORG_ADMIN" || displayRole === "PROCUREMENT";

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Navbar */}
      <BuyerNavbar activePath="/buyer/vendors" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Banner Container */}
        <div className="bg-[#1e1e1e] p-6 sm:p-8 rounded-3xl border border-neutral-800/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-mono font-extrabold uppercase tracking-widest mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>Supplier Ecosystem</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">
              Vendor Directory
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1.5 font-sans">
              Directory of qualified suppliers, vendor relationships, and contact contacts for {organization?.name}.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto font-sans">
            <Link
              href="/vendor/login"
              target="_blank"
              className="px-4 py-2.5 rounded-full bg-[#242424] hover:bg-[#2e2e2e] border border-neutral-700/60 text-neutral-200 font-medium text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              title="Open Vendor Portal Login (Dev Testing)"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vendor Portal Login</span>
            </Link>

            {canManageVendors && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vendor</span>
              </button>
            )}
          </div>
        </div>

        {/* Source Filter Tabs & Search Bar Container */}
        <div className="flex flex-col gap-4 bg-[#1e1e1e] p-4 rounded-3xl border border-neutral-800/80 shadow-xl font-sans">
          {/* Source Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto">
            <button
              onClick={() => setSourceFilter("ALL")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                sourceFilter === "ALL"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "bg-[#141414] text-neutral-400 hover:text-white border border-neutral-800"
              }`}
            >
              All Vendors
            </button>
            <button
              onClick={() => setSourceFilter("PLATFORM_REGISTERED")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                sourceFilter === "PLATFORM_REGISTERED"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 font-semibold"
                  : "bg-[#141414] text-neutral-400 hover:text-white border border-neutral-800"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Platform Registered</span>
            </button>
            <button
              onClick={() => setSourceFilter("MANUALLY_ADDED")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                sourceFilter === "MANUALLY_ADDED"
                  ? "bg-neutral-700 text-white font-semibold"
                  : "bg-[#141414] text-neutral-400 hover:text-white border border-neutral-800"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>My Organization Vendors</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
              <input
                type="text"
                placeholder="Search vendors by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition"
              />
            </form>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Filter className="w-3.5 h-3.5 text-neutral-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[#141414] border border-neutral-800 rounded-2xl text-xs font-semibold text-white focus:outline-none focus:border-neutral-500 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between font-sans">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Vendors Table */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl shadow-2xl overflow-hidden font-sans">
          {vendors.length === 0 ? (
            <div className="p-12 text-center text-neutral-400">
              <Building2 className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <h3 className="font-serif text-lg text-white mb-1">No Vendors Found</h3>
              <p className="text-xs text-neutral-400">Try adjusting search query or source filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#181818] border-b border-neutral-800/80 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                    <th className="py-4 px-6">Vendor Name</th>
                    <th className="py-4 px-6">Source / Type</th>
                    <th className="py-4 px-6">Email / Phone</th>
                    <th className="py-4 px-6">Tax ID / City</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-xs">
                  {vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-[#242424] transition">
                      <td className="py-4 px-6">
                        <Link href={`/buyer/vendors/${v.id}`} className="font-semibold text-white hover:text-blue-400 transition">
                          {v.name}
                        </Link>
                        {v.legalName && <div className="text-[11px] text-neutral-500">{v.legalName}</div>}
                      </td>
                      <td className="py-4 px-6">
                        {v.source === "PLATFORM_REGISTERED" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono font-bold text-[10px] tracking-wide">
                            <ShieldCheck className="w-3 h-3 text-indigo-400" />
                            PLATFORM REGISTERED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#282828] border border-neutral-700/60 text-neutral-400 font-mono text-[10px]">
                            MANUALLY ADDED
                          </span>
                        )}
                        {v.hasVendorPortal && (
                          <div className="text-[10px] font-mono font-bold text-emerald-400 mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Portal Active
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-neutral-200 font-medium">{v.email || "—"}</div>
                        <div className="text-[11px] text-neutral-500">{v.phone || "—"}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-mono text-neutral-300">{v.taxId || "—"}</div>
                        <div className="text-[11px] text-neutral-500">{v.city ? `${v.city}, ${v.country || ''}` : "—"}</div>
                      </td>
                      <td className="py-4 px-6">
                        {v.buyerVendorStatus === "ACTIVE" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            ACTIVE
                          </span>
                        )}
                        {v.buyerVendorStatus === "INACTIVE" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#282828] border border-neutral-700/60 text-neutral-400 font-mono font-bold text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                            INACTIVE
                          </span>
                        )}
                        {v.buyerVendorStatus === "PENDING" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/buyer/vendors/${v.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#242424] hover:bg-[#2e2e2e] border border-neutral-700/60 text-neutral-200 font-semibold text-xs transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl font-sans">
            <h3 className="font-serif text-xl font-normal text-white mb-1">Add New Vendor</h3>
            <p className="text-xs text-neutral-400 mb-5">
              Enter supplier details to add them to {organization?.name}&apos;s vendor catalog.
            </p>

            <form onSubmit={handleCreateVendor} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1">Vendor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell Technologies"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1">Legal Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dell India Pvt Ltd"
                    value={formLegalName}
                    onChange={(e) => setFormLegalName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1">Tax ID / GSTIN</label>
                  <input
                    type="text"
                    placeholder="e.g. GSTIN12345"
                    value={formTaxId}
                    onChange={(e) => setFormTaxId(e.target.value)}
                    className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="sales@dell.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Bangalore"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="India"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-white hover:bg-neutral-200 text-black rounded-full font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : "Create Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
