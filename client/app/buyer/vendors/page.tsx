"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import {
  Building2,
  Plus,
  Search,
  Filter,
  LogOut,
  Loader2,
  Eye,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
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
  latestInvitation?: VendorInvitation | null;
}

export default function BuyerVendorsPage() {
  const { user, organization, role, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCopyInviteLink = (token: string) => {
    const link = `${window.location.origin}/vendor/accept-invitation?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

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
  }, [authLoading, isAuthenticated, statusFilter, router]);

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
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading vendor directory...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const canManageVendors = role === "ORG_ADMIN" || role === "PROCUREMENT";

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-md bg-slate-950 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
                N
              </div>
              <span className="font-extrabold text-xl text-slate-950 tracking-tight">Tenour</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-slate-600">{organization?.name}</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            <Link href="/buyer/dashboard" className="hover:text-slate-950 transition">Dashboard</Link>
            <Link href="/buyer/purchase-requests" className="hover:text-slate-950 transition">Purchase Requests</Link>
            <Link href="/buyer/vendors" className="text-[#2383E2] font-semibold">Vendors</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">Vendor Management</h1>
            <p className="text-slate-500 text-xs mt-1">
              Directory of qualified suppliers, vendor relationships, and contact contacts for {organization?.name}.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/vendor/login"
              target="_blank"
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
              title="Open Vendor Portal Login (Dev Testing)"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#2383E2]" />
              <span>Vendor Portal Login</span>
            </Link>

            {canManageVendors && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vendor</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendors by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#2383E2]"
            />
          </form>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Vendors Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {vendors.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm mb-1">No Vendors Found</h3>
              <p className="text-xs text-slate-500">Add a new vendor to get started with vendor management.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Vendor Name</th>
                    <th className="py-3.5 px-6">Email / Phone</th>
                    <th className="py-3.5 px-6">Tax ID / City</th>
                    <th className="py-3.5 px-6">Relationship Status</th>
                    <th className="py-3.5 px-6">Dev Invitation Link (Email)</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6">
                        <Link href={`/buyer/vendors/${v.id}`} className="font-bold text-slate-950 hover:text-[#2383E2] transition">
                          {v.name}
                        </Link>
                        {v.legalName && <div className="text-[11px] text-slate-400">{v.legalName}</div>}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-slate-800 font-medium">{v.email || "—"}</div>
                        <div className="text-[11px] text-slate-400">{v.phone || "—"}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-mono text-slate-700">{v.taxId || "—"}</div>
                        <div className="text-[11px] text-slate-400">{v.city ? `${v.city}, ${v.country || ''}` : "—"}</div>
                      </td>
                      <td className="py-4 px-6">
                        {v.buyerVendorStatus === "ACTIVE" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            ACTIVE
                          </span>
                        )}
                        {v.buyerVendorStatus === "INACTIVE" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-600 font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            INACTIVE
                          </span>
                        )}
                        {v.buyerVendorStatus === "PENDING" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {v.latestInvitation ? (
                          <div className="flex flex-col gap-1 items-start">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/vendor/accept-invitation?token=${v.latestInvitation.token}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#2383E2] font-semibold text-[11px] transition"
                                title={`Invited: ${v.latestInvitation.email}`}
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Accept Invite Link</span>
                              </Link>

                              <button
                                onClick={() => handleCopyInviteLink(v.latestInvitation!.token)}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition cursor-pointer"
                                title="Copy invitation link"
                              >
                                {copiedToken === v.latestInvitation.token ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                              {v.latestInvitation.email} {v.latestInvitation.usedAt ? "(Accepted)" : "(Pending)"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium italic">No invite sent</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/buyer/vendors/${v.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs transition"
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
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-xl">
            <h3 className="font-extrabold text-lg text-slate-950 mb-1">Add New Vendor</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter supplier details to add them to {organization?.name}&apos;s vendor catalog.
            </p>

            <form onSubmit={handleCreateVendor} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Vendor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell Technologies"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#2383E2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Legal Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dell India Pvt Ltd"
                    value={formLegalName}
                    onChange={(e) => setFormLegalName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tax ID / GSTIN</label>
                  <input
                    type="text"
                    placeholder="e.g. GSTIN12345"
                    value={formTaxId}
                    onChange={(e) => setFormTaxId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="sales@dell.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Bangalore"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="India"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#2383E2] hover:bg-[#1D72C9] text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
