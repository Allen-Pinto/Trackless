import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - clearing auth data');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth-expired'));
    }
    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string; // Cloudinary URL
  isActive: boolean;
  maxSites: number;
  createdAt: string;
  lastLogin?: string;
}

export interface Site {
  _id: string;
  siteId: string;
  userId: string;
  name: string;
  domain: string;
  description?: string;
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  totalEvents?: number;
  lastEventAt?: string;
}

// Analytics Interfaces
export interface AnalyticsOverview {
  totalPageviews: number;
  totalVisitors: number;
  totalSessions: number;
  averageDuration: number;
  bounceRate: number;
  growth: {
    pageviews: number;
    visitors: number;
    sessions: number;
  };
}

export interface PageviewData {
  date: string;
  pageviews: number;
  visitors: number;
}

export interface TopPage {
  page: string;
  pageviews: number;
  visitors: number;
  bounceRate: number;
}

export interface DeviceStats {
  desktop: number;
  mobile: number;
  tablet: number;
}

export interface TrafficSource {
  source: string;
  percentage: number;
  visitors: number;
}

// Notification Interfaces
export interface Notification {
  _id: string;
  userId: string;
  type: 'traffic' | 'performance' | 'milestone' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  siteId?: string;
  siteName?: string;
  metadata?: Record<string, any>;
}

// Utility function to validate token
export const validateToken = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    const response = await authApi.getProfile();
    return response.success;
  } catch (error) {
    return false;
  }
};

// Auth API
export const authApi = {
  signup: async (email: string, password: string, name: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = await api.post('/auth/signup', {
      email,
      password,
      name,
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (name: string): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.put('/auth/update-profile', {
      name,
    });
    return response.data;
  },

  updateProfilePicture: async (avatarFile: File): Promise<ApiResponse<{ user: User }>> => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.put('/auth/update-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  removeProfilePicture: async (): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.delete('/auth/remove-profile-picture');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// Sites API
export const sitesApi = {
  getSites: async (): Promise<ApiResponse<{ sites: Site[]; total: number; maxSites: number }>> => {
    const response: AxiosResponse<ApiResponse<{ sites: Site[]; total: number; maxSites: number }>> = await api.get('/sites');
    return response.data;
  },

  createSite: async (name: string, domain: string, description?: string): Promise<ApiResponse<{ site: Site }>> => {
    const response: AxiosResponse<ApiResponse<{ site: Site }>> = await api.post('/sites', {
      name,
      domain,
      description,
    });
    return response.data;
  },

  getSite: async (siteId: string): Promise<ApiResponse<{ site: Site }>> => {
    const response: AxiosResponse<ApiResponse<{ site: Site }>> = await api.get(`/sites/${siteId}`);
    return response.data;
  },

  updateSite: async (siteId: string, updates: Partial<Pick<Site, 'name' | 'description' | 'isPublic'>>): Promise<ApiResponse<{ site: Site }>> => {
    const response: AxiosResponse<ApiResponse<{ site: Site }>> = await api.put(`/sites/${siteId}`, updates);
    return response.data;
  },

  deleteSite: async (siteId: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/sites/${siteId}`);
    return response.data;
  },

  getTrackingSnippet: async (siteId: string): Promise<ApiResponse<{ siteId: string; snippet: string; instructions: string }>> => {
    const response: AxiosResponse<ApiResponse<{ siteId: string; snippet: string; instructions: string }>> = await api.get(`/sites/${siteId}/snippet`);
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getOverview: async (siteId: string, startDate?: string, endDate?: string): Promise<ApiResponse<AnalyticsOverview>> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response: AxiosResponse<ApiResponse<AnalyticsOverview>> = await api.get(`/analytics/overview?siteId=${siteId}&${params.toString()}`);
    return response.data;
  },

  getPageviews: async (siteId: string, startDate?: string, endDate?: string, interval: string = 'day'): Promise<ApiResponse<PageviewData[]>> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('interval', interval);
    
    const response: AxiosResponse<ApiResponse<PageviewData[]>> = await api.get(`/analytics/pageviews?siteId=${siteId}&${params.toString()}`);
    return response.data;
  },

  getTopPages: async (siteId: string, startDate?: string, endDate?: string, limit: number = 10): Promise<ApiResponse<TopPage[]>> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('limit', limit.toString());
    
    const response: AxiosResponse<ApiResponse<TopPage[]>> = await api.get(`/analytics/pages?siteId=${siteId}&${params.toString()}`);
    return response.data;
  },

  getDeviceStats: async (siteId: string, startDate?: string, endDate?: string): Promise<ApiResponse<DeviceStats>> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response: AxiosResponse<ApiResponse<DeviceStats>> = await api.get(`/analytics/devices?siteId=${siteId}&${params.toString()}`);
    return response.data;
  },

  getReferrerStats: async (siteId: string, startDate?: string, endDate?: string, limit: number = 10): Promise<ApiResponse<TrafficSource[]>> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('limit', limit.toString());
    
    const response: AxiosResponse<ApiResponse<TrafficSource[]>> = await api.get(`/analytics/referrers?siteId=${siteId}&${params.toString()}`);
    return response.data;
  },
};

// Notifications API
export const notificationsApi = {
  // Get all notifications for the user
  getNotifications: async (): Promise<ApiResponse<{ notifications: Notification[] }>> => {
    const response: AxiosResponse<ApiResponse<{ notifications: Notification[] }>> = await api.get('/notifications');
    return response.data;
  },

  // Mark a notification as read
  markAsRead: async (notificationId: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post('/notifications/read-all');
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response: AxiosResponse<ApiResponse<{ count: number }>> = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Delete a notification
  deleteNotification: async (notificationId: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Clear all notifications
  clearAll: async (): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete('/notifications/clear-all');
    return response.data;
  },
};

export default api;