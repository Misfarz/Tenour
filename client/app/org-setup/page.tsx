"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { Building2, ArrowRight, Loader2, Sparkles } from "lucide-react";

const orgSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
});

type OrgFormData = z.infer<typeof orgSchema>;

export default function OrgSetupPage() {
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
        router.push("/login");
      } else if (organization) {
        router.push("/dashboard");
      }
    }
  }, [authLoading, isAuthenticated, organization, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="flex items-center gap-3 bg-neutral-900/80 border border-neutral-800 px-6 py-4 rounded-2xl backdrop-blur-xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span className="text-sm font-medium text-neutral-300">Checking account state...</span>
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-neutral-950 to-neutral-950">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-indigo-950/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4 shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create your organization</h1>
            <p className="text-sm text-neutral-400 mt-1">
              Welcome{user?.name ? `, ${user.name}` : ""}! Set up your workspace to continue.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Organization Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  {...register("name")}
                  type="text"
                  placeholder="ABC Technologies"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
