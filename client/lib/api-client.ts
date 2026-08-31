const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  let token: string | null = null;
  if (typeof window !== "undefined") {
    // Only use vendorToken for Vendor Portal routes (/vendor/... or /auth/vendor/...)
    // Buyer routes use HTTP-only cookies (credentials: "include"). NEVER attach vendorToken to buyer requests!
    const isVendorPortalEndpoint =
      cleanEndpoint.startsWith("/vendor/") || cleanEndpoint.startsWith("/auth/vendor");

    if (isVendorPortalEndpoint) {
      token = localStorage.getItem("vendorToken");
    } else {
      token = localStorage.getItem("accessToken");
    }
  }

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: "include",
  });

  const data: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    message: "An unexpected error occurred",
  }));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
