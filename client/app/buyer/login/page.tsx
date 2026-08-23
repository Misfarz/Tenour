"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { Mail, Lock, ArrowRight, Loader2, LogIn, Building2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function BuyerLoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);
    try {
      await login(data);
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-[#2383E2] selection:text-white">
      {/* Top Bar Header */}
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

          <Link
            href="/buyer/register"
            className="text-xs font-medium text-slate-600 hover:text-slate-950 transition"
          >
            Don't have an account? <span className="text-[#2383E2] font-semibold">Sign up free</span>
          </Link>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-[#FAFBFD]">
        <div className="w-full max-w-md">
          {/* White Card with Notion-style subtle border and soft shadow */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#EDF5FF] text-[#2383E2] mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
                Buyer Sign In
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Access your organization's procurement workspace
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="misfar@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2] transition"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                </div>
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-[#2383E2] hover:bg-[#1D72C9] text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Buyer Workspace</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 pt-6 border-t border-slate-100">
              Need a buyer account?{" "}
              <Link
                href="/buyer/register"
                className="text-[#2383E2] hover:text-[#1D72C9] font-semibold transition"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Notion-Style Clean Footer */}
      <footer className="border-t border-slate-100 bg-white py-4 px-6 text-center text-xs text-slate-400">
        Tenour Platform • Clean Architecture Auth Module
      </footer>
    </div>
  );
}
