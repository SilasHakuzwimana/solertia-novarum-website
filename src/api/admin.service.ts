import apiClient from "./client";

export class AdminService {
  private static getHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  
  static async getStats(token: string): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout("/api/stats/admin", {
        headers: this.getHeaders(token),
      });
      return response;
    } catch (error) {
      return { status: 500, error: "Failed to fetch stats" };
    }
  }

  static async getPartnerships(token: string): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout(
        "/api/partnerships/admin/all",
        {
          headers: this.getHeaders(token),
        },
      );
      return response;
    } catch (error) {
      return { status: 500, error: "Failed to fetch partnerships" };
    }
  }

  static async getApplications(token: string): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout(
        "/api/applications/admin/all",
        {
          headers: this.getHeaders(token),
        },
      );
      return response;
    } catch (error) {
      return { status: 500, error: "Failed to fetch applications" };
    }
  }

  static async deletePartnership(token: string, id: number): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout(
        `/api/partnerships/admin/${id}`,
        {
          method: "DELETE",
          headers: this.getHeaders(token),
        },
      );
      return response;
    } catch (error) {
      return { status: 500, error: "Failed to delete partnership" };
    }
  }

  static async deleteApplication(token: string, id: number): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout(`/api/applications/admin/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(token),
      });
      return response;
    } catch (error) {
      return { status: 500, error: "Failed to delete application" };
    }
  }

  static async updatePartnership(
    token: string,
    id: number,
    data: any,
  ): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout(
        `/api/partnerships/admin/${id}`,
        {
          method: "PUT",
          headers: this.getHeaders(token),
          body: JSON.stringify(data),
        },
      );
      return response;
    } catch (error) {
      return { status: 500, error: "Failed to update partnership" };
    }
  }

  static async updateApplication(
    token: string,
    id: number,
    data: any,
  ): Promise<any> {
    try {
      const response = await apiClient.fetchWithTimeout(
        `/api/applications/admin/${id}`,
        {
          method: "PUT",
          headers: this.getHeaders(token),
          body: JSON.stringify(data),
        },
      );
      return response;
    } catch (error) {
      return { status: 500, error: "Failed to update application" };
    }
  }
}
