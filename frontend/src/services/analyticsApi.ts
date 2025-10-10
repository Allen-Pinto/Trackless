// Types based on your backend
export interface AnalyticsOverview {
  pageviews: number;
  uniqueVisitors: number;
  sessions: number;
  avgDuration: number;
  bounceRate: number;
  activeSessions?: number;
}

export interface Site {
  siteId: string;
  name: string;
  domain: string;
  totalEvents?: number;
  lastEventAt?: string | null;
}

export interface TopPage {
  page: string;
  views: number;
  uniqueVisitors: number;
}

export interface DeviceStats {
  device: string;
  pageviews: number;
  uniqueVisitors: number;
}

export interface TrafficSource {
  referrer: string;
  visits: number;
  uniqueVisitors: number;
}

export interface SitesResponse {
  success: boolean;
  data: {
    sites: Site[];
    total: number;
    maxSites: number;
  };
}

export interface AnalyticsResponse<T> {
  success: boolean;
  data: T;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function for API requests
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  // Define headers with proper typing
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-expired'));
      throw new Error('Authentication expired. Please login again.');
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// API Service Functions
export const analyticsApi = {
  // Get all sites for the user
  async getSites(): Promise<Site[]> {
    const data: SitesResponse = await apiRequest('/api/sites');
    return data.data.sites;
  },

  // Get analytics overview
  async getOverview(siteId: string, startDate?: string, endDate?: string): Promise<AnalyticsOverview> {
    const params = new URLSearchParams({ siteId });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const data: AnalyticsResponse<AnalyticsOverview> = await apiRequest(`/api/analytics/overview?${params}`);
    return data.data;
  },

  // Get top pages
  async getTopPages(siteId: string, startDate?: string, endDate?: string, limit: number = 5): Promise<TopPage[]> {
    const params = new URLSearchParams({ 
      siteId, 
      limit: limit.toString() 
    });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const data: AnalyticsResponse<TopPage[]> = await apiRequest(`/api/analytics/pages?${params}`);
    return data.data;
  },

  // Get device statistics
  async getDeviceStats(siteId: string, startDate?: string, endDate?: string): Promise<DeviceStats[]> {
    const params = new URLSearchParams({ siteId });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const data: AnalyticsResponse<DeviceStats[]> = await apiRequest(`/api/analytics/devices?${params}`);
    return data.data;
  },

  // Get traffic sources
  async getReferrerStats(siteId: string, startDate?: string, endDate?: string, limit: number = 4): Promise<TrafficSource[]> {
    const params = new URLSearchParams({ 
      siteId, 
      limit: limit.toString() 
    });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const data: AnalyticsResponse<TrafficSource[]> = await apiRequest(`/api/analytics/referrers?${params}`);
    return data.data;
  },

  // Get pageviews over time (for charts)
  async getPageviewsOverTime(siteId: string, startDate?: string, endDate?: string): Promise<any[]> {
    const params = new URLSearchParams({ siteId });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const data: AnalyticsResponse<any[]> = await apiRequest(`/api/analytics/pageviews?${params}`);
    return data.data;
  },

  // Get complete dashboard data (uses your /dashboard endpoint)
  async getDashboardData(siteId: string, startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams({ siteId });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const data: AnalyticsResponse<any> = await apiRequest(`/api/analytics/dashboard?${params}`);
    return data.data;
  }
};