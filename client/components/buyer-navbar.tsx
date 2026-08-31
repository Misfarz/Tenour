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
  FolderGit2,
  Settings,
  LogOut,
  User as UserIcon,
  Building2,
  Shield,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Search,
  Bell
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
          icon: FolderGit2,
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
        return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };

  const renderNavLinks = () => (
    <div className="flex flex-col gap-6 py-4">
      {navGroups.map((group, idx) => {
        const visibleItems = group.items.filter((item) => item.show);
        if (visibleItems.length === 0) return null;

        return (
          <div key={idx} className="flex flex-col gap-1.5">
            <span className="px-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? "bg-[#2383E2] text-white shadow-md shadow-blue-500/20"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
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
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-70 bg-gradient-to-b from-[#0F172A] via-[#0F172A] to-[#090D16] text-slate-200 border-r border-slate-800/80 z-40 shadow-2xl selection:bg-[#2383E2]">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex flex-col gap-3">
          <Link href="/buyer/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2383E2] to-blue-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              N
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-white tracking-tight leading-none">Tenour</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">Procurement OS</span>
            </div>
          </Link>

          {/* Active Workspace Chip */}
          <div className="mt-2 bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-400/20">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-200 truncate" title={organization?.name || "Workspace"}>
                  {organization?.name || "Workspace"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono truncate">{organization?.slug || "org-tenant"}</span>
              </div>
            </div>

            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getRoleBadgeStyle(currentRole)}`}>
              {currentRole}
            </span>
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          {renderNavLinks()}
        </div>

        {/* Sidebar Footer User Profile */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-slate-200 truncate">{user?.name}</span>
              <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 border border-slate-700 text-slate-400 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Sign out of workspace"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Top Bar for Mobile & Quick Header Info */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#0F172A] text-slate-200 border-b border-slate-800 px-4 h-16 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/buyer/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2383E2] flex items-center justify-center text-white font-bold text-sm">
              N
            </div>
            <span className="font-bold text-white text-base">Tenour</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${getRoleBadgeStyle(currentRole)}`}>
            {currentRole}
          </span>
          <button
            onClick={() => logout()}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Slide-Over Side Drawer Backdrop */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Side Panel Content */}
          <div className="relative w-72 bg-[#0F172A] text-slate-200 flex flex-col h-full z-10 shadow-2xl border-r border-slate-800">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2383E2] flex items-center justify-center text-white font-bold text-sm">
                  N
                </div>
                <span className="font-bold text-white text-base">Tenour OS</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
              {renderNavLinks()}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold text-slate-200 truncate">{user?.name}</span>
                  <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400"
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

