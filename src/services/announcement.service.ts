import apiClient from "../api/client";

export interface Announcement {
  id: number;
  text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const AnnouncementService = {
  // Get active announcement (public)
  async getActiveAnnouncement(token?: string): Promise<Announcement | null> {
    try {
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.fetchWithTimeout(
        "/api/announcements/active",
        {
          method: "GET",
          headers,
        },
      );

      if (response.status === 200 && response.data?.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch announcement:", error);
      return null;
    }
  },

  // Get all announcements (admin only)
  async getAllAnnouncements(token: string): Promise<Announcement[]> {
    try {
      const response = await apiClient.fetchWithTimeout("/api/announcements", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 && response.data?.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      return [];
    }
  },

  // Create or update announcement (admin only)
  async updateAnnouncement(
    token: string,
    text: string,
  ): Promise<Announcement | null> {
    try {
      const response = await apiClient.fetchWithTimeout("/api/announcements", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (response.status === 200 && response.data?.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to update announcement:", error);
      throw error;
    }
  },

  // Delete announcement (admin only)
  async deleteAnnouncement(token: string): Promise<boolean> {
    try {
      const response = await apiClient.fetchWithTimeout("/api/announcements", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return (response.status === 200 && response.data?.success) || false;
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      return false;
    }
  },
};

export default AnnouncementService;
