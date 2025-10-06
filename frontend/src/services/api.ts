import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: 'MAIN' | 'SIDE' | 'DRINK' | 'DESSERT' | 'OTHER';
  imageUrl: string | null;
  weekday: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';
  dietaryTags: string[];
  isActive: boolean;
  customizations: MenuItemCustomization[];
}

export interface MenuItemCustomization {
  id: string;
  menuItemId: string;
  customizationName: string;
}

export interface TodaysMenuResponse {
  success: boolean;
  data: {
    items: MenuItem[];
    weekday: string | null;
  };
  message?: string;
}

export interface WeeklyMenuResponse {
  success: boolean;
  data: {
    MONDAY: MenuItem[];
    TUESDAY: MenuItem[];
    WEDNESDAY: MenuItem[];
    THURSDAY: MenuItem[];
    FRIDAY: MenuItem[];
  };
}

// Menu API
export const menuApi = {
  getTodaysMenu: async (): Promise<TodaysMenuResponse> => {
    const response = await api.get('/menu/today');
    return response.data;
  },

  getWeeklyMenu: async (): Promise<WeeklyMenuResponse> => {
    const response = await api.get('/menu/week');
    return response.data;
  },

  getMenuItem: async (id: string): Promise<{ success: boolean; data: MenuItem }> => {
    const response = await api.get(`/menu/items/${id}`);
    return response.data;
  },
};

export default api;
