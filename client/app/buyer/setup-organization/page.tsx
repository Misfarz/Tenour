"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { Building2, ArrowRight, Loader2, Briefcase } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white font-sans">
        <div className="flex items-center gap-3 bg-[#1e1e1e] border border-neutral-800 px-6 py-4 rounded-2xl shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="text-xs font-mono text-neutral-400">Checking account state...</span>
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
    <div className="min-h-screen bg-[#161616] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Header */}
      <header className="border-b border-neutral-800/80 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="group flex items-center">
          <span className="text-xl md:text-2xl font-black tracking-[-0.06em] text-white font-sans group-hover:opacity-90 transition">
            Tenour<span className="text-[#2383E2] font-mono font-normal">.</span>
          </span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 bg-[#161616]">
        <div className="w-full max-w-md">
          <div className="bg-[#1e1e1e] border border-neutral-800/80 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#282828] text-white mb-4 border border-neutral-700/60">
                <Briefcase className="w-6 h-6 text-[#2383E2]" />
              </div>
              <h1 className="font-serif text-2xl font-normal text-white tracking-tight">
                Create Your Organization
              </h1>
              <p className="text-xs text-neutral-400 mt-1.5 font-sans">
                Welcome{user?.name ? `, ${user.name}` : ""}! Set up your organization workspace to continue.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 font-sans">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans">
              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-300 uppercase mb-1.5">
                  Organization Legal Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="e.g. Acme Tech Global"
                    className="w-full pl-10 pr-3.5 py-3 bg-[#141414] border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition"
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-red-400 mt-1.5">{errors.name.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-widest uppercase shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <>
                    <span>Create Organization</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
