"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Bell, CheckCheck, Loader2, Sparkles } from "lucide-react";

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

interface NotificationBellProps {
  type: "BUYER" | "VENDOR";
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

export function NotificationBell({ type }: NotificationBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const endpoint = type === "BUYER" ? "/notifications/buyer" : "/notifications/vendor";
  const markAllEndpoint = type === "BUYER" ? "/notifications/buyer/mark-all-read" : "/notifications/vendor/mark-all-read";

  const fetchNotifications = async () => {
    try {
      const res = await apiClient<{ notifications: NotificationItem[]; unreadCount: number }>(endpoint);
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Ignore silent error
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 15 seconds for real-time updates
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [type]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (item: NotificationItem) => {
    try {
      if (!item.read) {
        await apiClient(`/notifications/${item.id}/read`, { method: "PATCH" });
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      // Ignore error
    }

    setOpen(false);
    if (item.link) {
      router.push(item.link);
    }
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      const res = await apiClient(markAllEndpoint, { method: "PATCH" });
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      // Ignore error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        className="relative p-2 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 hover:text-white transition cursor-pointer flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] text-[10px] font-mono font-extrabold text-white bg-red-500 rounded-full flex items-center justify-center border-2 border-[#161616] animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Popover */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#1e1e1e] border border-neutral-800 rounded-3xl shadow-2xl z-50 overflow-hidden text-white font-sans animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-normal text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono font-extrabold">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-[11px] font-mono text-neutral-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3 h-3" />}
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-800/60 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-xs">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-neutral-600" />
                <span>No notifications yet</span>
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`w-full p-4 text-left hover:bg-[#242424] transition flex items-start gap-3 cursor-pointer ${
                    !item.read ? "bg-white/[0.03]" : "opacity-80"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!item.read ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-neutral-600"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-xs font-semibold truncate ${!item.read ? "text-white" : "text-neutral-300"}`}>
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500 whitespace-nowrap">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-snug line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
