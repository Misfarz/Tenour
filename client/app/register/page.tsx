"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { User as UserIcon, Mail, Lock, ArrowRight, Loader2, Sparkles } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setIsLoading(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-neutral-950 to-neutral-950">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-indigo-950/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4 shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create an account</h1>
            <p className="text-sm text-neutral-400 mt-1">
              Join Tenour today and get started
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Misfar"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="misfar@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-neutral-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
