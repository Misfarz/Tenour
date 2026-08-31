"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  ArrowLeft,
  Loader2,
  Building2,
  Calendar,
  Save,
  Send,
  Info,
  MapPin,
  FileCheck,
} from "lucide-react";

interface QuotationItem {
  id: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  tax: number;
  totalPrice: number;
  rfqItem: {
    name: string;
    description?: string | null;
    unit?: string | null;
  };
}

interface SelectedQuotation {
  id: string;
  quotationNumber: string;
  rfqId: string;
  vendorId: string;
  status: string;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  deliveryDays?: number | null;
  paymentTerms?: string | null;
  warrantyTerms?: string | null;
  notes?: string | null;
  vendor: {
    id: string;
    name: string;
    email?: string | null;
  };
  rfq: {
    id: string;
    rfqNumber: string;
    title: string;
  };
  items: QuotationItem[];
}

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotationId = searchParams.get("quotationId");

  const { user, role, isLoading: authLoading, isAuthenticated } = useAuth();

  const [quotation, setQuotation] = useState<SelectedQuotation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [deliveryDeadline, setDeliveryDeadline] = useState<string>("");
  const [paymentTerms, setPaymentTerms] = useState<string>("Net 30");
  const [notes, setNotes] = useState<string>("");

  const fetchQuotationDetail = async () => {
    if (!quotationId) {
      setError("No selected quotation specified");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<SelectedQuotation>(`/quotations/${quotationId}`);
      if (res.success && res.data) {
        setQuotation(res.data);
        if (res.data.paymentTerms) setPaymentTerms(res.data.paymentTerms);

        // Estimate deadline based on vendor delivery days
        if (res.data.deliveryDays) {
          const deadline = new Date(Date.now() + res.data.deliveryDays * 24 * 60 * 60 * 1000);
          setDeliveryDeadline(deadline.toISOString().split("T")[0]);
        } else {
          const defaultDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
          setDeliveryDeadline(defaultDeadline.toISOString().split("T")[0]);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load selected quotation details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else if (role !== "ORG_ADMIN" && role !== "PROCUREMENT") {
        router.push("/buyer/dashboard");
      } else {
        fetchQuotationDetail();
      }
    }
  }, [authLoading, isAuthenticated, quotationId, role, router]);

  const handleCreatePo = async (shouldSend: boolean = false) => {
    if (!quotationId) return;
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        quotationId,
        deliveryAddress: deliveryAddress.trim() || null,
        deliveryDeadline: deliveryDeadline ? new Date(deliveryDeadline).toISOString() : null,
        paymentTerms: paymentTerms || null,
        notes: notes || null,
      };

      // 1. Create PO Draft
      const res = await apiClient<any>("/purchase-orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to create Purchase Order");
      }

      const poId = res.data.id;

      // 2. Send PO if requested
      if (shouldSend) {
        if (!deliveryAddress.trim()) {
          throw new Error("Delivery address is required before sending the Purchase Order");
        }

        const sendRes = await apiClient<any>(`/purchase-orders/${poId}/send`, {
          method: "POST",
        });

        if (!sendRes.success) {
          throw new Error(sendRes.message || "Failed to send Purchase Order");
        }
      }

      router.push("/buyer/purchase-orders");
    } catch (err: any) {
      setError(err.message || "Failed to create Purchase Order");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading quotation details...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !quotation) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] p-10 flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Selected Quotation</h2>
        <p className="text-xs text-slate-500 mb-4">{error || "The selected quotation could not be loaded."}</p>
        <Link href="/buyer/quotations" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
          Back to Quotations
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Buyer Navbar */}
      <BuyerNavbar activePath="/buyer/purchase-orders" />

      {/* Subheader */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <Link
            href={`/buyer/quotations/${quotationId}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Quotation</span>
          </Link>
          <span className="text-xs font-mono font-bold text-[#2383E2]">
            Selected Quotation: {quotation.quotationNumber}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                ★ WINNING VENDOR: {quotation.vendor.name}
              </span>
              <span className="text-xs font-mono text-slate-400">• RFQ: {quotation.rfq.rfqNumber}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">Create Official Purchase Order</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCreatePo(false)}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft PO</span>
            </button>
            <button
              onClick={() => handleCreatePo(true)}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2383E2] hover:bg-[#1D72C9] text-white font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Create & Send PO</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Delivery & Commercial Details Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-base font-extrabold text-slate-950">1. Delivery & Order Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Delivery Address *</label>
              <textarea
                rows={2}
                placeholder="Enter complete delivery warehouse / facility address..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Required Delivery Deadline</label>
              <input
                type="date"
                value={deliveryDeadline}
                onChange={(e) => setDeliveryDeadline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Agreed Payment Terms</label>
              <input
                type="text"
                placeholder="e.g. Net 30"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Special Delivery & Invoicing Notes</label>
              <textarea
                rows={2}
                placeholder="Add receiving instructions, PO reference numbers, or billing terms..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
              />
            </div>
          </div>
        </div>

        {/* Agreed Item Snapshots & Financial Summary Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-950">2. Item Pricing Snapshot (Agreed Terms)</h2>
            <span className="text-xs font-mono font-bold text-slate-500">Total: ₹{quotation.totalAmount.toLocaleString("en-IN")}</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Agreed Unit Price (₹)</th>
                  <th className="py-3 px-4">Order Qty</th>
                  <th className="py-3 px-4">Discount (₹)</th>
                  <th className="py-3 px-4">Tax (₹)</th>
                  <th className="py-3 px-4 text-right">Total Price (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotation.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.rfqItem?.name}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      ₹{item.unitPrice.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.quantity} {item.rfqItem?.unit || "PCS"}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-600 font-medium">
                      - ₹{item.discount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      + ₹{item.tax.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-950">
                      ₹{item.totalPrice.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
