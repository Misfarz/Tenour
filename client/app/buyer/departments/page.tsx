"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Lock,
  ArrowLeft,
  LogOut,
  Users,
} from "lucide-react";

interface Department {
  id: string;
  name: string;
  memberCount: number;
  createdAt: string;
}

export default function BuyerDepartmentsPage() {
  const { user, organization, role, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState<boolean>(true);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [deptName, setDeptName] = useState<string>("");

  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editName, setEditName] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchDepartments = async () => {
    setLoadingDepts(true);
    try {
      const res = await apiClient<Department[]>("/organizations/departments");
      if (res.success && res.data) {
        setDepartments(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load departments");
    } finally {
      setLoadingDepts(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else if (organization) {
        fetchDepartments();
      }
    }
  }, [authLoading, isAuthenticated, organization, router]);

  if (authLoading || loadingDepts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Loading departments...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await apiClient("/organizations/departments", {
        method: "POST",
        body: JSON.stringify({ name: deptName }),
      });

      if (res.success) {
        setSuccess(`Department "${deptName}" created successfully.`);
        setShowAddModal(false);
        setDeptName("");
        fetchDepartments();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create department");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await apiClient(`/organizations/departments/${editingDept.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: editName }),
      });

      if (res.success) {
        setSuccess("Department updated successfully");
        setEditingDept(null);
        fetchDepartments();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update department");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (deptId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete department "${name}"?`)) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await apiClient(`/organizations/departments/${deptId}`, {
        method: "DELETE",
      });

      if (res.success) {
        setSuccess(`Department "${name}" deleted successfully.`);
        fetchDepartments();
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete department");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Top Navbar */}
      <BuyerNavbar activePath="/buyer/departments" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF5FF] border border-[#D0E4FF] text-[#1D72C9] text-xs font-semibold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Department Structure</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
              Manage Departments
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Create and organize departments for {organization?.name}.
            </p>
          </div>

          {role === "ORG_ADMIN" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-lg bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Department</span>
            </button>
          )}
        </div>

        {/* Alerts */}
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

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {departments.map((d) => (
            <div key={d.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EDF5FF] flex items-center justify-center text-[#2383E2]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    {d.memberCount} Members
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-950 tracking-tight">{d.name}</h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">ID: {d.id}</p>
              </div>

              {role === "ORG_ADMIN" && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 mt-4">
                  <button
                    onClick={() => {
                      setEditingDept(d);
                      setEditName(d.name);
                    }}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(d.id, d.name)}
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {departments.length === 0 && (
            <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
              No departments created yet.
            </div>
          )}
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-950">Create Department</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IT, Procurement, Finance"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#2383E2]"
                />
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
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingDept && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-950">Edit Department</h3>
              <button onClick={() => setEditingDept(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleUpdateDepartment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#2383E2]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#2383E2] hover:bg-[#1D72C9] text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
