"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import {
  Users as UsersIcon,
  UserPlus,
  Building2,
  Loader2,
  Lock,
  ArrowLeft,
  Copy,
  Check,
  LogOut,
  Mail,
  Trash2,
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
  const { user, organization, role, isAuthenticated, isLoading: authLoading, logout } = useAuth();
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
  const [copied, setCopied] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

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
      } else if (organization && role === "ORG_ADMIN") {
        fetchUsersAndDepts();
      }
    }
  }, [authLoading, isAuthenticated, organization, role, router]);

  if (authLoading || (loadingUsers && role === "ORG_ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading user management...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // 403 Forbidden Screen if non-admin user
  if (role !== "ORG_ADMIN") {
    return (
      <div className="min-h-screen bg-[#FAFBFD] flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950 mb-2">403 — Access Denied</h1>
          <p className="text-slate-600 text-xs leading-relaxed mb-6">
            Only users with the <span className="font-semibold text-slate-900">ORG_ADMIN</span> role can manage organization users. Your current role is <span className="font-semibold text-[#2383E2]">{role || "Member"}</span>.
          </p>
          <Link
            href="/buyer/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs transition"
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
        setSuccess(`Invitation created for ${addName} (${addEmail}).`);
        if (res.data.invitationUrl) {
          setCreatedInviteUrl(res.data.invitationUrl);
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
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-md bg-slate-950 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
                N
              </div>
              <span className="font-extrabold text-xl text-slate-950 tracking-tight">Tenour</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-slate-600">{organization?.name}</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            <Link href="/buyer/dashboard" className="hover:text-slate-950 transition">Dashboard</Link>
            <Link href="/buyer/users" className="text-[#2383E2] font-semibold">User Management</Link>
            <Link href="/buyer/departments" className="hover:text-slate-950 transition">Departments</Link>
            <Link href="/buyer/settings" className="hover:text-slate-950 transition">Organization Settings</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF5FF] border border-[#D0E4FF] text-[#1D72C9] text-xs font-semibold mb-2">
              <UsersIcon className="w-3.5 h-3.5" />
              <span>Organization User Management</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
              Manage Users & Roles
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Invite team members to {organization?.name}, assign roles, and set department permissions.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-lg bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite User</span>
          </button>
        </div>

        {/* Success / Error Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Generated Invitation Link Banner */}
        {createdInviteUrl && (
          <div className="bg-[#EDF5FF] border border-[#D0E4FF] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[#1D72C9] font-bold text-sm">
                <Mail className="w-4 h-4" />
                <span>Development Invitation Link Generated</span>
              </div>
              <button onClick={() => setCreatedInviteUrl(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕ Dismiss</button>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Copy and open this link to test accepting the invitation and setting a password:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={createdInviteUrl}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 select-all"
              />
              <button
                onClick={copyInviteLink}
                className="px-4 py-2 bg-[#2383E2] hover:bg-[#1D72C9] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">User Name</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Assigned Role</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-semibold text-slate-950">{u.name}</td>
                    <td className="py-4 px-6 text-slate-600">{u.email}</td>
                    <td className="py-4 px-6">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-semibold text-xs text-slate-800 focus:outline-none focus:border-[#2383E2] transition cursor-pointer"
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
                        <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium">
                          {u.department.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {u.status === "ACTIVE" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      )}
                      {u.status === "INVITED" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Invited (Pending)
                        </span>
                      )}
                      {u.status === "INACTIVE" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-500 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.status !== "INVITED" && (
                          <button
                            onClick={() => handleStatusToggle(u.id, u.status)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                              u.status === "ACTIVE"
                                ? "bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {u.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
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
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-950">Invite Organization User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Ziyam Employee"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#2383E2]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="ziyam@example.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#2383E2]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Buyer Role</label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-none focus:border-[#2383E2]"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="PROCUREMENT">PROCUREMENT</option>
                  <option value="FINANCE">FINANCE</option>
                  <option value="ORG_ADMIN">ORG_ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department (Optional)</label>
                <select
                  value={addDeptId}
                  onChange={(e) => setAddDeptId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#2383E2]"
                >
                  <option value="">Unassigned</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#2383E2] hover:bg-[#1D72C9] text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
