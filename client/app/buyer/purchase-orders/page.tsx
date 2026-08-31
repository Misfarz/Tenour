"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  FileCheck,
  Loader2,
  Eye,
  Calendar,
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Truck,
} from "lucide-react";

interface BuyerPurchaseOrder {
  id: string;
  poNumber: string;
  quotationId: string;
  vendorId: string;
  rfqId: string;
  status: string;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  deliveryAddress?: string | null;
  deliveryDeadline?: string | null;
  paymentTerms?: string | null;
  sentAt?: string | null;
  acknowledgedAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
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
}

export default function BuyerPurchaseOrdersPage() {
  const router = useRouter();
  const { user, role, isLoading: authLoading, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState<BuyerPurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = "/purchase-orders?";
      const params = new URLSearchParams();
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);
      if (search.trim()) params.append("search", search.trim());

      const res = await apiClient<BuyerPurchaseOrder[]>(`${endpoint}${params.toString()}`);
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load purchase orders");
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
        fetchOrders();
      }
    }
  }, [authLoading, isAuthenticated, role, router, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "SENT":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ACKNOWLEDGED":
        return "bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-500 border-gray-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (authLoading || (loading && orders.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading purchase orders...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Buyer Navbar */}
      <BuyerNavbar activePath="/buyer/purchase-orders" />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Header Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">Purchase Orders (POs)</h1>
            <p className="text-slate-500 text-xs mt-1">
              Official commercial purchase orders generated from winning vendor quotations.
            </p>
          </div>

          <Link
            href="/buyer/quotations"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition"
          >
            <span>View Selected Quotations</span>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Search & Status Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by PO #, vendor name, or RFQ title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#2383E2]"
            />
          </form>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {["ALL", "DRAFT", "SENT", "ACKNOWLEDGED", "REJECTED", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                  selectedStatus === status
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {status === "ALL" ? "All POs" : status}
              </button>
            ))}
          </div>
        </div>

        {/* PO Cards Grid */}
        {orders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
            <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm mb-1">No Purchase Orders Found</h3>
            <p className="text-xs text-slate-500">
              {selectedStatus === "ALL"
                ? "No purchase orders created yet. Select a winning vendor quotation to generate a PO."
                : `No purchase orders found matching status "${selectedStatus}".`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((po) => (
              <div
                key={po.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4 hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-extrabold text-[#2383E2] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                        {po.poNumber}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        RFQ: {po.rfq?.rfqNumber}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(po.status)}`}>
                      {po.status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-950 text-base mb-1">{po.rfq?.title}</h3>

                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Vendor: <strong className="text-slate-900">{po.vendor.name}</strong></span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Order Amount</span>
                      <span className="text-lg font-black text-slate-950">
                        ₹{po.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    {po.deliveryDeadline && (
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Delivery Deadline</span>
                        <span className="text-xs font-bold text-slate-700">
                          {new Date(po.deliveryDeadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Created: {new Date(po.createdAt).toLocaleDateString()}
                  </span>

                  <Link
                    href={`/buyer/purchase-orders/${po.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Order</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
