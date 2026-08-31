"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import {
  FileCheck,
  Loader2,
  LogOut,
  Eye,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  Truck,
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
      const token = localStorage.getItem("vendorToken");
      const endpoint = selectedStatus === "ALL"
        ? "/vendor/purchase-orders"
        : `/vendor/purchase-orders?status=${selectedStatus}`;

      const res = await apiClient<VendorPurchaseOrder[]>(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const handleLogout = () => {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorInfo");
    router.push("/vendor/login");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-blue-50 text-blue-700 border-blue-200 font-bold";
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

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading received Purchase Orders...</span>
        </div>
      </div>
    );
  }

  if (!vendorInfo) return null;

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/vendor/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-md bg-[#2383E2] flex items-center justify-center text-white font-black text-lg shadow-sm">
                V
              </div>
              <span className="font-extrabold text-xl text-slate-950 tracking-tight">Vendor Portal</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-bold text-[#2383E2]">{vendorInfo.name}</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            <Link href="/vendor/dashboard" className="hover:text-slate-950 transition">Dashboard</Link>
            <Link href="/vendor/rfqs" className="hover:text-slate-950 transition">Assigned RFQs</Link>
            <Link href="/vendor/quotations" className="hover:text-slate-950 transition">Quotations</Link>
            <Link href="/vendor/purchase-orders" className="text-[#2383E2] font-semibold">Purchase Orders</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">Received Purchase Orders</h1>
            <p className="text-slate-500 text-xs mt-1">
              Review and acknowledge official commercial purchase orders issued by enterprise buyers.
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {["ALL", "SENT", "ACKNOWLEDGED", "REJECTED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-xl font-bold border transition cursor-pointer ${
                selectedStatus === status
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {status === "ALL" ? "All Orders" : status}
            </button>
          ))}
        </div>

        {/* PO Cards Grid */}
        {orders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
            <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm mb-1">No Purchase Orders Found</h3>
            <p className="text-xs text-slate-500">
              {selectedStatus === "ALL"
                ? "You currently have no received Purchase Orders."
                : `No Purchase Orders found with status "${selectedStatus}".`}
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
                    <span>Buyer: <strong className="text-slate-900">{po.organization.name}</strong></span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Agreed Price</span>
                      <span className="text-lg font-black text-slate-950">
                        ₹{po.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    {po.deliveryDeadline && (
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Deadline</span>
                        <span className="text-xs font-bold text-slate-700">
                          {new Date(po.deliveryDeadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Issued: {po.sentAt ? new Date(po.sentAt).toLocaleDateString() : new Date(po.createdAt).toLocaleDateString()}
                  </span>

                  <Link
                    href={`/vendor/purchase-orders/${po.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs shadow-sm transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Purchase Order</span>
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
