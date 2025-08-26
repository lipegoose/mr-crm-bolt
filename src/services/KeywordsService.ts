import api from './api';
import logger from '../utils/logger';

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
  links?: any;
  meta?: any;
}

export class KeywordsService {
  private static pendingList: Record<string, Promise<KeywordListResponse>> = {};
  private static pendingGet: Record<number, Promise<Keyword>> = {};

  static async list(params?: { page?: number; per_page?: number; q?: string }): Promise<KeywordListResponse> {
    const key = JSON.stringify(params || {});
    const pending = this.pendingList[key];
    if (pending) {
      logger.debug(`[KEYWORDS_SERVICE] Reutilizando list pendente: ${key}`);
      return pending;
    }
    this.pendingList[key] = (async () => {
      try {
        const resp = await api.get('/cms/sections/keywords', { params });
        return resp.data as KeywordListResponse;
      } finally {
        delete this.pendingList[key];
      }
    })();
    return this.pendingList[key];
  }

  static async get(id: number): Promise<Keyword> {
    const pending = this.pendingGet[id];
    if (pending) return pending;
    this.pendingGet[id] = (async () => {
      try {
        // Caso o backend não tenha GET /keywords/:id, poderemos filtrar da list
        const resp = await api.get(`/cms/sections/keywords`, { params: { id } });
        const list = (resp.data as KeywordListResponse).data;
        const found = list.find(k => k.id === id);
        if (!found) throw new Error('Keyword não encontrada');
        return found;
      } finally {
        delete this.pendingGet[id];
      }
    })();
    return this.pendingGet[id];
  }

  static async create(data: { nome: string; slug?: string; descricao?: string | null }): Promise<Keyword> {
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
