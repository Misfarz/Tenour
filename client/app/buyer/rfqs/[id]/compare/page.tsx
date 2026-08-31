"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  ArrowLeft,
  Loader2,
  Award,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  Truck,
  IndianRupee,
} from "lucide-react";

interface QuotationItem {
  id: string;
  rfqItemId: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  tax: number;
  totalPrice: number;
}

interface VendorOffer {
  vendorId: string;
  vendorName: string;
  quotationId: string;
  unitPrice: number | null;
  quantity: number | null;
  discount: number | null;
  tax: number | null;
  totalPrice: number | null;
}

interface MatrixItem {
  rfqItemId: string;
  itemName: string;
  requiredQuantity: number;
  unit?: string | null;
  specifications?: string | null;
  vendorOffers: VendorOffer[];
}

interface QuotationSummary {
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
  validUntil?: string | null;
  submittedAt?: string | null;
  vendor: {
    id: string;
    name: string;
    email?: string | null;
  };
  items: QuotationItem[];
}

interface RfqComparisonData {
  rfq: {
    id: string;
    rfqNumber: string;
    title: string;
    status: string;
    quotationDeadline: string;
    itemsCount: number;
  };
  quotations: QuotationSummary[];
  itemMatrix: MatrixItem[];
}

export default function BuyerRfqComparePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const rfqId = resolvedParams.id;

  const router = useRouter();
  const { user, role, isLoading: authLoading, isAuthenticated } = useAuth();

  const [comparisonData, setComparisonData] = useState<RfqComparisonData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<QuotationSummary | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<RfqComparisonData>(`/rfqs/${rfqId}/compare`);
      if (res.success && res.data) {
        setComparisonData(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load quotation comparison");
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
        fetchComparison();
      }
    }
  }, [authLoading, isAuthenticated, rfqId, role, router]);

  const handleSelectWinnerConfirm = async () => {
    if (!selectedWinner) return;
    setSelectingId(selectedWinner.id);
    setError(null);
    setSuccess(null);

    try {
      const res = await apiClient<any>(`/quotations/${selectedWinner.id}/select`, {
        method: "POST",
      });

      if (res.success) {
        setSuccess(`Successfully selected ${selectedWinner.vendor.name} as the winning vendor!`);
        setModalOpen(false);
        fetchComparison();
      }
    } catch (err: any) {
      setError(err.message || "Failed to select winning vendor");
    } finally {
      setSelectingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading side-by-side comparison...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !comparisonData) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] p-10 flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Comparison Data Unavailable</h2>
        <p className="text-xs text-slate-500 mb-4">{error || "No quotations available to compare for this RFQ."}</p>
        <Link href="/buyer/rfqs" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
          Back to RFQs
        </Link>
      </div>
    );
  }

  const { rfq, quotations, itemMatrix } = comparisonData;
  const lowestPriceQuote =
    quotations.length > 0
      ? [...quotations].sort((a, b) => a.totalAmount - b.totalAmount)[0]
      : null;

  const hasWinner = quotations.some((q) => q.status === "SELECTED");

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Buyer Header Navbar */}
      <BuyerNavbar activePath="/buyer/rfqs" />

      {/* Secondary Subnav */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link
            href={`/buyer/rfqs/${rfqId}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to RFQ Detail</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#2383E2] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
              {rfq.rfqNumber}
            </span>
            <span className="text-xs font-bold text-slate-700">{rfq.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">Side-by-Side Quotation Comparison</h1>
            <p className="text-slate-500 text-xs mt-1">
              Compare financial proposals, commercial terms, and delivery timelines across all submitted vendors.
            </p>
          </div>

          {lowestPriceQuote && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-3 text-xs">
              <Award className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Lowest Quoted Price</span>
                <span className="font-extrabold text-emerald-950">
                  {lowestPriceQuote.vendor.name} (₹{lowestPriceQuote.totalAmount.toLocaleString("en-IN")})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Empty State */}
        {quotations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm mb-1">No Submitted Quotations Yet</h3>
            <p className="text-xs text-slate-500">No vendors have submitted completed quotations for this RFQ yet.</p>
          </div>
        ) : (
          /* Side-by-Side Matrix Table */
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white divide-x divide-slate-800">
                    <th className="py-4 px-6 w-56 font-extrabold uppercase tracking-wider text-[11px] bg-slate-950">
                      Evaluation Criteria
                    </th>
                    {quotations.map((q) => (
                      <th key={q.id} className="py-4 px-6 min-w-[240px] align-top">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-slate-400">{q.quotationNumber}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                q.status === "SELECTED"
                                  ? "bg-emerald-500 text-white"
                                  : q.status === "REJECTED"
                                  ? "bg-red-900/60 text-red-300"
                                  : "bg-blue-600 text-white"
                              }`}
                            >
                              {q.status}
                            </span>
                          </div>
                          <h3 className="font-black text-white text-base tracking-tight">{q.vendor.name}</h3>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {/* Total Price Row */}
                  <tr className="bg-slate-50 font-bold divide-x divide-slate-200">
                    <td className="py-4 px-6 font-extrabold text-slate-950 text-xs uppercase bg-slate-100/80">
                      Total Quoted Amount (₹)
                    </td>
                    {quotations.map((q) => (
                      <td key={q.id} className="py-4 px-6">
                        <div className="text-xl font-black text-slate-950">
                          ₹{q.totalAmount.toLocaleString("en-IN")}
                        </div>
                        {lowestPriceQuote?.id === q.id && (
                          <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                            ★ Lowest Price
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Subtotal Row */}
                  <tr className="divide-x divide-slate-100">
                    <td className="py-3 px-6 font-semibold text-slate-600 bg-slate-50/50">Subtotal</td>
                    {quotations.map((q) => (
                      <td key={q.id} className="py-3 px-6 font-semibold text-slate-900">
                        ₹{q.subtotal.toLocaleString("en-IN")}
                      </td>
                    ))}
                  </tr>

                  {/* Discount Row */}
                  <tr className="divide-x divide-slate-100">
                    <td className="py-3 px-6 font-semibold text-slate-600 bg-slate-50/50">Total Discount</td>
                    {quotations.map((q) => (
                      <td key={q.id} className="py-3 px-6 font-semibold text-emerald-600">
                        - ₹{q.discount.toLocaleString("en-IN")}
                      </td>
                    ))}
                  </tr>

                  {/* Tax Row */}
                  <tr className="divide-x divide-slate-100">
                    <td className="py-3 px-6 font-semibold text-slate-600 bg-slate-50/50">Total Tax</td>
                    {quotations.map((q) => (
                      <td key={q.id} className="py-3 px-6 font-semibold text-slate-700">
                        + ₹{q.tax.toLocaleString("en-IN")}
                      </td>
                    ))}
                  </tr>

                  {/* Delivery Days Row */}
                  <tr className="divide-x divide-slate-100 bg-slate-50/30">
                    <td className="py-3.5 px-6 font-bold text-slate-800 bg-slate-50/50">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Delivery Timeline</span>
                      </div>
                    </td>
                    {quotations.map((q) => (
                      <td key={q.id} className="py-3.5 px-6 font-extrabold text-slate-950">
                        {q.deliveryDays ? `${q.deliveryDays} Days` : "Not specified"}
                      </td>
                    ))}
                  </tr>

                  {/* Warranty Terms Row */}
                  <tr className="divide-x divide-slate-100">
                    <td className="py-3.5 px-6 font-bold text-slate-800 bg-slate-50/50">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Warranty & Support</span>
                      </div>
                    </td>
                    {quotations.map((q) => (
                      <td key={q.id} className="py-3.5 px-6 font-medium text-slate-800">
                        {q.warrantyTerms || "Standard Warranty"}
                      </td>
                    ))}
                  </tr>

                  {/* Payment Terms Row */}
                  <tr className="divide-x divide-slate-100">
                    <td className="py-3.5 px-6 font-bold text-slate-800 bg-slate-50/50">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span>Payment Terms</span>
                      </div>
                    </td>
                    {quotations.map((q) => (
                      <td key={q.id} className="py-3.5 px-6 font-medium text-slate-800">
                        {q.paymentTerms || "Net 30"}
                      </td>
                    ))}
                  </tr>

                  {/* Item Breakdown Section Header */}
                  <tr className="bg-slate-100 border-t border-b border-slate-200">
                    <td
                      colSpan={quotations.length + 1}
                      className="py-3 px-6 font-extrabold text-slate-900 uppercase text-[11px] tracking-wider"
                    >
                      Item-wise Pricing Comparison
                    </td>
                  </tr>

                  {/* Item-wise Comparison Rows */}
                  {itemMatrix.map((item) => (
                    <tr key={item.rfqItemId} className="divide-x divide-slate-100">
                      <td className="py-3.5 px-6 font-bold text-slate-950 bg-slate-50/50">
                        {item.itemName}
                        <div className="text-[10px] text-slate-400 font-normal">
                          Req Qty: {item.requiredQuantity} {item.unit || "PCS"}
                        </div>
                      </td>
                      {item.vendorOffers.map((offer) => (
                        <td key={offer.vendorId} className="py-3.5 px-6">
                          {offer.unitPrice !== null ? (
                            <div>
                              <div className="font-extrabold text-slate-950 text-sm">
                                ₹{offer.unitPrice.toLocaleString("en-IN")} <span className="text-[10px] font-normal text-slate-500">/unit</span>
                              </div>
                              <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                                Total: ₹{(offer.totalPrice || 0).toLocaleString("en-IN")}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Not quoted</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Winner Selection Action Row */}
                  <tr className="bg-slate-50 divide-x divide-slate-200 border-t-2 border-slate-200">
                    <td className="py-5 px-6 font-extrabold text-slate-950 text-xs uppercase bg-slate-100">
                      Selection Action
                    </td>
                    {quotations.map((q) => (
                      <td key={q.id} className="py-5 px-6">
                        {q.status === "SELECTED" ? (
                          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-100 border border-emerald-300 px-4 py-2 rounded-xl font-black text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>WINNING VENDOR SELECTED</span>
                          </div>
                        ) : q.status === "REJECTED" ? (
                          <span className="text-xs font-semibold text-slate-400 italic">Quotation Rejected</span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedWinner(q);
                              setModalOpen(true);
                            }}
                            disabled={hasWinner}
                            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 ${
                              hasWinner
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-[#2383E2] hover:bg-[#1D72C9] text-white cursor-pointer"
                            }`}
                          >
                            <Award className="w-4 h-4" />
                            <span>Select Winner</span>
                          </button>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Winner Confirmation Modal */}
      {modalOpen && selectedWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-sans">
          <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-amber-400">
              <Award className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-serif text-xl font-normal text-white">Confirm Winner Selection</h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Are you sure you want to select <strong className="text-white">{selectedWinner.vendor.name}</strong> as the winning vendor for this RFQ?
            </p>

            <div className="bg-[#141414] p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-mono text-[11px]">Quotation #:</span>
                <span className="font-mono font-bold text-white">{selectedWinner.quotationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-mono text-[11px]">Winning Amount:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">₹{selectedWinner.totalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-mono text-[11px]">Delivery Time:</span>
                <span className="font-semibold text-neutral-300">{selectedWinner.deliveryDays} Days</span>
              </div>
            </div>

            <p className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl font-sans">
              Note: This action will atomically set <strong>{selectedWinner.vendor.name}</strong> to <strong>SELECTED</strong> and automatically reject all other competing vendor quotations.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSelectWinnerConfirm}
                disabled={!!selectingId}
                className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-semibold shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {selectingId ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Award className="w-4 h-4" />}
                <span>Confirm & Select Winner</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
