"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  Bell,
  CheckCheck,
  Check,
  Loader2,
  ExternalLink,
  Sparkles,
  Filter,
} from "lucide-react";

interface NotificationItem {
  id: string;
  recipientType: "BUYER" | "VENDOR";
  title: string;
  message: string;
  type: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function BuyerNotificationsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [markingAll, setMarkingAll] = useState<boolean>(false);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiClient<{ notifications: NotificationItem[]; unreadCount: number }>("/notifications/buyer");
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Ignore error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else {
        fetchNotifications();
      }
    }
  }, [authLoading, isAuthenticated, router]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      // Ignore error
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      const res = await apiClient("/notifications/buyer/mark-all-read", { method: "PATCH" });
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      // Ignore error
    } finally {
      setMarkingAll(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.read;
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400">Loading notifications...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Sidebar Navbar */}
      <BuyerNavbar activePath="/buyer/notifications" />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 font-sans">
        {/* Page Header Card */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 font-sans">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono font-extrabold uppercase tracking-widest mb-3">
              <Bell className="w-3.5 h-3.5" />
              <span>Notifications Center</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">
              System Notifications
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1.5 font-sans">
              Stay up to date with real-time requisition approvals, RFQ sourcing, and order statuses.
            </p>
          </div>

          {/* Action Button */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="px-5 py-2.5 bg-white hover:bg-neutral-200 text-black rounded-full text-xs font-semibold shadow-md transition flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50 font-sans"
            >
              {markingAll ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <CheckCheck className="w-4 h-4 text-black" />
              )}
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        {/* Filter & Counter Header */}
        <div className="flex items-center justify-between gap-4 border-b border-neutral-800/80 pb-4 font-sans">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                filter === "ALL"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "bg-[#242424] text-neutral-400 hover:text-white"
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("UNREAD")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                filter === "UNREAD"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "bg-[#242424] text-neutral-400 hover:text-white"
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <span className="text-xs font-mono text-neutral-500 hidden sm:inline-block">
            Showing {filteredNotifications.length} items
          </span>
        </div>

        {/* Notifications List */}
        <div className="space-y-3 font-sans">
          {filteredNotifications.length === 0 ? (
            <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-12 text-center text-neutral-400 font-sans shadow-xl">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-neutral-600" />
              <h3 className="font-serif text-lg font-normal text-white">No notifications found</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                {filter === "UNREAD"
                  ? "You've read all your notifications!"
                  : "Recent procurement updates and requisition approvals will appear here."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.link) router.push(item.link);
                }}
                className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer font-sans shadow-md ${
                  !item.read
                    ? "bg-[#1e1e1e] border-neutral-700/80 hover:border-neutral-500"
                    : "bg-[#141414]/60 border-neutral-800/80 opacity-75 hover:opacity-100"
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <span
                    className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                      !item.read
                        ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                        : "bg-neutral-700"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-sm font-semibold ${!item.read ? "text-white" : "text-neutral-300"}`}>
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500 font-medium">
                        • {timeAgo(item.createdAt)}
                      </span>
                      {!item.read && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-extrabold uppercase">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                </div>

                {/* Right Item Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {!item.read && (
                    <button
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      className="px-3 py-1.5 rounded-full bg-[#282828] hover:bg-[#333333] border border-neutral-700/60 text-neutral-300 hover:text-white text-xs font-sans font-medium transition flex items-center gap-1.5 cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mark Read</span>
                    </button>
                  )}

                  {item.link && (
                    <span className="p-2 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 hover:text-white transition flex items-center justify-center">
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
