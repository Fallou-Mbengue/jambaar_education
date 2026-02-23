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
};
