import apiClient from "./client";
import { PartnershipRequest, InternshipApplication } from "../types";

// Centralized API service
export class APIService {
  // Partnerships
  static async createPartnership(data: PartnershipRequest) {
    try {
      const response = await apiClient.createPartnership(data);
      if (response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getPartnerships() {
    try {
      const response = await apiClient.getPartnerships();
      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Applications
  static async createApplication(data: InternshipApplication) {
    try {
      const response = await apiClient.createApplication(data);
      if (response.status === 201) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getApplications() {
    try {
      const response = await apiClient.getApplications();
      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Health Check
  static async checkHealth() {
    try {
      const response = await apiClient.healthCheck();
      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Batch Operations
  static async syncAllData() {
    try {
      const [partnerships, applications, health] = await Promise.all([
        this.getPartnerships(),
        this.getApplications(),
        this.checkHealth(),
      ]);

      return {
        success: true,
        data: {
          partnerships: partnerships.success ? partnerships.data : [],
          applications: applications.success ? applications.data : [],
          health: health.success ? health.data : null,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export default APIService;
