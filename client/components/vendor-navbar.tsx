"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NotificationBell } from "@/components/notification-bell";
import {
  FileText,
  FileSpreadsheet,
  Package,
  LayoutDashboard,
  LogOut,
  Store,
} from "lucide-react";

interface VendorNavbarProps {
  activePath?: string;
}

export function VendorNavbar({ activePath = "/vendor/dashboard" }: VendorNavbarProps) {
  const router = useRouter();
  const [vendorInfo, setVendorInfo] = useState<{ id: string; name: string; email?: string } | null>(null);

  useEffect(() => {
    const info = localStorage.getItem("vendorInfo");
    if (info) {
      try {
        setVendorInfo(JSON.parse(info));
      } catch (err) {
        // Ignore parse error
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorInfo");
    router.push("/vendor/login");
  };

  const navLinks = [
    {
      label: "Dashboard",
      href: "/vendor/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Assigned RFQs",
      href: "/vendor/rfqs",
      icon: FileText,
    },
    {
      label: "My Quotations",
      href: "/vendor/quotations",
      icon: FileSpreadsheet,
    },
    {
      label: "Purchase Orders",
      href: "/vendor/purchase-orders",
      icon: Package,
    },
  ];

  return (
    <header className="border-b border-neutral-800/80 bg-[#161616]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Brand & Portal Badge */}
        <div className="flex items-center gap-6">
          <Link href="/vendor/dashboard" className="flex items-center gap-2.5 group">
            <span className="text-xl md:text-2xl font-black tracking-[-0.06em] text-white font-sans group-hover:opacity-90 transition">
              Tenour<span className="text-emerald-400 font-mono font-normal">.</span>
            </span>
            <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
              Vendor Portal
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-neutral-800">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activePath === link.href || activePath.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium transition ${
                    isActive
                      ? "bg-white text-black font-semibold shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-[#242424]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Vendor Info & Notification & Logout */}
        <div className="flex items-center gap-3">
          {vendorInfo && (
            <span className="hidden sm:inline-block text-xs font-sans text-neutral-400 font-medium">
              {vendorInfo.name}
            </span>
          )}
          <NotificationBell type="VENDOR" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 text-xs font-sans font-medium border border-neutral-700/60 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
