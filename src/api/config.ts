export interface AppConfig {
  apiUrl: string;
  environment: "development" | "production" | "test";
  features: {
    enableAnalytics: boolean;
    enableOfflineMode: boolean;
    enableDebugLogging: boolean;
  };
  endpoints: {
    partnerships: string;
    applications: string;
    health: string;
  };
}

// Configuration by environment
const configs: Record<string, AppConfig> = {
  development: {
    apiUrl: "http://localhost:3004",
    environment: "development",
    features: {
      enableAnalytics: false,
      enableOfflineMode: true,
      enableDebugLogging: true,
    },
    endpoints: {
      partnerships: "/api/partnerships",
      applications: "/api/applications",
      health: "/api/health",
    },
  },
  production: {
    apiUrl: window.location.origin,
    environment: "production",
    features: {
      enableAnalytics: true,
      enableOfflineMode: false,
      enableDebugLogging: false,
    },
    endpoints: {
      partnerships: "/api/partnerships",
      applications: "/api/applications",
      health: "/api/health",
    },
  },
  test: {
    apiUrl: "http://localhost:3004",
    environment: "test",
    features: {
      enableAnalytics: false,
      enableOfflineMode: true,
      enableDebugLogging: true,
    },
    endpoints: {
      partnerships: "/api/partnerships",
      applications: "/api/applications",
      health: "/api/health",
    },
  },
};

// Get current environment
const getEnvironment = (): string => {
  return process.env.NODE_ENV || "development";
};

// Export config
export const appConfig: AppConfig = configs[getEnvironment()];

// Utility to check if API is available
export const checkAPIAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${appConfig.apiUrl}/api/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Utility to get API status
export const getAPIStatus = async (): Promise<{
  available: boolean;
  status: string;
  timestamp: string;
}> => {
  try {
    const response = await fetch(`${appConfig.apiUrl}/api/health`);
    if (response.ok) {
      const data = await response.json();
      return {
        available: true,
        status: "connected",
        timestamp: data.timestamp || new Date().toISOString(),
      };
    }
    return {
      available: false,
      status: "error",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      available: false,
      status: "unavailable",
      timestamp: new Date().toISOString(),
    };
  }
};

export default appConfig;
