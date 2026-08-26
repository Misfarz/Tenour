"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { LogOut, User as UserIcon, Building2, Shield } from "lucide-react";

interface BuyerNavbarProps {
  activePath?: string;
}

export function BuyerNavbar({ activePath }: BuyerNavbarProps) {
  const { user, organization, role, logout } = useAuth();

  const currentRole = typeof role === "string" ? role : (role as any)?.name || "ORG_ADMIN";

  const isRole = (...allowedRoles: string[]) => allowedRoles.includes(currentRole);

  const getRoleBadgeStyle = (r: string) => {
    switch (r) {
      case "ORG_ADMIN":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "PROCUREMENT":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "MANAGER":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "FINANCE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/buyer/dashboard", show: true },
    { label: "Purchase Requests", href: "/buyer/purchase-requests", show: true },
    {
      label: "Approvals",
      href: "/buyer/approvals",
      show: isRole("ORG_ADMIN", "MANAGER"),
    },
    {
      label: "Vendors",
      href: "/buyer/vendors",
      show: isRole("ORG_ADMIN", "PROCUREMENT", "MANAGER", "FINANCE"),
    },
    {
      label: "RFQs & Sourcing",
      href: "/buyer/rfqs",
      show: isRole("ORG_ADMIN", "PROCUREMENT", "FINANCE"),
    },
    {
      label: "User Management",
      href: "/buyer/users",
      show: isRole("ORG_ADMIN"),
    },
    {
      label: "Departments",
      href: "/buyer/departments",
      show: isRole("ORG_ADMIN"),
    },
    {
      label: "Settings",
      href: "/buyer/settings",
      show: isRole("ORG_ADMIN"),
    },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand & Org */}
        <div className="flex items-center gap-3">
          <Link href="/buyer/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md bg-slate-950 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              N
            </div>
            <span className="font-extrabold text-xl text-slate-950 tracking-tight">Tenour</span>
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-semibold text-slate-700 truncate max-w-[140px] sm:max-w-[200px]" title={organization?.name || "Workspace"}>
            {organization?.name || "Workspace"}
          </span>
          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getRoleBadgeStyle(
              currentRole
            )}`}
          >
            {currentRole}
          </span>
        </div>

        {/* Dynamic Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-medium">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const isActive = activePath === item.href || (activePath && activePath.startsWith(item.href) && item.href !== "/buyer/dashboard");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition ${
                    isActive
                      ? "text-[#2383E2] font-extrabold border-b-2 border-[#2383E2] py-5"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
        </nav>

        {/* Right User Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-slate-700 font-medium">
            <UserIcon className="w-3.5 h-3.5 text-[#2383E2]" />
            <span className="truncate max-w-[160px]">{user?.email}</span>
          </div>

          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden bg-slate-50 border-t border-slate-200 px-6 py-2 flex items-center gap-4 overflow-x-auto text-xs font-medium text-slate-600">
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const isActive = activePath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap transition ${
                  isActive ? "text-[#2383E2] font-bold" : "hover:text-slate-950"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
      </div>
    </header>
  );
}
