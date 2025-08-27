import api from './api';

export interface Keyword {
  id: number;
  nome: string;
  slug: string;
  descricao?: string | null;
}

export interface Pagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  has_more_pages: boolean;
}

export interface KeywordListResponse {
  data: Keyword[];
  pagination: Pagination;
}

export class KeywordService {
  static async list(params?: { q?: string; page?: number; per_page?: number }): Promise<KeywordListResponse> {
    const resp = await api.get('/cms/sections/keywords', { params });
    const payload = resp.data;
    if (Array.isArray(payload)) {
      return {
        data: payload as Keyword[],
        pagination: {
          total: payload.length,
          count: payload.length,
          per_page: payload.length,
          current_page: 1,
          total_pages: 1,
          has_more_pages: false,
        },
      };
    }
    const data = (payload?.data ?? []) as Keyword[];
    const current_page = Number(payload?.current_page ?? 1);
    const per_page = Number(payload?.per_page ?? (Array.isArray(data) ? data.length : 0));
    const last_page = Number(payload?.last_page ?? 1);
    const total = Number(payload?.total ?? (Array.isArray(data) ? data.length : 0));
    return {
      data,
      pagination: {
        total,
        count: Array.isArray(data) ? data.length : 0,
        per_page,
        current_page,
        total_pages: last_page,
        has_more_pages: current_page < last_page,
      },
    };
  }

  static async create(data: Partial<Keyword>): Promise<Keyword> {
    const resp = await api.post('/cms/sections/keywords', data);
    return resp.data as Keyword;
  }

  static async update(id: number, data: Partial<Keyword>): Promise<Keyword> {
    const resp = await api.put(`/cms/sections/keywords/${id}`, data);
    return resp.data as Keyword;
  }

  static async remove(id: number): Promise<{ message: string }> {
    const resp = await api.delete(`/cms/sections/keywords/${id}`);
    return resp.data as { message: string };
  }
}
