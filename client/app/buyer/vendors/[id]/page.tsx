"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import {
  Building2,
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Plus,
  Trash2,
  Send,
  UserCheck,
  CheckCircle2,
  XCircle,
  LogOut,
  Edit,
} from "lucide-react";

interface VendorContact {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  designation?: string | null;
}

interface VendorDetail {
  id: string;
  name: string;
  legalName?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  taxId?: string | null;
  registrationNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  buyerVendorStatus: string;
  contacts: VendorContact[];
}

export default function BuyerVendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const vendorId = resolvedParams.id;

  const { user, organization, role, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Contact Modal State
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactDesignation, setContactDesignation] = useState<string>("");

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [inviteName, setInviteName] = useState<string>("");

  const fetchVendorDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<VendorDetail>(`/vendors/${vendorId}`);
      if (res.success && res.data) {
        setVendor(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load vendor details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else {
        fetchVendorDetail();
      }
    }
  }, [authLoading, isAuthenticated, vendorId, router]);

  const handleToggleStatus = async () => {
    if (!vendor) return;
    const newStatus = vendor.buyerVendorStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient(`/vendors/${vendorId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        setSuccess(`Vendor relationship status updated to ${newStatus}`);
        fetchVendorDetail();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update vendor status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) {
      setError("Contact name is required");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient(`/vendors/${vendorId}/contacts`, {
        method: "POST",
        body: JSON.stringify({
          name: contactName.trim(),
          email: contactEmail.trim() || undefined,
          phone: contactPhone.trim() || undefined,
          designation: contactDesignation.trim() || undefined,
        }),
      });

      if (res.success) {
        setShowContactModal(false);
        setContactName("");
        setContactEmail("");
        setContactPhone("");
        setContactDesignation("");
        setSuccess("Vendor contact added successfully");
        fetchVendorDetail();
      }
    } catch (err: any) {
      setError(err.message || "Failed to add contact");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this vendor contact?")) return;
    setSubmitting(true);
    try {
      const res = await apiClient(`/vendors/${vendorId}/contacts/${contactId}`, {
        method: "DELETE",
      });
      if (res.success) {
        setSuccess("Contact deleted successfully");
        fetchVendorDetail();
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete contact");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) {
      setError("Name and email are required");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient(`/vendors/${vendorId}/invite`, {
        method: "POST",
        body: JSON.stringify({
          email: inviteEmail.trim(),
          name: inviteName.trim(),
        }),
      });

      if (res.success) {
        setShowInviteModal(false);
        setInviteEmail("");
        setInviteName("");
        setSuccess(`Vendor invitation sent successfully to ${inviteEmail}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to send vendor invitation");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading vendor profile...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !vendor) return null;

  const canManage = role === "ORG_ADMIN" || role === "PROCUREMENT";

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
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Top Link */}
        <Link
          href="/buyer/vendors"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Vendor Directory</span>
        </Link>

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

        {/* Vendor Profile Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
                  Vendor Profile
                </span>
                {vendor.buyerVendorStatus === "ACTIVE" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    ACTIVE
                  </span>
                )}
                {vendor.buyerVendorStatus === "INACTIVE" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-600 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    INACTIVE
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">{vendor.name}</h1>
              {vendor.legalName && (
                <p className="text-xs text-slate-500 mt-1 font-medium">{vendor.legalName}</p>
              )}
            </div>

            {canManage && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-3.5 py-2 bg-[#2383E2] hover:bg-[#1D72C9] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Invite Vendor Portal</span>
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={submitting}
                  className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {vendor.buyerVendorStatus === "ACTIVE" ? (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                      <span>Deactivate</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Activate</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Key Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-bold text-[10px] uppercase mb-1">Email Address</span>
              <span className="font-semibold text-slate-950 truncate block">{vendor.email || "Not specified"}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-bold text-[10px] uppercase mb-1">Phone Number</span>
              <span className="font-semibold text-slate-950">{vendor.phone || "Not specified"}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-bold text-[10px] uppercase mb-1">Tax ID / GSTIN</span>
              <span className="font-mono font-semibold text-slate-950">{vendor.taxId || "Not specified"}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-400 block font-bold text-[10px] uppercase mb-1">Location</span>
              <span className="font-semibold text-slate-950">
                {vendor.city ? `${vendor.city}, ${vendor.country || ""}` : "Not specified"}
              </span>
            </div>
          </div>

          {/* Contacts Section */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-950 text-base">Vendor Contacts</h3>
                <p className="text-xs text-slate-500">Key representatives & sales contacts at {vendor.name}</p>
              </div>

              {canManage && (
                <button
                  onClick={() => setShowContactModal(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Contact</span>
                </button>
              )}
            </div>

            {vendor.contacts.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                No contacts listed for this vendor yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vendor.contacts.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-950 text-xs">{c.name}</h4>
                      {c.designation && <p className="text-[11px] text-[#2383E2] font-medium">{c.designation}</p>}
                      <div className="mt-2 space-y-0.5 text-[11px] text-slate-600">
                        {c.email && <div>✉️ {c.email}</div>}
                        {c.phone && <div>📞 {c.phone}</div>}
                      </div>
                    </div>

                    {canManage && (
                      <button
                        onClick={() => handleDeleteContact(c.id)}
                        className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-extrabold text-lg text-slate-950 mb-1">Add Vendor Contact</h3>
            <p className="text-xs text-slate-500 mb-4">Add a key contact person for {vendor.name}.</p>

            <form onSubmit={handleAddContact} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Kumar"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Key Account Manager"
                  value={contactDesignation}
                  onChange={(e) => setContactDesignation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="rahul@dell.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#2383E2] hover:bg-[#1D72C9] text-white rounded-lg font-semibold cursor-pointer"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Vendor Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-extrabold text-lg text-slate-950 mb-1">Invite Vendor to Portal</h3>
            <p className="text-xs text-slate-500 mb-4">
              Send a secure invitation link to {vendor.name}&apos;s representative to activate their Vendor Portal account.
            </p>

            <form onSubmit={handleSendInvitation} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sales"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@dell.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#2383E2] hover:bg-[#1D72C9] text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
