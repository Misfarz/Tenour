"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  FileText,
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  Save,
  Send,
} from "lucide-react";

interface Department {
  id: string;
  name: string;
}

interface ItemFormState {
  name: string;
  description: string;
  quantity: number;
  estimatedUnitPrice: number;
}

export default function NewPurchaseRequestPage() {
  const { user, organization, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState<boolean>(true);

  // Form Fields
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [justification, setJustification] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");

  // Items State
  const [items, setItems] = useState<ItemFormState[]>([
    { name: "", description: "", quantity: 1, estimatedUnitPrice: 0 },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else {
        apiClient<Department[]>("/organizations/departments")
          .then((res) => {
            if (res.success && res.data) {
              setDepartments(res.data);
            }
          })
          .catch(() => {})
          .finally(() => setLoadingDepts(false));
      }
    }
  }, [authLoading, isAuthenticated, router]);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { name: "", description: "", quantity: 1, estimatedUnitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ItemFormState, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const calculateOverallTotal = () => {
    return items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.estimatedUnitPrice) || 0;
      return sum + qty * price;
    }, 0);
  };

  const handleSubmitForm = async (action: "DRAFT" | "SUBMIT") => {
    setError(null);

    if (!title.trim()) {
      setError("Please provide a title for the purchase request.");
      return;
    }

    if (items.length === 0) {
      setError("Please add at least one item.");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name.trim()) {
        setError(`Item #${i + 1} requires a name.`);
        return;
      }
      if (item.quantity <= 0) {
        setError(`Item #${i + 1} quantity must be greater than 0.`);
        return;
      }
      if (item.estimatedUnitPrice < 0) {
        setError(`Item #${i + 1} estimated price cannot be negative.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      // 1. Create request (starts as DRAFT)
      const res = await apiClient<any>("/purchase-requests", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          justification: justification.trim() || undefined,
          departmentId: departmentId || undefined,
          items: items.map((it) => ({
            name: it.name.trim(),
            description: it.description.trim() || undefined,
            quantity: Number(it.quantity),
            estimatedUnitPrice: Number(it.estimatedUnitPrice),
          })),
        }),
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to save purchase request");
      }

      const createdPrId = res.data.id;

      // 2. If action is SUBMIT, call submit endpoint
      if (action === "SUBMIT") {
        const submitRes = await apiClient(`/purchase-requests/${createdPrId}/submit`, {
          method: "POST",
        });

        if (!submitRes.success) {
          throw new Error(submitRes.message || "Saved as draft, but failed to submit request");
        }
      }

      router.push(`/buyer/purchase-requests/${createdPrId}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingDepts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400">Loading form...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Navbar */}
      <BuyerNavbar activePath="/buyer/purchase-requests" />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Top Link */}
        <Link
          href="/buyer/purchase-requests"
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition self-start font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Purchase Requests</span>
        </Link>

        {/* Form Container */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl font-sans">
          <div className="border-b border-neutral-800/80 pb-6 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono font-extrabold uppercase tracking-widest mb-3">
              <FileText className="w-3.5 h-3.5" />
              <span>New Requisition Form</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">
              Create Purchase Request
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1.5 font-sans">
              Fill in the request details and items required for your department.
            </p>
          </div>

          {error && (
            <div className="p-4 mb-6 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between font-sans">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
            </div>
          )}

          <form className="space-y-6 text-xs font-sans" onSubmit={(e) => e.preventDefault()}>
            {/* General Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laptop Purchase for IT Team"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">Target Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white focus:outline-none focus:border-neutral-500 cursor-pointer transition"
                >
                  <option value="">Select Department (Optional)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id} className="bg-[#141414] text-white">
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">Requester</label>
                <input
                  type="text"
                  readOnly
                  value={`${user.name} (${user.email})`}
                  className="w-full px-4 py-3 bg-[#141414]/50 border border-neutral-800/60 rounded-2xl text-neutral-400 text-xs select-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed description of what is needed..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">Business Justification</label>
                <textarea
                  rows={2}
                  placeholder="Why is this purchase required? (e.g. New employees joining IT)"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition"
                />
              </div>
            </div>

            {/* Items Section */}
            <div className="pt-6 border-t border-neutral-800/80 font-sans">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-xl font-normal text-white flex items-center gap-2">
                    <span>Requested Items</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-mono font-extrabold border border-blue-500/30">
                      {items.length} {items.length === 1 ? "Item" : "Items"}
                    </span>
                  </h3>
                  <p className="text-neutral-400 text-xs mt-1 font-sans">
                    Specify the items, quantities, and estimated unit cost required for this requisition.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2 rounded-full bg-[#242424] hover:bg-[#2e2e2e] border border-neutral-700/60 text-white font-medium text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm font-sans"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Add Another Item</span>
                </button>
              </div>

              {/* Items Card List */}
              <div className="space-y-4 font-sans">
                {items.map((item, index) => {
                  const qty = Number(item.quantity) || 0;
                  const price = Number(item.estimatedUnitPrice) || 0;
                  const lineTotal = qty * price;

                  return (
                    <div
                      key={index}
                      className="p-5 rounded-3xl border border-neutral-800 bg-[#141414] shadow-md hover:border-neutral-700 transition flex flex-col gap-4 relative"
                    >
                      {/* Item Header */}
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-white text-black font-mono font-extrabold text-xs flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                            Line Item #{index + 1}
                          </span>
                        </div>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-neutral-400 hover:text-red-400 hover:bg-red-950/30 px-3 py-1 rounded-full transition flex items-center gap-1 text-xs cursor-pointer"
                            title="Remove line item"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            <span className="font-medium text-red-400">Remove</span>
                          </button>
                        )}
                      </div>

                      {/* Main Input Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Field 1: Item Name */}
                        <div className="md:col-span-5">
                          <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">
                            Item Name / Title <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Dell XPS 15 Workstation Laptop"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, "name", e.target.value)}
                            className="w-full px-4 py-3 bg-[#1e1e1e] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition"
                          />
                        </div>

                        {/* Field 2: Quantity */}
                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">
                            Quantity <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="number"
                            min={1}
                            required
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                            className="w-full px-4 py-3 bg-[#1e1e1e] border border-neutral-800 rounded-2xl text-xs text-white font-mono focus:outline-none focus:border-neutral-500 transition"
                          />
                        </div>

                        {/* Field 3: Estimated Unit Price */}
                        <div className="md:col-span-3">
                          <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">
                            Est. Unit Price (₹) <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-3 text-neutral-500 font-mono text-xs">₹</span>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              required
                              placeholder="0.00"
                              value={item.estimatedUnitPrice || ""}
                              onChange={(e) => handleItemChange(index, "estimatedUnitPrice", e.target.value)}
                              className="w-full pl-8 pr-4 py-3 bg-[#1e1e1e] border border-neutral-800 rounded-2xl text-xs text-white font-mono focus:outline-none focus:border-neutral-500 transition"
                            />
                          </div>
                        </div>

                        {/* Line Subtotal Display */}
                        <div className="md:col-span-2 bg-[#1e1e1e] border border-neutral-800 rounded-2xl p-3 flex flex-col justify-center items-end font-sans">
                          <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 mb-0.5">Line Total</span>
                          <span className="font-mono font-bold text-white text-sm">
                            ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Field 4: Optional Specifications / Technical Notes */}
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">
                          Item Specifications & Technical Notes <span className="text-neutral-500 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Intel Core i9, 32GB RAM, 1TB SSD, 3-Year Onsite Warranty..."
                          value={item.description}
                          onChange={(e) => handleItemChange(index, "description", e.target.value)}
                          className="w-full px-4 py-3 bg-[#1e1e1e] border border-neutral-800 rounded-2xl text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overall Estimated Total Summary Card */}
              <div className="mt-6 p-6 rounded-3xl bg-[#141414] border border-neutral-800 flex items-center justify-between shadow-xl font-sans">
                <div>
                  <span className="font-mono text-neutral-400 text-xs uppercase tracking-wider block">
                    Total Estimated Budget
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Sum of all line items ({items.length} {items.length === 1 ? "item" : "items"})
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
                    ₹{calculateOverallTotal().toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit / Save Draft Actions */}
            <div className="pt-6 border-t border-neutral-800/80 flex items-center justify-end gap-3 font-sans">
              <Link
                href="/buyer/purchase-requests"
                className="px-5 py-2.5 bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 rounded-full text-xs font-medium transition"
              >
                Cancel
              </Link>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitForm("DRAFT")}
                className="px-5 py-2.5 bg-[#242424] hover:bg-[#2e2e2e] border border-neutral-700/60 text-white rounded-full font-medium text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Save className="w-3.5 h-3.5 text-neutral-300" />}
                <span>Save Draft</span>
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitForm("SUBMIT")}
                className="px-6 py-2.5 bg-white hover:bg-neutral-200 text-black rounded-full font-semibold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : <Send className="w-3.5 h-3.5 text-black" />}
                <span>Submit Request</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
