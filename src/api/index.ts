import apiClient from "./client";
import appConfig from "./config";
export { default as apiClient, useAPI } from "./client";
export type { APIConfig, APIResponse, QueryOptions } from "./client";

// Export config
export {
  default as appConfig,
  checkAPIAvailability,
  getAPIStatus,
} from "./config";
export type { AppConfig } from "./config";

// Export hooks
export {
  usePartnerships,
  useApplications,
  useHealthCheck,
  useAPIRequest,
  useAnnouncement,
} from "./hooks";

// Export services
export { default as APIService } from "./services";
export { AnnouncementService } from "../services/announcement.service";
export type { Announcement } from "../services/announcement.service";

// Export types
export type {
  HealthResponse,
  PartnershipResponse,
  ApplicationResponse,
} from "./client";

// Default export
export default {
  client: { apiClient },
  config: { appConfig },
  hooks: {
    usePartnerships: () => ({
      partnerships: [],
      loading: false,
      error: null,
      fetchPartnerships: () => {},
    }),
    useApplications: () => ({
      applications: [],
      loading: false,
      error: null,
      fetchApplications: () => {},
    }),
    useHealthCheck: () => ({
      status: null,
      loading: true,
      error: null,
      checkHealth: () => {},
    }),
    useAnnouncement: () => ({
      announcement: null,
      loading: false,
      error: null,
      fetchAnnouncement: () => {},
      updateAnnouncement: () => {},
      deleteAnnouncement: () => {},
    }),
  },
};
