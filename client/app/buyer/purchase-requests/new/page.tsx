"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import {
  FileText,
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  Save,
  Send,
  Building2,
  LogOut,
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
  const { user, organization, isAuthenticated, isLoading: authLoading, logout } = useAuth();
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
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading form...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

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
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Top Link */}
        <Link
          href="/buyer/purchase-requests"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Purchase Requests</span>
        </Link>

        {/* Form Container */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="border-b border-slate-100 pb-6 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF5FF] border border-[#D0E4FF] text-[#1D72C9] text-xs font-semibold mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>New Requisition Form</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
              Create Purchase Request
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Fill in the request details and items required for your department.
            </p>
          </div>

          {error && (
            <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
            </div>
          )}

          <form className="space-y-6 text-xs" onSubmit={(e) => e.preventDefault()}>
            {/* General Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laptop Purchase for IT Team"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#2383E2]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Target Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#2383E2] cursor-pointer"
                >
                  <option value="">Select Department (Optional)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Requester</label>
                <input
                  type="text"
                  readOnly
                  value={`${user.name} (${user.email})`}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-xs select-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed description of what is needed..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#2383E2]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">Business Justification</label>
                <textarea
                  rows={2}
                  placeholder="Why is this purchase required? (e.g. New employees joining IT)"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#2383E2]"
                />
              </div>
            </div>

            {/* Items Section */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-slate-950 text-sm">Requested Items</h3>
                  <p className="text-slate-500 text-[11px]">Add line items with quantities and estimated unit prices.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#2383E2]" />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => {
                  const lineTotal = (Number(item.quantity) || 0) * (Number(item.estimatedUnitPrice) || 0);

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                          Item #{index + 1}
                        </span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-slate-400 hover:text-red-600 transition p-1 cursor-pointer"
                            title="Remove line item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            required
                            placeholder="Item Name (e.g. Laptop)"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, "name", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-[#2383E2]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <input
                            type="number"
                            min={1}
                            required
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-[#2383E2]"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            required
                            placeholder="Est. Unit Price (₹)"
                            value={item.estimatedUnitPrice}
                            onChange={(e) => handleItemChange(index, "estimatedUnitPrice", Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-[#2383E2]"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center justify-end px-2">
                          <span className="font-extrabold text-slate-950 text-xs">
                            ₹{lineTotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Item specifications / notes (Optional)"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, "description", e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-[11px] focus:outline-none focus:border-[#2383E2]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overall Estimated Total Bar */}
              <div className="mt-6 p-4 rounded-xl bg-[#EDF5FF] border border-[#D0E4FF] flex items-center justify-between">
                <span className="font-bold text-slate-700 text-xs">Overall Estimated Total:</span>
                <span className="text-xl font-extrabold text-[#1D72C9]">
                  ₹{calculateOverallTotal().toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Submit / Save Draft Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                href="/buyer/purchase-requests"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition"
              >
                Cancel
              </Link>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitForm("DRAFT")}
                className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl font-semibold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-slate-600" />}
                <span>Save Draft</span>
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitForm("SUBMIT")}
                className="px-5 py-2.5 bg-[#2383E2] hover:bg-[#1D72C9] text-white rounded-xl font-semibold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Submit Request</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
