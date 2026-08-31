"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { VendorNavbar } from "@/components/vendor-navbar";
import {
  ArrowLeft,
  Loader2,
  Save,
  Send,
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
      setError(err.message || "Failed to load RFQ details");
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
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const price = Number(item.unitPrice) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + price * qty;
    }, 0);
  };

  const calculateTotalDiscount = () => {
    return items.reduce((sum, item) => {
      const disc = Number(item.discount) || 0;
      return sum + disc;
    }, 0);
  };

  const calculateTotalTax = () => {
    return items.reduce((sum, item) => {
      const price = Number(item.unitPrice) || 0;
      const qty = Number(item.quantity) || 0;
      const disc = Number(item.discount) || 0;
      const taxRate = Number(item.tax) || 0;
      const taxable = Math.max(0, price * qty - disc);
      return sum + (taxable * taxRate) / 100;
    }, 0);
  };

  const calculateOverallTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateTotalDiscount();
    const tax = calculateTotalTax();
    return Math.max(0, subtotal - discount + tax);
  };

  const handleSaveQuotation = async (shouldSubmit: boolean = false) => {
    setError(null);

    // Validation
    for (const item of items) {
      if (!item.unitPrice || Number(item.unitPrice) <= 0) {
        setError(`Please enter a valid unit price for "${item.name}"`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("vendorToken");

      // 1. Create Quotation Draft
      const body = {
        rfqId,
        currency: "INR",
        deliveryDays: Number(deliveryDays) || null,
        paymentTerms,
        warrantyTerms,
        validUntil,
        notes,
        items: items.map((item) => ({
          rfqItemId: item.rfqItemId,
          unitPrice: Number(item.unitPrice),
          quantity: Number(item.quantity),
          discount: Number(item.discount) || 0,
          tax: Number(item.tax) || 0,
          notes: item.notes,
        })),
      };

      const res = await apiClient<any>("/vendor/quotations", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to create quotation");
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
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400 font-sans">Loading RFQ specifications...</span>
        </div>
      </div>
    );
  }

  if (!vendorInfo || !rfq) {
    return (
      <div className="min-h-screen bg-[#161616] p-10 flex flex-col items-center justify-center text-center text-white font-sans">
        <h2 className="font-serif text-2xl font-normal mb-2">Invalid RFQ Request</h2>
        <p className="text-xs text-neutral-400 mb-6 font-sans">{error || "RFQ not found or not assigned to your account."}</p>
        <Link href="/vendor/rfqs" className="px-6 py-3 bg-white hover:bg-neutral-200 text-black rounded-full text-xs font-semibold shadow-md transition">
          Back to Assigned RFQs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Header */}
      <VendorNavbar activePath="/vendor/quotations" />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Top Link */}
        <Link
          href={`/vendor/rfqs/${rfqId}`}
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition self-start font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to RFQ Detail</span>
        </Link>

        {/* Banner */}
        <div className="bg-[#1e1e1e] p-6 sm:p-8 rounded-3xl border border-neutral-800/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                {rfq.rfqNumber}
              </span>
              <span className="text-xs font-sans text-neutral-400">• Buyer: {rfq.buyer.name}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">Create Commercial Quotation</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSaveQuotation(false)}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 font-medium text-xs border border-neutral-700/60 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-neutral-300" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => handleSaveQuotation(true)}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Send className="w-4 h-4 text-black" />}
              <span>Submit Quotation</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between font-sans">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Commercial Terms Form Card */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 font-sans">
          <h3 className="font-serif text-xl font-normal text-white">Commercial & Delivery Terms</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase mb-1.5">Delivery Time (Days)</label>
              <input
                type="number"
                min={1}
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase mb-1.5">Payment Terms</label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="e.g. Net 30"
                className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase mb-1.5">Warranty Terms</label>
              <input
                type="text"
                value={warrantyTerms}
                onChange={(e) => setWarrantyTerms(e.target.value)}
                placeholder="e.g. 1 Year Onsite"
                className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase mb-1.5">Valid Until</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white focus:outline-none focus:border-neutral-500 transition font-mono"
              />
            </div>
          </div>

          {/* Pricing Table */}
          <div className="pt-6 border-t border-neutral-800/80">
            <h3 className="font-serif text-xl font-normal text-white mb-3">Item Pricing & Discounts</h3>

            <div className="border border-neutral-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#181818] border-b border-neutral-800 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                    <th className="py-3.5 px-4">Item Name</th>
                    <th className="py-3.5 px-4 text-center">Qty</th>
                    <th className="py-3.5 px-4">Unit Price (₹)</th>
                    <th className="py-3.5 px-4">Discount (₹)</th>
                    <th className="py-3.5 px-4">Tax %</th>
                    <th className="py-3.5 px-4 text-right">Item Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {items.map((item, idx) => {
                    const price = Number(item.unitPrice) || 0;
                    const qty = Number(item.quantity) || 0;
                    const disc = Number(item.discount) || 0;
                    const taxRate = Number(item.tax) || 0;
                    const taxable = Math.max(0, price * qty - disc);
                    const itemTotal = taxable + (taxable * taxRate) / 100;

                    return (
                      <tr key={item.rfqItemId} className="hover:bg-[#242424]">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {item.name}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-neutral-300">
                          {item.quantity}
                        </td>
                        <td className="py-3.5 px-4">
                          <input
                            type="number"
                            min={0}
                            placeholder="Unit Price"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value === "" ? "" : Number(e.target.value))}
                            className="w-28 px-3 py-2 bg-[#141414] border border-neutral-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={item.discount}
                            onChange={(e) => handleItemChange(idx, "discount", e.target.value === "" ? "" : Number(e.target.value))}
                            className="w-24 px-3 py-2 bg-[#141414] border border-neutral-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="18"
                            value={item.tax}
                            onChange={(e) => handleItemChange(idx, "tax", e.target.value === "" ? "" : Number(e.target.value))}
                            className="w-20 px-3 py-2 bg-[#141414] border border-neutral-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                          ₹{itemTotal.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total Summary */}
            <div className="mt-4 p-5 rounded-2xl bg-[#141414] border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
              <div className="space-y-1 text-xs text-neutral-400 font-mono">
                <div>Subtotal: ₹{calculateSubtotal().toLocaleString("en-IN")}</div>
                <div>Discount: ₹{calculateTotalDiscount().toLocaleString("en-IN")}</div>
                <div>Est. Tax: ₹{calculateTotalTax().toLocaleString("en-IN")}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Total Quotation Value</span>
                <span className="text-2xl font-mono font-bold text-emerald-400">
                  ₹{calculateOverallTotal().toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
