"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { VendorNavbar } from "@/components/vendor-navbar";
import {
  FileCheck,
  Loader2,
  Eye,
  Building2,
} from "lucide-react";

interface VendorPurchaseOrder {
  id: string;
  poNumber: string;
  quotationId: string;
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
  organization: {
    id: string;
    name: string;
  };
  rfq: {
    id: string;
    rfqNumber: string;
    title: string;
  };
}

export default function VendorPurchaseOrdersPage() {
  const router = useRouter();
  const [vendorInfo, setVendorInfo] = useState<{ id: string; name: string; email?: string } | null>(null);

  const [orders, setOrders] = useState<VendorPurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = selectedStatus === "ALL"
        ? "/vendor/purchase-orders"
        : `/vendor/purchase-orders?status=${selectedStatus}`;

      const res = await apiClient<VendorPurchaseOrder[]>(endpoint);
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load Purchase Orders");
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
        fetchOrders();
      } catch (err) {
        router.push("/vendor/login");
      }
    }
  }, [router, selectedStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30 font-mono";
      case "ACKNOWLEDGED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono font-bold";
      case "REJECTED":
        return "bg-red-500/10 text-red-400 border-red-500/30 font-mono";
      case "CANCELLED":
        return "bg-neutral-800 text-neutral-500 border-neutral-700 font-mono";
      default:
        return "bg-[#282828] text-neutral-400 border-neutral-700/60 font-mono";
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400">Loading received Purchase Orders...</span>
        </div>
      </div>
    );
  }

  if (!vendorInfo) return null;

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Vendor Navigation Navbar */}
      <VendorNavbar activePath="/vendor/purchase-orders" />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Banner */}
        <div className="bg-[#1e1e1e] p-6 sm:p-8 rounded-3xl border border-neutral-800/80 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-extrabold uppercase tracking-widest mb-3">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Purchase Orders</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">Received Purchase Orders</h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1.5 font-sans">
            Review and acknowledge official commercial purchase orders issued by enterprise buyers.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between font-sans">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-sans">
          {["ALL", "SENT", "ACKNOWLEDGED", "REJECTED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-full font-medium transition cursor-pointer ${
                selectedStatus === status
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "bg-[#1e1e1e] text-neutral-400 border border-neutral-800 hover:text-white hover:bg-[#242424]"
              }`}
            >
              {status === "ALL" ? "All Orders" : status}
            </button>
          ))}
        </div>

        {/* PO Cards Grid */}
        {orders.length === 0 ? (
          <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-12 text-center text-neutral-400 shadow-2xl font-sans">
            <FileCheck className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="font-serif text-lg text-white mb-1">No Purchase Orders Found</h3>
            <p className="text-xs text-neutral-400">
              {selectedStatus === "ALL"
                ? "You currently have no received Purchase Orders."
                : `No Purchase Orders found with status "${selectedStatus}".`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
            {orders.map((po) => (
              <div
                key={po.id}
                className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-5 hover:border-neutral-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                        {po.poNumber}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        RFQ: {po.rfq?.rfqNumber}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(po.status)}`}>
                      {po.status}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-normal text-white mb-2">{po.rfq?.title}</h3>

                  <div className="flex items-center gap-2 text-xs text-neutral-400 mb-3 font-sans">
                    <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Buyer: <strong className="text-white">{po.organization.name}</strong></span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#141414] border border-neutral-800 flex items-center justify-between font-sans">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase block">Total Agreed Price</span>
                      <span className="text-lg font-mono font-bold text-white">
                        ₹{po.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    {po.deliveryDeadline && (
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase block">Deadline</span>
                        <span className="text-xs font-semibold text-neutral-300 font-mono">
                          {new Date(po.deliveryDeadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs font-sans">
                  <span className="text-[11px] text-neutral-500 font-mono">
                    Issued: {po.sentAt ? new Date(po.sentAt).toLocaleDateString() : new Date(po.createdAt).toLocaleDateString()}
                  </span>

                  <Link
                    href={`/vendor/purchase-orders/${po.id}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-md transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-black" />
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
