"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Organization {
  id: string;
  name: string;
  slug?: string | null;
}

export interface MeResponseData {
  user: User;
  organization: Organization | null;
  role: string | null;
  memberships?: any[];
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  role: string | null;
  memberships: any[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  createOrganization: (name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const res = await apiClient<MeResponseData>("/auth/me");
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setOrganization(res.data.organization || null);
        setRole(res.data.role || null);
        setMemberships(res.data.memberships || []);
      } else {
        setUser(null);
        setOrganization(null);
        setRole(null);
        setMemberships([]);
      }
    } catch {
      setUser(null);
      setOrganization(null);
      setRole(null);
      setMemberships([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTokens = async (): Promise<boolean> => {
    try {
      const res = await apiClient("/auth/refresh", { method: "POST" });
      if (res.success) {
        await checkAuth();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const res = await apiClient<MeResponseData>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setOrganization(res.data.organization || null);
        setRole(res.data.role || null);
        setMemberships(res.data.memberships || []);

        if (res.data.organization) {
          router.push("/buyer/dashboard");
        } else {
          router.push("/buyer/setup-organization");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const res = await apiClient<MeResponseData>("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setOrganization(null);
        setRole(null);
        setMemberships([]);
        router.push("/buyer/setup-organization");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createOrganization = async (name: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient("/organizations", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      if (res.success && res.data?.organization) {
        setOrganization(res.data.organization);
        setRole(res.data.role || "ORG_ADMIN");
        await checkAuth();
        router.push("/buyer/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setOrganization(null);
      setRole(null);
      setMemberships([]);
      setIsLoading(false);
      router.push("/buyer/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        role,
        memberships,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        createOrganization,
        logout,
        refreshTokens,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
