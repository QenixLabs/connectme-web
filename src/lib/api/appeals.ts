import { apiClient } from './client';

export interface Appeal {
  _id: string;
  user_id: string;
  type: string;
  reason: string;
  status: string;
  admin_response?: string;
  reviewed_by?: { _id: string; email: string };
  reviewed_at?: string;
  created_at: string;
}

export const appealsApi = {
  create: async (reason: string, type?: string): Promise<Appeal> => {
    const response = await apiClient.post('/appeals', { reason, type });
    return response.data;
  },

  getMyAppeals: async (): Promise<Appeal[]> => {
    const response = await apiClient.get('/appeals/my');
    return response.data;
  },
};
