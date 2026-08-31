"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  Users as UsersIcon,
  UserPlus,
  Loader2,
  Lock,
  ArrowLeft,
  Copy,
  Check,
  Mail,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface OrgUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  department?: { id: string; name: string } | null;
  departmentId?: string | null;
  status: string;
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
}

export default function BuyerUsersPage() {
  const { user, organization, role, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<OrgUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);

  // Modal / Form state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addName, setAddName] = useState<string>("");
  const [addEmail, setAddEmail] = useState<string>("");
  const [addRole, setAddRole] = useState<string>("EMPLOYEE");
  const [addDeptId, setAddDeptId] = useState<string>("");

  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const displayRole = typeof role === "string" ? role : (role as any)?.name || "ORG_ADMIN";

  const fetchUsersAndDepts = async () => {
    setLoadingUsers(true);
    try {
      const [usersRes, deptsRes] = await Promise.all([
        apiClient<OrgUser[]>("/organizations/users"),
        apiClient<Department[]>("/organizations/departments"),
      ]);

      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }
      if (deptsRes.success && deptsRes.data) {
        setDepartments(deptsRes.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load organization data");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else if (organization && displayRole === "ORG_ADMIN") {
        fetchUsersAndDepts();
      }
    }
  }, [authLoading, isAuthenticated, organization, displayRole, router]);

  if (authLoading || (loadingUsers && displayRole === "ORG_ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400">Loading user management...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // 403 Forbidden Screen if non-admin user
  if (displayRole !== "ORG_ADMIN") {
    return (
      <div className="min-h-screen bg-[#161616] flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[#282828] text-red-400 flex items-center justify-center mx-auto mb-4 border border-neutral-700/60">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-normal text-white mb-2">403 — Access Denied</h1>
          <p className="text-neutral-400 text-xs leading-relaxed mb-6 font-sans">
            Only users with the <span className="font-semibold text-white">ORG_ADMIN</span> role can manage organization users. Your current role is <span className="font-mono text-blue-400">{displayRole}</span>.
          </p>
          <Link
            href="/buyer/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 font-semibold text-xs transition font-sans"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await apiClient<any>("/organizations/users", {
        method: "POST",
        body: JSON.stringify({
          name: addName,
          email: addEmail,
          role: addRole,
          departmentId: addDeptId || null,
        }),
      });

      if (res.success && res.data) {
        setSuccess(`Invitation email sent to ${addEmail}.`);
        if (res.data.invitationUrl) {
          setCreatedInviteUrl(res.data.invitationUrl);
        }
        if (res.data.emailPreviewUrl) {
          setEmailPreviewUrl(res.data.emailPreviewUrl);
        }
        setShowAddModal(false);
        setAddName("");
        setAddEmail("");
        fetchUsersAndDepts();
      }
    } catch (err: any) {
      setError(err.message || "Failed to invite user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await apiClient(`/organizations/users/${memberId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });

      if (res.success) {
        setSuccess("User role updated successfully");
        fetchUsersAndDepts();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    }
  };

  const handleStatusToggle = async (memberId: string, currentStatus: string) => {
    setError(null);
    setSuccess(null);
    const targetStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      const res = await apiClient(`/organizations/users/${memberId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: targetStatus }),
      });

      if (res.success) {
        setSuccess(`User status changed to ${targetStatus}`);
        fetchUsersAndDepts();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    }
  };

  const handleDeleteUser = async (memberId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from your organization?`)) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await apiClient(`/organizations/users/${memberId}`, {
        method: "DELETE",
      });

      if (res.success) {
        setSuccess(`User ${name} deleted successfully.`);
        fetchUsersAndDepts();
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    }
  };

  const copyInviteLink = () => {
    if (createdInviteUrl) {
      navigator.clipboard.writeText(createdInviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Top Navbar */}
      <BuyerNavbar activePath="/buyer/users" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Banner Container */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1e1e1e] p-6 sm:p-8 rounded-3xl border border-neutral-800/80 shadow-2xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-extrabold uppercase tracking-widest mb-3">
              <UsersIcon className="w-3.5 h-3.5" />
              <span>User Management & Roles</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">
              Manage Users & Roles
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1.5 font-sans">
              Invite team members to {organization?.name}, assign roles, and set department permissions.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-md transition flex items-center gap-2 cursor-pointer self-start sm:self-auto font-sans"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite User</span>
          </button>
        </div>

        {/* Success / Error Alerts */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between font-sans">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between font-sans">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Generated Invitation Link Banner */}
        {createdInviteUrl && (
          <div className="bg-[#1e1e1e] border border-blue-500/30 rounded-3xl p-6 shadow-2xl font-sans">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                <Mail className="w-4 h-4" />
                <span>Invitation Email Sent Successfully</span>
              </div>
              <button onClick={() => { setCreatedInviteUrl(null); setEmailPreviewUrl(null); }} className="text-neutral-400 hover:text-white font-bold text-xs">✕ Dismiss</button>
            </div>
            <p className="text-xs text-neutral-400 mb-4">
              An HTML invitation email was dispatched. You can also copy the link below or open the test email preview:
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                readOnly
                value={createdInviteUrl}
                className="flex-1 px-4 py-2.5 bg-[#141414] border border-neutral-800 rounded-2xl text-xs font-mono text-white select-all"
              />
              <button
                onClick={copyInviteLink}
                className="px-5 py-2.5 bg-white hover:bg-neutral-200 text-black rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
              {emailPreviewUrl && (
                <a
                  href={emailPreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-[#242424] hover:bg-[#2e2e2e] border border-neutral-700/60 text-blue-400 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <span>Preview Sent Email</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl shadow-2xl overflow-hidden font-sans">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#181818] border-b border-neutral-800/80 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                  <th className="py-4 px-6">User Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Assigned Role</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-xs">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#242424] transition">
                    <td className="py-4 px-6 font-semibold text-white">{u.name}</td>
                    <td className="py-4 px-6 text-neutral-300">{u.email}</td>
                    <td className="py-4 px-6">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-3 py-1.5 bg-[#141414] border border-neutral-800 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-neutral-500 transition cursor-pointer"
                      >
                        <option value="ORG_ADMIN">ORG_ADMIN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="EMPLOYEE">EMPLOYEE</option>
                        <option value="PROCUREMENT">PROCUREMENT</option>
                        <option value="FINANCE">FINANCE</option>
                      </select>
                    </td>
                    <td className="py-4 px-6">
                      {u.department ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#282828] border border-neutral-700/60 text-neutral-300 text-[11px] font-medium">
                          {u.department.name}
                        </span>
                      ) : (
                        <span className="text-neutral-500 font-normal">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {u.status === "ACTIVE" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      )}
                      {u.status === "INVITED" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          Invited (Pending)
                        </span>
                      )}
                      {u.status === "INACTIVE" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#282828] border border-neutral-700/60 text-neutral-400 font-mono font-bold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.status !== "INVITED" && (
                          <button
                            onClick={() => handleStatusToggle(u.id, u.status)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                              u.status === "ACTIVE"
                                ? "bg-[#242424] hover:bg-red-950/40 text-neutral-300 hover:text-red-400 border border-neutral-700/60"
                                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold"
                            }`}
                          >
                            {u.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-2 rounded-xl bg-[#242424] hover:bg-red-950/40 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                          title="Delete user from organization"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Invite User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl font-sans">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
              <h3 className="font-serif text-xl font-normal text-white">Invite Organization User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Ziyam Employee"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="ziyam@example.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1">Assigned Buyer Role</label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white focus:outline-none focus:border-neutral-500 transition"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="PROCUREMENT">PROCUREMENT</option>
                  <option value="FINANCE">FINANCE</option>
                  <option value="ORG_ADMIN">ORG_ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1">Department (Optional)</label>
                <select
                  value={addDeptId}
                  onChange={(e) => setAddDeptId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white focus:outline-none focus:border-neutral-500 transition"
                >
                  <option value="">Unassigned</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 rounded-full font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs rounded-full cursor-pointer shadow-md"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
