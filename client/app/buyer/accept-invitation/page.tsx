"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { KeyRound, Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const acceptSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type AcceptFormData = z.infer<typeof acceptSchema>;

interface InvitationDetails {
  email: string;
  name: string;
  organizationName: string;
  role: string;
  expiresAt: string;
}

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [verifying, setVerifying] = useState<boolean>(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptFormData>({
    resolver: zodResolver(acceptSchema),
  });

  useEffect(() => {
    if (!token) {
      setVerifyError("No invitation token provided in URL.");
      setVerifying(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await apiClient<InvitationDetails>(`/auth/invitations/verify?token=${token}`);
        if (res.success && res.data) {
          setInvitation(res.data);
        } else {
          setVerifyError(res.message || "Invalid or expired invitation token.");
        }
      } catch (err: any) {
        setVerifyError(err.message || "Failed to verify invitation token.");
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: AcceptFormData) => {
    if (!token) return;
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const res = await apiClient("/auth/accept-invitation", {
        method: "POST",
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/buyer/login");
        }, 2000);
      }
    } catch (err: any) {
      setSubmitError(err.message || "Failed to accept invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFD] text-slate-600">
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#2383E2]" />
          <span className="text-sm font-medium text-slate-700">Verifying invitation...</span>
        </div>
      </div>
    );
  }

  if (verifyError || !invitation) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-950 mb-2">Invalid Invitation</h1>
          <p className="text-slate-600 text-xs leading-relaxed mb-6">{verifyError}</p>
          <Link
            href="/buyer/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-xs transition"
          >
            Go to Login Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-100 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md bg-slate-950 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              N
            </div>
            <span className="font-extrabold text-xl text-slate-950 tracking-tight">Tenour</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-[#FAFBFD]">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#EDF5FF] text-[#2383E2] mb-4">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
                Accept Invitation
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                You’ve been invited to join <span className="font-bold text-slate-900">{invitation.organizationName}</span> as <span className="font-bold text-[#2383E2]">{invitation.role}</span>.
              </p>
            </div>

            {success ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h3 className="font-bold text-base mb-1">Account Activated!</h3>
                <p className="text-xs text-emerald-700 mb-3">
                  Your password has been set. Redirecting to login...
                </p>
                <Link
                  href="/buyer/login"
                  className="inline-block text-xs font-bold text-[#2383E2] underline"
                >
                  Click here if not redirected
                </Link>
              </div>
            ) : (
              <>
                {submitError && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {submitError}
                  </div>
                )}

                <div className="mb-6 bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Name:</span>
                    <span className="font-semibold text-slate-900">{invitation.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-semibold text-slate-900">{invitation.email}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Create Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register("password")}
                        type="password"
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2] transition"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1.5">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register("confirmPassword")}
                        type="password"
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2] transition"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1.5">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3 px-4 bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Set Password & Join Workspace</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BuyerAcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFBFD] text-slate-600">
          <Loader2 className="w-6 h-6 animate-spin text-[#2383E2]" />
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
