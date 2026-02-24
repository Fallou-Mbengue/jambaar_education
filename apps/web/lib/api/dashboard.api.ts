import apiClient from './client';

export interface DashboardKPIs {
  users: {
    total: number;
    trend: number;
    active30d: number;
    active7d: number;
    retentionRate30d: number;
  };
  content: {
    total: number;
    trend: number;
    published: number;
  };
  payments: {
    total: number;
    trend: number;
  };
  billing: {
    activeSubscriptions: number;
    totalRevenueXof: number;
    trend: number;
  };
}

export interface RecentTransaction {
  id: string;
  transactionRef: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  courseName: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
}

export interface RecentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export interface DashboardUser {
  id: string;
  email: string;
  role: 'USER' | 'COACH' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  profile?: {
    firstName: string;
    lastName: string;
    phone?: string;
    avatarKey?: string;
  };
  completedContent: number;
  activeSubscription?: {
    plan: { name: string };
  } | null;
}

export interface DashboardUserList {
  items: DashboardUser[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const dashboardApi = {
  async getKpis(): Promise<DashboardKPIs> {
    const response = await apiClient.get('/dashboard/kpis');
    return response.data.data;
  },

  async getRecentTransactions(limit = 5): Promise<RecentTransaction[]> {
    const response = await apiClient.get(`/dashboard/recent-transactions?limit=${limit}`);
    return response.data.data;
  },

  async getRecentUsers(limit = 5): Promise<RecentUser[]> {
    const response = await apiClient.get(`/dashboard/recent-users?limit=${limit}`);
    return response.data.data;
  },

  async getUsers(params: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<DashboardUserList> {
    const response = await apiClient.get('/dashboard/users', { params });
    return response.data.data;
  },

  async toggleUserStatus(userId: string): Promise<{ id: string; isActive: boolean }> {
    const response = await apiClient.patch(`/dashboard/users/${userId}/toggle-status`);
    return response.data.data;
  },

  async deleteUser(userId: string): Promise<{ deleted: boolean }> {
    const response = await apiClient.delete(`/dashboard/users/${userId}`);
    return response.data.data;
  },
};
