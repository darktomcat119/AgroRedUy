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

export interface AdminUsersResponse {
  users: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminServicesResponse {
  services: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
    const headers = new Headers(options.headers as HeadersInit);
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (this.token) headers.set('Authorization', `Bearer ${this.token}`);

    try {
      const response = await fetch(url, { ...options, headers });

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
    address?: string;
    city?: string;
    department?: string;
    dateOfBirth?: string;
    gender?: string;
    occupation?: string;
    company?: string;
    interests?: string[];
    newsletter?: boolean;
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

    if ((response as any).success && (response as any).data?.accessToken) {
      this.setToken((response as any).data.accessToken);
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

    if ((response as any).success && (response as any).data?.accessToken) {
      this.setToken((response as any).data.accessToken);
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

    if ((response as any).success && (response as any).data?.accessToken) {
      this.setToken((response as any).data.accessToken);
    }

    return response;
  }

  // Service endpoints
  async getServices(filters: {
    categoryId?: string;
    city?: string;
    department?: string;
    area?: string;
    startDate?: string;
    endDate?: string;
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
    return this.request<any>('/admin/statistics');
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

    return this.request<AdminUsersResponse>(`/admin/users?${params.toString()}`);
  }

  async getUser(id: string) {
    return this.request<any>(`/admin/users/${id}`);
  }

  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
    isActive?: boolean;
    emailVerified?: boolean;
    address?: string;
    city?: string;
    department?: string;
    dateOfBirth?: string;
    gender?: string;
    occupation?: string;
    company?: string;
    interests?: string;
    newsletter?: boolean;
    profileImageUrl?: string;
  }) {
    return this.request<any>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
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
    category?: string;
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

    return this.request<AdminServicesResponse>(`/admin/services?${params.toString()}`);
  }

  async createAdminService(data: {
    title: string;
    description: string;
    price: number;
    priceCurrency?: string;
    priceMin?: number;
    priceMax?: number;
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    department: string;
    categoryId: string;
    unit_id: string;
    images?: string[];
    schedule?: { startDate: string; endDate: string; startTime: string; endTime: string };
  }) {
    return this.request<any>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUnits() {
    return this.request<Array<{ id: string; name: string; symbol: string; description?: string }>>('/admin/units');
  }

  async updateAdminService(id: string, data: Partial<{
    title: string;
    description: string;
    price: number;
    priceCurrency: string;
    priceMin: number;
    priceMax: number;
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    department: string;
    categoryId: string;
    unit_id: string;
    isActive: boolean;
    subBadges?: Array<{ name: string; iconUrl?: string }>;
    radius?: number;
    mapZoom?: number;
    schedule?: { startDate: string; endDate: string };
  }>) {
    console.log('API Client - Sending update request with data:', JSON.stringify(data, null, 2));
    return this.request<any>(`/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminService(id: string) {
    return this.request(`/admin/services/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminServiceDetails(id: string) {
    return this.request<any>(`/admin/services/${id}`);
  }

  async deleteAdminServiceImage(serviceId: string, imageId: string) {
    return this.request<void>(`/admin/services/${serviceId}/images/${imageId}`, {
      method: 'DELETE'
    });
  }

  // duplicate removed

  // Reports API methods
  async generateReport(reportData: {
    type: 'user_activity' | 'service_performance' | 'revenue_analysis' | 'booking_trends' | 'contractor_performance';
    period: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'custom';
    startDate?: string;
    endDate?: string;
    format?: 'json' | 'csv' | 'pdf';
  }) {
    return this.request<any>('/admin/reports/generate', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async getReports(filters: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  } = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request<PaginatedResponse<any>>(`/admin/reports?${params.toString()}`);
  }

  async getReportDetails(id: string) {
    return this.request<any>(`/admin/reports/${id}`);
  }

  async deleteReport(id: string) {
    return this.request(`/admin/reports/${id}`, {
      method: 'DELETE',
    });
  }

  // Settings API methods
  async getSettings() {
    return this.request<any>('/admin/settings');
  }

  async updateSettings(category: string, settings: any) {
    return this.request<any>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ category, settings }),
    });
  }

  async resetSettings(category: string) {
    return this.request<any>('/admin/settings/reset', {
      method: 'POST',
      body: JSON.stringify({ category }),
    });
  }

  async getSystemHealth() {
    return this.request<any>('/admin/health');
  }

  // Category Management API methods (SuperAdmin only)
  async getCategories() {
    return this.request<Category[]>('/admin/categories');
  }

  async createCategory(categoryData: {
    name: string;
    description?: string;
    iconUrl?: string;
  }) {
    return this.request<Category>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateCategory(id: string, categoryData: {
    name?: string;
    description?: string;
    iconUrl?: string;
    isActive?: boolean;
  }) {
    return this.request<Category>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  }

  async deleteCategory(id: string) {
    return this.request<void>(`/admin/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // Sub-badge endpoints
  async getSubBadges() {
    return this.request<any[]>('/admin/sub-badges');
  }

  async createSubBadge(subBadgeData: {
    name: string;
    iconUrl?: string;
    serviceId: string;
  }) {
    return this.request<any>('/admin/sub-badges', {
      method: 'POST',
      body: JSON.stringify(subBadgeData)
    });
  }

  async updateSubBadge(id: string, subBadgeData: {
    name?: string;
    iconUrl?: string;
    sortOrder?: number;
  }) {
    return this.request<any>(`/admin/sub-badges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subBadgeData)
    });
  }

  async deleteSubBadge(id: string) {
    return this.request<void>(`/admin/sub-badges/${id}`, {
      method: 'DELETE'
    });
  }

  // Security API methods
  async getSecurityLogs(filters: {
    page?: number;
    limit?: number;
    level?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request<PaginatedResponse<any>>(`/admin/security/logs?${params.toString()}`);
  }

  async getSecurityStats(period: string = '7d') {
    return this.request<any>(`/admin/security/stats?period=${period}`);
  }

  async blockIpAddress(ipAddress: string, reason: string, duration?: string) {
    return this.request<any>('/admin/security/block-ip', {
      method: 'POST',
      body: JSON.stringify({ ipAddress, reason, duration }),
    });
  }

  async unblockIpAddress(ipAddress: string) {
    return this.request<any>(`/admin/security/unblock-ip/${ipAddress}`, {
      method: 'DELETE',
    });
  }

  async resolveSecurityLog(logId: string, resolution: string, notes?: string) {
    return this.request<any>(`/admin/security/resolve-log/${logId}`, {
      method: 'PUT',
      body: JSON.stringify({ resolution, notes }),
    });
  }

  async getContentManagement() {
    return this.request<any>('/admin/content');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Notification endpoints
  async getNotifications(options?: { unreadOnly?: boolean; limit?: number }) {
    const params = new URLSearchParams();
    if (options?.unreadOnly) params.append('unreadOnly', 'true');
    if (options?.limit) params.append('limit', options.limit.toString());
    return this.request<any[]>(`/notifications${params.toString() ? `?${params.toString()}` : ''}`);
  }

  async getUnreadNotificationCount() {
    return this.request<{ count: number }>('/notifications/unread/count');
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT'
    });
  }

  async deleteNotification(notificationId: string) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE'
    });
  }

  // Schedule request endpoints
  async createScheduleRequest(data: {
    serviceId: string;
    startDate: string;
    endDate: string;
    message?: string;
  }) {
    return this.request('/schedule-requests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getServiceScheduleRequests(serviceId: string, status?: string) {
    const params = status ? `?status=${status}` : '';
    return this.request<any[]>(`/schedule-requests/service/${serviceId}${params}`);
  }

  async getUserScheduleRequests(status?: string) {
    const params = status ? `?status=${status}` : '';
    return this.request<any[]>(`/schedule-requests/user${params}`);
  }

  async acceptScheduleRequest(requestId: string) {
    return this.request(`/schedule-requests/${requestId}/accept`, {
      method: 'PUT'
    });
  }

  async rejectScheduleRequest(requestId: string, reason?: string) {
    return this.request(`/schedule-requests/${requestId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  }

  async checkAcceptedRequest(serviceId: string) {
    return this.request<{ hasAccepted: boolean }>(`/schedule-requests/check/${serviceId}`);
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export the class for testing
export { ApiClient };
