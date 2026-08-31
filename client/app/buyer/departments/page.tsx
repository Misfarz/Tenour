"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { apiClient } from "@/lib/api-client";
import { BuyerNavbar } from "@/components/buyer-navbar";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Users,
} from "lucide-react";

interface Department {
  id: string;
  name: string;
  memberCount: number;
  createdAt: string;
}

export default function BuyerDepartmentsPage() {
  const { user, organization, role, isAuthenticated, isLoading: authLoading } = useAuth();
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

  const displayRole = typeof role === "string" ? role : (role as any)?.name || "ORG_ADMIN";

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
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400">Loading departments...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const canManageDepartments = displayRole === "ORG_ADMIN";

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
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Top Navbar */}
      <BuyerNavbar activePath="/buyer/departments" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Banner Container */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1e1e1e] p-6 sm:p-8 rounded-3xl border border-neutral-800/80 shadow-2xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono font-extrabold uppercase tracking-widest mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>Department Structure</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">
              Manage Departments
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1.5 font-sans">
              Create and organize departments for {organization?.name}.
            </p>
          </div>

          {canManageDepartments && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-md transition flex items-center gap-2 cursor-pointer self-start sm:self-auto font-sans"
            >
              <Plus className="w-4 h-4" />
              <span>Create Department</span>
            </button>
          )}
        </div>

        {/* Alerts */}
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

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {departments.map((d) => (
            <div key={d.id} className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 shadow-xl hover:border-neutral-700 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#282828] text-blue-400 flex items-center justify-center border border-neutral-700/60">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#282828] border border-neutral-700/60 text-neutral-300 text-xs font-mono font-medium">
                    <Users className="w-3.5 h-3.5" />
                    {d.memberCount} Members
                  </span>
                </div>
                <h3 className="font-serif text-xl font-normal text-white mb-1">{d.name}</h3>
                <p className="text-xs text-neutral-500 font-mono">ID: {d.id}</p>
              </div>

              {canManageDepartments && (
                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-end gap-2 mt-5">
                  <button
                    onClick={() => {
                      setEditingDept(d);
                      setEditName(d.name);
                    }}
                    className="p-2 rounded-xl bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 hover:text-white transition cursor-pointer"
                    title="Edit Department"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(d.id, d.name)}
                    className="p-2 rounded-xl bg-[#242424] hover:bg-red-950/40 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                    title="Delete Department"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {departments.length === 0 && (
            <div className="col-span-full bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-12 text-center text-neutral-400 text-sm font-sans shadow-2xl">
              No departments created yet.
            </div>
          )}
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl font-sans">
            <h3 className="font-serif text-xl font-normal text-white mb-1">Create Department</h3>
            <p className="text-xs text-neutral-400 mb-5">Add a new operational department to {organization?.name}.</p>
            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Procurement & Logistics"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
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
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : "Save Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingDept && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl font-sans">
            <h3 className="font-serif text-xl font-normal text-white mb-1">Edit Department</h3>
            <p className="text-xs text-neutral-400 mb-5">Update department name for {editingDept.name}.</p>
            <form onSubmit={handleUpdateDepartment} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#141414] border border-neutral-800 rounded-2xl text-xs text-white focus:outline-none focus:border-neutral-500 transition"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-5 py-2.5 bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 rounded-full font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs rounded-full cursor-pointer shadow-md"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : "Update Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
