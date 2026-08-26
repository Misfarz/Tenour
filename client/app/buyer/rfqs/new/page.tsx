"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  FileCode,
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Calendar,
  Building2,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface PurchaseRequestItem {
  id: string;
  name: string;
  description?: string | null;
  quantity: number;
  estimatedUnitPrice: number;
}

interface PurchaseRequest {
  id: string;
  requestNumber: string;
  title: string;
  status: string;
  items: PurchaseRequestItem[];
}

interface Vendor {
  id: string;
  name: string;
  email?: string | null;
  buyerVendorStatus: string;
}

interface RfqItemInput {
  name: string;
  description: string;
  quantity: number;
  unit: string;
  specifications: string;
}

export default function CreateRfqPage() {
  const { user, organization, role, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [approvedPrs, setApprovedPrs] = useState<PurchaseRequest[]>([]);
  const [activeVendors, setActiveVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedPrId, setSelectedPrId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [quotationDeadline, setQuotationDeadline] = useState<string>("");
  const [deliveryRequirement, setDeliveryRequirement] = useState<string>("");
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [items, setItems] = useState<RfqItemInput[]>([]);

  useEffect(() => {
    // Set default deadline to 14 days from now
    const defaultDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setQuotationDeadline(defaultDeadline);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch PRs and Vendors
      const [prsRes, vendorsRes] = await Promise.all([
        apiClient<PurchaseRequest[]>("/purchase-requests"),
        apiClient<Vendor[]>("/vendors?status=ACTIVE"),
      ]);

      if (prsRes.success && prsRes.data) {
        const approved = prsRes.data.filter((p) => p.status === "APPROVED");
        setApprovedPrs(approved);
      }

      if (vendorsRes.success && vendorsRes.data) {
        setActiveVendors(vendorsRes.data.filter((v) => v.buyerVendorStatus === "ACTIVE"));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load requirements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else if (role !== "ORG_ADMIN" && role !== "PROCUREMENT") {
        router.push("/buyer/rfqs");
      } else {
        fetchData();
      }
    }
  }, [authLoading, isAuthenticated, role, router]);

  const handlePrSelect = (prId: string) => {
    setSelectedPrId(prId);
    const pr = approvedPrs.find((p) => p.id === prId);
    if (pr) {
      if (!title) setTitle(`RFQ for ${pr.title}`);
      if (!description) setDescription(`Sourcing requirement generated from Purchase Request ${pr.requestNumber}`);

      // Map PR items to RFQ items
      if (pr.items && pr.items.length > 0) {
        setItems(
          pr.items.map((i) => ({
            name: i.name,
            description: i.description || "",
            quantity: i.quantity,
            unit: "PCS",
            specifications: "",
          }))
        );
      }
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { name: "", description: "", quantity: 1, unit: "PCS", specifications: "" },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof RfqItemInput, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleVendorToggle = (vendorId: string) => {
    if (selectedVendorIds.includes(vendorId)) {
      setSelectedVendorIds(selectedVendorIds.filter((id) => id !== vendorId));
    } else {
      setSelectedVendorIds([...selectedVendorIds, vendorId]);
    }
  };

  const handleSubmit = async (shouldSendImmediately: boolean = false) => {
    if (!selectedPrId) {
      setError("Please select an Approved Purchase Request");
      return;
    }
    if (!title.trim()) {
      setError("RFQ Title is required");
      return;
    }
    if (!quotationDeadline) {
      setError("Quotation deadline is required");
      return;
    }
    if (items.length === 0) {
      setError("RFQ must contain at least one line item");
      return;
    }
    for (const item of items) {
      if (!item.name.trim()) {
        setError("All items must have a name");
        return;
      }
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient<any>("/rfqs", {
        method: "POST",
        body: JSON.stringify({
          purchaseRequestId: selectedPrId,
          title: title.trim(),
          description: description.trim() || undefined,
          quotationDeadline,
          deliveryRequirement: deliveryRequirement.trim() || undefined,
          items: items.map((i) => ({
            name: i.name.trim(),
            description: i.description.trim() || undefined,
            quantity: Number(i.quantity),
            unit: i.unit.trim() || "PCS",
            specifications: i.specifications.trim() || undefined,
          })),
          vendorIds: selectedVendorIds,
        }),
      });

      if (res.success && res.data) {
        const createdRfqId = res.data.id;

        if (shouldSendImmediately) {
          if (selectedVendorIds.length === 0) {
            setError("To send the RFQ immediately, please select at least one active vendor.");
            setSubmitting(false);
            return;
          }
          await apiClient(`/rfqs/${createdRfqId}/send`, { method: "POST" });
        }

        router.push(`/buyer/rfqs/${createdRfqId}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create RFQ");
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading RFQ Creator...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Navbar */}
      <BuyerNavbar activePath="/buyer/rfqs" />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col gap-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">New Sourcing RFQ</h1>
            <p className="text-slate-500 text-xs mt-1">
              Select an approved Purchase Request, specify line items, set quotation deadlines, and select qualified suppliers.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }} className="space-y-6 text-xs">
            {/* Step 1: Select Approved Purchase Request */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
              <label className="block font-bold text-slate-800 text-sm">
                1. Select Approved Purchase Request *
              </label>
              {approvedPrs.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>No approved Purchase Requests available. An RFQ can only be created from an APPROVED request.</span>
                </div>
              ) : (
                <select
                  required
                  value={selectedPrId}
                  onChange={(e) => handlePrSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2383E2]"
                >
                  <option value="">-- Select Approved Purchase Request --</option>
                  {approvedPrs.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.requestNumber} — {pr.title} (Approved)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Step 2: RFQ Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">RFQ Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laptop Purchase Sourcing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2383E2]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quotation Deadline *</label>
                <input
                  type="date"
                  required
                  value={quotationDeadline}
                  onChange={(e) => setQuotationDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2383E2]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Description & Scope</label>
              <textarea
                rows={3}
                placeholder="Detailed explanation of sourcing requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2383E2]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Delivery Requirement</label>
              <input
                type="text"
                placeholder="e.g. Within 30 days of Purchase Order issuance"
                value={deliveryRequirement}
                onChange={(e) => setDeliveryRequirement(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2383E2]"
              />
            </div>

            {/* Step 3: Line Items */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-extrabold text-slate-950 text-sm">2. Sourcing Line Items</h3>
                  <p className="text-[11px] text-slate-500">Items and specifications required from participating vendors.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              {items.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No line items added yet. Click &quot;Add Line Item&quot; or select an Approved Purchase Request to populate items.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-slate-800 text-xs">Item #{idx + 1}</span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            required
                            placeholder="Item Name (e.g. 16-inch Business Laptop)"
                            value={item.name}
                            onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            required
                            min={1}
                            placeholder="Quantity"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Unit (PCS)"
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Technical Specifications (e.g. Core i7, 16GB RAM, 512GB SSD)"
                          value={item.specifications}
                          onChange={(e) => handleItemChange(idx, "specifications", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 4: Select Qualified Vendors */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="font-extrabold text-slate-950 text-sm mb-1">3. Select Qualified Vendors</h3>
              <p className="text-[11px] text-slate-500 mb-3">
                Select active suppliers from {organization?.name}&apos;s vendor catalog to receive this RFQ.
              </p>

              {activeVendors.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  No active vendors found. You can add vendors in the Vendors section.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeVendors.map((vendor) => {
                    const isChecked = selectedVendorIds.includes(vendor.id);
                    return (
                      <label
                        key={vendor.id}
                        onClick={() => handleVendorToggle(vendor.id)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          isChecked
                            ? "bg-blue-50/80 border-[#2383E2] text-slate-950"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 accent-[#2383E2] rounded cursor-pointer"
                          />
                          <div>
                            <div className="font-bold text-xs">{vendor.name}</div>
                            {vendor.email && <div className="text-[11px] text-slate-400">{vendor.email}</div>}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          ACTIVE
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
              <Link
                href="/buyer/rfqs"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition text-xs"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl font-semibold flex items-center gap-1.5 transition text-xs cursor-pointer"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save as Draft</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(true)}
                className="px-5 py-2.5 bg-[#2383E2] hover:bg-[#1D72C9] text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-sm transition text-xs cursor-pointer"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Save & Send RFQ</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
