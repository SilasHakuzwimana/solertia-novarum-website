import { useState, useEffect, useCallback } from "react";
import apiClient from "./client";
import appConfig from "./config";
import { PartnershipRequest, InternshipApplication } from "../types";
import {
  AnnouncementService,
  Announcement,
} from "../services/announcement.service";

// Generic API Hook
export function useAPIRequest<T>(
  endpoint: string,
  options?: {
    autoFetch?: boolean;
    dependencies?: any[];
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  },
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${appConfig.apiUrl}${endpoint}`);
      const data = (await response.json()) as T;

      if (response.ok) {
        setData(data);
        options?.onSuccess?.(data);
        return data;
      } else {
        const errorMsg = (data as any)?.error || "Failed to fetch data";
        setError(errorMsg);
        options?.onError?.(errorMsg);
        return null;
      }
    } catch (error: any) {
      const errorMsg = error.message || "Network error";
      setError(errorMsg);
      options?.onError?.(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  useEffect(() => {
    if (options?.autoFetch !== false) {
      fetchData();
    }
  }, [endpoint, ...(options?.dependencies || [])]);

  return { data, loading, error, refetch: fetchData };
}

// Partnership Hooks
export function usePartnerships() {
  const [partnerships, setPartnerships] = useState<PartnershipRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPartnerships = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getPartnerships();
      if (response.status === 200 && response.data) {
        setPartnerships(response.data);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.error || "Failed to fetch partnerships";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error: any) {
      const errorMsg = error.message || "Network error";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const createPartnership = useCallback(
    async (data: PartnershipRequest) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.createPartnership(data);
        if (response.status === 201 && response.data) {
          // Refresh the list after creation
          await fetchPartnerships();
          return {
            success: true,
            data: response.data,
            message:
              response.data.message || "Partnership created successfully",
          };
        } else {
          const errorMsg = response.error || "Failed to create partnership";
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }
      } catch (error: any) {
        const errorMsg = error.message || "Network error";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [fetchPartnerships],
  );

  const getPartnership = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getPartnership(id);
      if (response.status === 200 && response.data) {
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.error || "Failed to fetch partnership";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error: any) {
      const errorMsg = error.message || "Network error";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePartnership = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      // Note: You'll need to implement DELETE endpoint in server.ts
      const response = await fetch(
        `${appConfig.apiUrl}/api/partnerships/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        // Remove from local state
        setPartnerships((prev) => prev.filter((p: any) => p.id !== id));
        return { success: true, message: "Partnership deleted successfully" };
      } else {
        const errorData = await response.json();
        const errorMsg = errorData.error || "Failed to delete partnership";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error: any) {
      const errorMsg = error.message || "Network error";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    partnerships,
    loading,
    error,
    fetchPartnerships,
    createPartnership,
    getPartnership,
    deletePartnership,
  };
}

// Application Hooks
export function useApplications() {
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getApplications();
      if (response.status === 200 && response.data) {
        setApplications(response.data);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.error || "Failed to fetch applications";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error: any) {
      const errorMsg = error.message || "Network error";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const createApplication = useCallback(
    async (data: InternshipApplication) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.createApplication(data);
        if (response.status === 201 && response.data) {
          // Refresh the list after creation
          await fetchApplications();
          return {
            success: true,
            data: response.data,
            message:
              response.data.message || "Application created successfully",
          };
        } else {
          const errorMsg = response.error || "Failed to create application";
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }
      } catch (error: any) {
        const errorMsg = error.message || "Network error";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [fetchApplications],
  );

  const getApplication = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getApplication(id);
      if (response.status === 200 && response.data) {
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.error || "Failed to fetch application";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error: any) {
      const errorMsg = error.message || "Network error";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteApplication = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${appConfig.apiUrl}/api/applications/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        // Remove from local state
        setApplications((prev) => prev.filter((a: any) => a.id !== id));
        return { success: true, message: "Application deleted successfully" };
      } else {
        const errorData = await response.json();
        const errorMsg = errorData.error || "Failed to delete application";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error: any) {
      const errorMsg = error.message || "Network error";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    applications,
    loading,
    error,
    fetchApplications,
    createApplication,
    getApplication,
    deleteApplication,
  };
}

// Health Check Hook
export function useHealthCheck() {
  const [status, setStatus] = useState<{
    available: boolean;
    database: string;
    timestamp: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.healthCheck();
      if (response.status === 200 && response.data) {
        setStatus({
          available: true,
          database: response.data.database,
          timestamp: response.data.timestamp,
        });
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.error || "Health check failed";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error: any) {
      const errorMsg = error.message || "Network error";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, []);

  return {
    status,
    loading,
    error,
    checkHealth,
    isConnected: status?.database === "connected",
    isFallback: status?.database === "fallback-in-memory",
  };
}

// Stats Hook
export function useStats() {
  const [stats, setStats] = useState<{
    partnerships: number;
    applications: number;
    database: string;
    timestamp: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${appConfig.apiUrl}/api/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        return { success: true, data };
      } else {
        const errorData = await response.json();
        const errorMsg = errorData.error || "Failed to fetch stats";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error: any) {
      const errorMsg = error.message || "Network error";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
}

export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);

  const fetchAnnouncement = useCallback(async (token?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await AnnouncementService.getActiveAnnouncement(token);
      setAnnouncement(data);
      return { success: true, data };
    } catch (err: any) {
      const errorMsg = err.message || "Failed to fetch announcement";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllAnnouncements = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await AnnouncementService.getAllAnnouncements(token);
      setAllAnnouncements(data);
      return { success: true, data };
    } catch (err: any) {
      const errorMsg = err.message || "Failed to fetch announcements";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAnnouncement = useCallback(
    async (token: string, text: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await AnnouncementService.updateAnnouncement(token, text);
        if (data) {
          setAnnouncement(data);
          return { success: true, data };
        }
        return { success: false, error: "Failed to update announcement" };
      } catch (err: any) {
        const errorMsg = err.message || "Failed to update announcement";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteAnnouncement = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = await AnnouncementService.deleteAnnouncement(token);
      if (success) {
        setAnnouncement(null);
        return { success: true };
      }
      return { success: false, error: "Failed to delete announcement" };
    } catch (err: any) {
      const errorMsg = err.message || "Failed to delete announcement";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    announcement,
    allAnnouncements,
    loading,
    error,
    fetchAnnouncement,
    fetchAllAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
  };
}

// Export all hooks
export default {
  usePartnerships,
  useApplications,
  useHealthCheck,
  useStats,
  useAnnouncement,
  useAPIRequest,
};
