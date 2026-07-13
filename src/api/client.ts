import { PartnershipRequest, InternshipApplication } from "../types";

// API Configuration
export interface APIConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// API Response Types - Updated to be more flexible
export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
  success: boolean;
  // Optional properties for specific responses
  loginToken?: string;
  valid?: boolean;
  resetToken?: string;
  token?: string;
  user?: any;
  email?: string;
  expiresIn?: number;
}

// Health Check Response
export interface HealthResponse {
  status: string;
  database: "connected" | "fallback-in-memory";
  timestamp: string;
}

// Partnership Response
export interface PartnershipResponse {
  message: string;
  data: PartnershipRequest;
}

// Application Response
export interface ApplicationResponse {
  message: string;
  data: InternshipApplication;
}

// Pagination and Filter Options
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
}

class APIClient {
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(config: APIConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 30000;
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...config.headers,
    };
  }

  public async fetchWithTimeout<T>(
    url: string,
    options: RequestInit = {},
  ): Promise<APIResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      return {
        data: data,
        status: response.status,
        success: response.ok,
        ...(response.ok ? {} : { error: data.error || "Request failed" }),
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        return {
          status: 408,
          error: "Request timeout - server took too long to respond",
          success: false,
        };
      }

      return {
        status: 500,
        error: error.message || "Network error occurred",
        success: false,
      };
    }
  }

  // Health Check
  async healthCheck(): Promise<APIResponse<HealthResponse>> {
    return this.fetchWithTimeout<HealthResponse>(`${this.baseURL}/api/health`);
  }

  // Partnerships
  async createPartnership(
    data: PartnershipRequest,
  ): Promise<APIResponse<PartnershipResponse>> {
    return this.fetchWithTimeout<PartnershipResponse>(
      `${this.baseURL}/api/partnerships`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async getPartnerships(
    options?: QueryOptions,
  ): Promise<APIResponse<PartnershipRequest[]>> {
    const params = new URLSearchParams();
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.offset) params.append("offset", options.offset.toString());
    if (options?.orderBy) params.append("orderBy", options.orderBy);
    if (options?.orderDirection)
      params.append("orderDirection", options.orderDirection);

    const url = `${this.baseURL}/api/partnerships${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return this.fetchWithTimeout<PartnershipRequest[]>(url);
  }

  async getPartnership(id: number): Promise<APIResponse<PartnershipRequest>> {
    return this.fetchWithTimeout<PartnershipRequest>(
      `${this.baseURL}/api/partnerships/${id}`,
    );
  }

  // Applications
  async createApplication(
    data: InternshipApplication,
  ): Promise<APIResponse<ApplicationResponse>> {
    return this.fetchWithTimeout<ApplicationResponse>(
      `${this.baseURL}/api/applications`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async getApplications(
    options?: QueryOptions,
  ): Promise<APIResponse<InternshipApplication[]>> {
    const params = new URLSearchParams();
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.offset) params.append("offset", options.offset.toString());
    if (options?.orderBy) params.append("orderBy", options.orderBy);
    if (options?.orderDirection)
      params.append("orderDirection", options.orderDirection);

    const url = `${this.baseURL}/api/applications${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return this.fetchWithTimeout<InternshipApplication[]>(url);
  }

  async getApplication(
    id: number,
  ): Promise<APIResponse<InternshipApplication>> {
    return this.fetchWithTimeout<InternshipApplication>(
      `${this.baseURL}/api/applications/${id}`,
    );
  }

  // Batch Operations
  async batchGet<T>(
    endpoints: string[],
  ): Promise<APIResponse<{ [key: string]: T }>> {
    const results: { [key: string]: T } = {};
    let hasError = false;
    let errorMessage = "";

    for (const endpoint of endpoints) {
      try {
        const response = await this.fetchWithTimeout<T>(
          `${this.baseURL}${endpoint}`,
        );
        if (response.status === 200 && response.data) {
          results[endpoint] = response.data;
        } else {
          hasError = true;
          errorMessage = `Failed to fetch ${endpoint}`;
        }
      } catch (error: any) {
        hasError = true;
        errorMessage = error.message;
      }
    }

    return {
      status: hasError ? 500 : 200,
      data: results,
      success: !hasError,
      ...(hasError ? { error: errorMessage } : {}),
    };
  }
}

// Create and export singleton instance
export const apiClient = new APIClient({
  baseURL:
    process.env.NODE_ENV === "production"
      ? window.location.origin
      : "http://localhost:3004",
  timeout: 30000,
});

// Export a hook for React components
export function useAPI() {
  return apiClient;
}

export default apiClient;
