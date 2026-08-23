"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { Building2, ArrowRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

const orgSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
});

type OrgFormData = z.infer<typeof orgSchema>;

export default function BuyerOrgSetupPage() {
  const { user, organization, isAuthenticated, isLoading: authLoading, createOrganization } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: "ABC Technologies",
    },
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/buyer/login");
      } else if (organization) {
        router.push("/buyer/dashboard");
      }
    }
  }, [authLoading, isAuthenticated, organization, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Checking account state...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || organization) {
    return null;
  }

  const onSubmit = async (data: OrgFormData) => {
    setError(null);
    setSubmitting(true);
    try {
      await createOrganization(data.name);
    } catch (err: any) {
      setError(err.message || "Failed to create organization");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-100 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md bg-slate-950 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              N
            </div>
            <span className="font-extrabold text-xl text-slate-950 tracking-tight">
              Tenour
            </span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-[#FAFBFD]">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#EDF5FF] text-[#2383E2] mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
                Create Your Organization
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Welcome{user?.name ? `, ${user.name}` : ""}! Set up your organization to continue.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Organization Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="ABC Technologies"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2] transition"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1.5">{errors.name.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Continue to Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-4 px-6 text-center text-xs text-slate-400">
        Tenour Platform • Organization Setup
      </footer>
    </div>
  );
}
