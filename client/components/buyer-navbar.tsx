"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  FileCode,
  FileSpreadsheet,
  FileCheck,
  Store,
  Users,
  FolderKanban,
  Settings,
  LogOut,
  Building2,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

interface BuyerNavbarProps {
  activePath?: string;
}

export function BuyerNavbar({ activePath }: BuyerNavbarProps) {
  const { user, organization, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentRole = typeof role === "string" ? role : (role as any)?.name || "ORG_ADMIN";
  const isRole = (...allowedRoles: string[]) => allowedRoles.includes(currentRole);

  // Close mobile menu on path change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activePath]);

  const navGroups = [
    {
      groupLabel: "MAIN MENU",
      items: [
        {
          label: "Dashboard",
          href: "/buyer/dashboard",
          icon: LayoutDashboard,
          show: true,
        },
      ],
    },
    {
      groupLabel: "PROCUREMENT",
      items: [
        {
          label: "Purchase Requests",
          href: "/buyer/purchase-requests",
          icon: FileText,
          show: true,
        },
        {
          label: "Approvals",
          href: "/buyer/approvals",
          icon: CheckCircle,
          show: isRole("ORG_ADMIN", "MANAGER"),
        },
        {
          label: "RFQs & Sourcing",
          href: "/buyer/rfqs",
          icon: FileCode,
          show: isRole("ORG_ADMIN", "PROCUREMENT", "FINANCE"),
        },
        {
          label: "Quotations",
          href: "/buyer/quotations",
          icon: FileSpreadsheet,
          show: isRole("ORG_ADMIN", "PROCUREMENT"),
        },
        {
          label: "Purchase Orders",
          href: "/buyer/purchase-orders",
          icon: FileCheck,
          show: isRole("ORG_ADMIN", "PROCUREMENT"),
        },
      ],
    },
    {
      groupLabel: "SUPPLIERS",
      items: [
        {
          label: "Vendor Directory",
          href: "/buyer/vendors",
          icon: Store,
          show: isRole("ORG_ADMIN", "PROCUREMENT", "MANAGER", "FINANCE"),
        },
      ],
    },
    {
      groupLabel: "ADMINISTRATION",
      items: [
        {
          label: "User Management",
          href: "/buyer/users",
          icon: Users,
          show: isRole("ORG_ADMIN"),
        },
        {
          label: "Departments",
          href: "/buyer/departments",
          icon: FolderKanban,
          show: isRole("ORG_ADMIN"),
        },
        {
          label: "Settings",
          href: "/buyer/settings",
          icon: Settings,
          show: isRole("ORG_ADMIN"),
        },
      ],
    },
  ];

  const getRoleBadgeStyle = (r: string) => {
    switch (r) {
      case "ORG_ADMIN":
        return "bg-purple-500/15 text-purple-300 border-purple-400/30";
      case "PROCUREMENT":
        return "bg-blue-500/15 text-blue-300 border-blue-400/30";
      case "MANAGER":
        return "bg-amber-500/15 text-amber-300 border-amber-400/30";
      case "FINANCE":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
      default:
        return "bg-neutral-800 text-neutral-300 border-neutral-700";
    }
  };

  const renderNavLinks = () => (
    <div className="flex flex-col gap-6 py-4">
      {navGroups.map((group, idx) => {
        const visibleItems = group.items.filter((item) => item.show);
        if (visibleItems.length === 0) return null;

        return (
          <div key={idx} className="flex flex-col gap-1.5 font-sans">
            <span className="px-3 text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
              {group.groupLabel}
            </span>
            <div className="flex flex-col gap-1 mt-1">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activePath === item.href ||
                  (activePath &&
                    activePath.startsWith(item.href) &&
                    item.href !== "/buyer/dashboard");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-sans font-medium transition-all group ${
                      isActive
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "text-neutral-400 hover:text-white hover:bg-[#242424]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                        isActive ? "text-black" : "text-neutral-400 group-hover:text-white"
                      }`}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Dynamic CSS Offset to ensure main page content flows next to the sidebar */}
      <style jsx global>{`
        @media (min-width: 1024px) {
          body {
            padding-left: 17.5rem;
          }
        }
      `}</style>

      {/* Desktop Fixed Side Panel Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-70 bg-[#161616] text-neutral-200 border-r border-neutral-800/80 z-40 shadow-2xl selection:bg-white selection:text-black">
        {/* Brand Header */}
        <div className="p-5 border-b border-neutral-800/80 flex items-center justify-between">
          <Link href="/buyer/dashboard" className="flex items-center justify-between w-full group">
            <span className="text-xl md:text-2xl font-black tracking-[-0.06em] text-white font-sans group-hover:opacity-90 transition">
              Tenour<span className="text-[#2383E2] font-mono font-normal">.</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">
              Procurement OS
            </span>
          </Link>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          {renderNavLinks()}
        </div>

        {/* Sidebar Footer User Profile */}
        <div className="p-4 border-t border-neutral-800/80 bg-[#161616] flex items-center justify-between gap-2 font-sans">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-medium text-white truncate">{user?.name}</span>
              <span className="text-[10px] text-neutral-400 truncate">{user?.email}</span>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="w-8 h-8 rounded-full bg-[#242424] hover:bg-[#2e2e2e] border border-neutral-700/60 text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
            title="Sign out of workspace"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Top Bar for Mobile Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#161616] text-white border-b border-neutral-800 px-4 h-16 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-[#242424] text-neutral-300 hover:text-white cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/buyer/dashboard" className="flex items-center gap-2">
            <span className="font-black text-white text-lg tracking-tight">
              Tenour<span className="text-[#2383E2] font-mono">.</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => logout()}
            className="p-2 rounded-xl bg-[#242424] text-neutral-400 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Slide-Over Side Drawer Backdrop */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-72 bg-[#161616] text-white flex flex-col h-full z-10 shadow-2xl border-r border-neutral-800">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <span className="font-black text-white text-lg tracking-tight">
                Tenour<span className="text-[#2383E2] font-mono">.</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl bg-[#242424] text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
              {renderNavLinks()}
            </div>

            <div className="p-4 border-t border-neutral-800 bg-[#161616] flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate font-sans">
                <div className="w-8 h-8 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-medium text-white truncate">{user?.name}</span>
                  <span className="text-[10px] text-neutral-400 truncate">{user?.email}</span>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="p-2 rounded-xl bg-[#242424] text-neutral-400 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
