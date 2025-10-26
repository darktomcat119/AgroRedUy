/**
 * @fileoverview API client for AgroRedUy frontend
 * Handles all API communication with the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: 'REQUEST_FAILED',
            message: 'Request failed'
          }
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred'
        }
      };
    }
  }

  // Authentication endpoints
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async registerContractor(contractorData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    businessName: string;
    businessDescription: string;
    businessAddress: string;
    businessCity: string;
    businessDepartment: string;
    certifications?: string[];
    yearsExperience?: number;
  }) {
    const response = await this.request('/auth/register-contractor', {
      method: 'POST',
      body: JSON.stringify(contractorData),
    });

    if (response.success && response.data?.accessToken) {
      this.setToken(response.data.accessToken);
    }

    return response;
  }

  async verifyEmail(token: string) {
    return await this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resendVerificationEmail(email: string) {
    return await this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.accessToken) {
      this.setToken(response.data.accessToken);
    }

    return response;
  }

  async logout() {
    this.setToken(null);
    return this.request('/auth/logout', { method: 'POST' });
  }

  async refreshToken(refreshToken: string) {
    const response = await this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (response.success && response.data?.accessToken) {
      this.setToken(response.data.accessToken);
    }

    return response;
  }

  // Service endpoints
  async getServices(filters: {
    categoryId?: string;
    city?: string;
    department?: string;
    minPrice?: number;
    maxPrice?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request<PaginatedResponse<any>>(`/services?${params.toString()}`);
  }

  async getService(id: string) {
    return this.request<any>(`/services/${id}`);
  }

  async createService(serviceData: {
    title: string;
    description: string;
    pricePerHour: number;
    priceMin?: number;
    priceMax?: number;
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    department: string;
    categoryId: string;
  }) {
    return this.request<any>('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async updateService(id: string, serviceData: any) {
    return this.request<any>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
  }

  async deleteService(id: string) {
    return this.request(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserServices(page = 1, limit = 20) {
    return this.request<PaginatedResponse<any>>(`/services/user/my-services?page=${page}&limit=${limit}`);
  }

  // User profile endpoints
  async getUserProfile(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  async updateUserProfile(id: string, userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    department?: string;
    dateOfBirth?: string;
    gender?: string;
    profileImageUrl?: string;
  }) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getPublicUserProfile(id: string) {
    return this.request<any>(`/users/${id}/profile`);
  }

  // Booking endpoints
  async getBookings(page = 1, limit = 20) {
    return this.request<PaginatedResponse<any>>(`/bookings?page=${page}&limit=${limit}`);
  }

  async getBooking(id: string) {
    return this.request<any>(`/bookings/${id}`);
  }

  async createBooking(bookingData: {
    serviceId: string;
    availabilityId: string;
    durationHours: number;
    notes?: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
  }) {
    return this.request<any>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBooking(id: string, bookingData: any) {
    return this.request<any>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  }

  async cancelBooking(id: string) {
    return this.request(`/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  async getServiceBookings(serviceId: string, page = 1, limit = 20) {
    return this.request<PaginatedResponse<any>>(`/bookings/service/${serviceId}?page=${page}&limit=${limit}`);
  }

  // Admin endpoints
  async getAnalytics() {
    return this.request<any>('/admin/analytics');
  }

  async getUsers(filters: {
    role?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request<PaginatedResponse<any>>(`/admin/users?${params.toString()}`);
  }

  async getUser(id: string) {
    return this.request<any>(`/admin/users/${id}`);
  }

  async updateUser(id: string, userData: any) {
    return this.request<any>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminServices(filters: {
    categoryId?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request<PaginatedResponse<any>>(`/admin/services?${params.toString()}`);
  }

  async getContentManagement() {
    return this.request<any>('/admin/content');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export the class for testing
export { ApiClient };
