import { apiClient } from './client';

export interface Invoice {
  _id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  period_start?: string | null;
  period_end?: string | null;
  pdf_url?: string | null;
  created_at?: string;
}

export interface PaginatedInvoices {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
}

export const invoicesApi = {
  getMyInvoices: async (page = 1, limit = 20): Promise<PaginatedInvoices> => {
    const response = await apiClient.get('/subscriptions/invoices', { params: { page, limit } });
    return response.data;
  },
};
