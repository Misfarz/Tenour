"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import {
  ArrowLeft,
  Loader2,
  Building2,
  Calendar,
  IndianRupee,
  Save,
  Send,
  Info,
  CheckCircle2,
} from "lucide-react";

interface RfqItem {
  id: string;
  name: string;
  description?: string | null;
  quantity: number;
  unit?: string | null;
  specifications?: string | null;
}

interface RfqDetail {
  id: string;
  rfqNumber: string;
  title: string;
  description?: string | null;
  status: string;
  quotationDeadline: string;
  deliveryRequirement?: string | null;
  buyer: {
    id: string;
    name: string;
  };
  items: RfqItem[];
}

interface FormItemState {
  rfqItemId: string;
  name: string;
  requiredQuantity: number;
  unitPrice: number | "";
  quantity: number;
  discount: number | "";
  tax: number | "";
  notes: string;
}

export default function NewQuotationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rfqId = searchParams.get("rfqId");

  const [vendorInfo, setVendorInfo] = useState<{ id: string; name: string } | null>(null);
  const [rfq, setRfq] = useState<RfqDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [deliveryDays, setDeliveryDays] = useState<number | "">(15);
  const [paymentTerms, setPaymentTerms] = useState<string>("Net 30");
  const [warrantyTerms, setWarrantyTerms] = useState<string>("2 Years Onsite Warranty");
  const [validUntil, setValidUntil] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState<string>("");
  const [items, setItems] = useState<FormItemState[]>([]);

  const fetchRfqDetail = async () => {
    if (!rfqId) {
      setError("No RFQ specified");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("vendorToken");
      const res = await apiClient<RfqDetail>(`/vendor/rfqs/${rfqId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.success && res.data) {
        setRfq(res.data);
        const initialFormItems: FormItemState[] = res.data.items.map((item) => ({
          rfqItemId: item.id,
          name: item.name,
          requiredQuantity: item.quantity,
          unitPrice: "",
          quantity: item.quantity,
          discount: 0,
          tax: 0,
          notes: "",
        }));
        setItems(initialFormItems);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load RFQ specifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("vendorToken");
    const info = localStorage.getItem("vendorInfo");

    if (!token || !info) {
      router.push("/vendor/login");
    } else {
      try {
        setVendorInfo(JSON.parse(info));
        fetchRfqDetail();
      } catch (err) {
        router.push("/vendor/login");
      }
    }
  }, [rfqId, router]);

  const handleItemChange = (index: number, field: keyof FormItemState, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Calculations
  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    items.forEach((item) => {
      const uPrice = Number(item.unitPrice) || 0;
      const qty = Number(item.quantity) || 1;
      const disc = Number(item.discount) || 0;
      const tx = Number(item.tax) || 0;

      subtotal += uPrice * qty;
      totalDiscount += disc;
      totalTax += tx;
    });

    const grandTotal = Math.max(0, subtotal - totalDiscount + totalTax);

    return {
      subtotal,
      totalDiscount,
      totalTax,
      grandTotal,
    };
  };

  const totals = calculateTotals();

  const handleSaveQuotation = async (shouldSubmit: boolean = false) => {
    if (!rfqId) return;
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("vendorToken");
      const formattedItems = items.map((item) => ({
        rfqItemId: item.rfqItemId,
        unitPrice: Number(item.unitPrice) || 0,
        quantity: Number(item.quantity) || 1,
        discount: Number(item.discount) || 0,
        tax: Number(item.tax) || 0,
        notes: item.notes || null,
      }));

      const payload = {
        rfqId,
        deliveryDays: deliveryDays !== "" ? Number(deliveryDays) : null,
        paymentTerms: paymentTerms || null,
        warrantyTerms: warrantyTerms || null,
        validUntil: validUntil ? new Date(validUntil).toISOString() : null,
        notes: notes || null,
        items: formattedItems,
      };

      // 1. Create Quotation Draft
      const res = await apiClient<any>("/vendor/quotations", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to save quotation");
      }

      const quotationId = res.data.id;

      // 2. Submit if requested
      if (shouldSubmit) {
        const submitRes = await apiClient<any>(`/vendor/quotations/${quotationId}/submit`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!submitRes.success) {
          throw new Error(submitRes.message || "Failed to submit quotation");
        }
      }

      router.push("/vendor/quotations");
    } catch (err: any) {
      setError(err.message || "Failed to save quotation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading RFQ specifications...</span>
        </div>
      </div>
    );
  }

  if (!vendorInfo || !rfq) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] p-10 flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid RFQ Request</h2>
        <p className="text-xs text-slate-500 mb-4">{error || "RFQ not found or not assigned to your account."}</p>
        <Link href="/vendor/rfqs" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
          Back to Assigned RFQs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href={`/vendor/rfqs/${rfqId}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to RFQ</span>
          </Link>
          <div className="text-xs font-bold text-[#2383E2]">{vendorInfo.name}</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-extrabold text-[#2383E2] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                {rfq.rfqNumber}
              </span>
              <span className="text-xs font-bold text-slate-500">• Buyer: {rfq.buyer.name}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">Create Commercial Quotation</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSaveQuotation(false)}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => handleSaveQuotation(true)}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2383E2] hover:bg-[#1D72C9] text-white font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Submit Quotation</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Line Items Pricing Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-base font-extrabold text-slate-950">1. Item-wise Unit Pricing</h2>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">RFQ Item</th>
                  <th className="py-3 px-4">Unit Price (₹)</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Discount (₹)</th>
                  <th className="py-3 px-4">Tax (₹)</th>
                  <th className="py-3 px-4 text-right">Line Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => {
                  const uPrice = Number(item.unitPrice) || 0;
                  const qty = Number(item.quantity) || 1;
                  const disc = Number(item.discount) || 0;
                  const tx = Number(item.tax) || 0;
                  const lineTotal = Math.max(0, uPrice * qty - disc + tx);

                  return (
                    <tr key={item.rfqItemId} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.name}
                        <div className="text-[10px] text-slate-400 font-medium">Req Qty: {item.requiredQuantity}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          placeholder="e.g. 50000"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(index, "unitPrice", e.target.value === "" ? "" : Number(e.target.value))
                          }
                          className="w-32 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", Number(e.target.value))
                          }
                          className="w-20 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          placeholder="0"
                          value={item.discount}
                          onChange={(e) =>
                            handleItemChange(index, "discount", e.target.value === "" ? "" : Number(e.target.value))
                          }
                          className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          placeholder="0"
                          value={item.tax}
                          onChange={(e) =>
                            handleItemChange(index, "tax", e.target.value === "" ? "" : Number(e.target.value))
                          }
                          className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
                        />
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-950 text-sm">
                        ₹{lineTotal.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commercial Terms & Live Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Commercial Terms Form */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-base font-extrabold text-slate-950">2. Commercial Terms & Delivery</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Timeline (Days)</label>
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Terms</label>
                <input
                  type="text"
                  placeholder="e.g. Net 30, 50% Advance"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Warranty & Support Terms</label>
                <input
                  type="text"
                  placeholder="e.g. 3 Years Onsite Warranty"
                  value={warrantyTerms}
                  onChange={(e) => setWarrantyTerms(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quotation Valid Until</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">Notes / Additional Commercial Remarks</label>
              <textarea
                rows={3}
                placeholder="Add any specific exclusions, freight terms, or technical conditions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
              />
            </div>
          </div>

          {/* Live Financial Totals Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-4">
                Financial Summary
              </span>

              <div className="space-y-3 text-xs border-b border-slate-800 pb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="font-semibold text-slate-100">₹{totals.subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Discount:</span>
                  <span className="font-semibold text-emerald-400">- ₹{totals.totalDiscount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Tax:</span>
                  <span className="font-semibold text-slate-100">+ ₹{totals.totalTax.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="pt-4">
                <span className="text-[11px] text-slate-400 block mb-1">Authoritative Grand Total</span>
                <span className="text-3xl font-black text-white tracking-tight">
                  ₹{totals.grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => handleSaveQuotation(true)}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#2383E2] hover:bg-[#1D72C9] text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Submit Quotation</span>
              </button>
              <button
                onClick={() => handleSaveQuotation(false)}
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
