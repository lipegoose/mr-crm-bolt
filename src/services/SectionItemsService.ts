import api from './api';
import logger from '../utils/logger';

export interface ItemPhoto {
  id: number;
  url?: string;
  path?: string;
  principal: boolean;
  ordem: number;
  alt_text?: string | null;
}

export interface SectionItem {
  id: number;
  section_id: number;
  titulo: string;
  subtitulo?: string | null;
  descricao?: string | null;
  url_link?: string | null;
  texto_url?: string | null;
  botao?: boolean;
  slug?: string | null;
  show_on_home?: boolean;
  ordem: number;
  ativo: boolean;
  photos?: ItemPhoto[];
  keywords?: { id: number; nome: string; slug: string }[];
}

export interface Pagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  has_more_pages: boolean;
}

export interface ItemListResponse {
  data: SectionItem[];
  pagination: Pagination;
  links?: any;
  meta?: any;
}

export class SectionItemsService {
  private static pendingList: Record<string, Promise<ItemListResponse>> = {};
  private static pendingGet: Record<string, Promise<SectionItem>> = {};

  static async list(sectionId: number, params?: { page?: number; per_page?: number; q?: string; ativo?: boolean }): Promise<ItemListResponse> {
    const key = JSON.stringify({ sectionId, ...(params || {}) });
    const pending = this.pendingList[key];
    if (pending) {
      logger.debug(`[SECTION_ITEMS_SERVICE] Reutilizando list pendente: ${key}`);
      return pending;
    }
    this.pendingList[key] = (async () => {
      try {
        const resp = await api.get(`/cms/sections/${sectionId}/items`, { params });
        const payload = resp.data as any;
        // Suporta dois formatos:
        // 1) Array simples de itens
        // 2) Resposta paginada do Laravel com { data, current_page, per_page, last_page, total, ... }
        if (Array.isArray(payload)) {
          const data = payload as SectionItem[];
          const pagination: Pagination = {
            total: data.length,
            count: data.length,
            per_page: data.length,
            current_page: 1,
            total_pages: 1,
            has_more_pages: false,
          };
          return { data, pagination } as ItemListResponse;
        }

        const data = (payload?.data ?? []) as SectionItem[];
        const current_page = Number(payload?.current_page ?? 1);
        const per_page = Number(payload?.per_page ?? (Array.isArray(data) ? data.length : 0));
        const last_page = Number(payload?.last_page ?? 1);
        const total = Number(payload?.total ?? (Array.isArray(data) ? data.length : 0));
        const pagination: Pagination = {
          total,
          count: Array.isArray(data) ? data.length : 0,
          per_page,
          current_page,
          total_pages: last_page,
          has_more_pages: current_page < last_page,
        };
        return { data, pagination, links: payload?.links, meta: payload?.meta } as ItemListResponse;
      } finally {
        delete this.pendingList[key];
      }
    })();
    return this.pendingList[key];
  }

  static async create(sectionId: number, data: Partial<SectionItem>): Promise<SectionItem> {
    const resp = await api.post(`/cms/sections/${sectionId}/items`, data);
    return resp.data as SectionItem;
  }

  static async get(sectionId: number, itemId: number): Promise<SectionItem> {
    const key = `${sectionId}:${itemId}`;
    const pending = this.pendingGet[key];
    if (pending) return pending;
    this.pendingGet[key] = (async () => {
      try {
        const resp = await api.get(`/cms/sections/${sectionId}/items/${itemId}`);
        return resp.data as SectionItem;
      } finally {
        delete this.pendingGet[key];
      }
    })();
    return this.pendingGet[key];
  }

  static async update(sectionId: number, itemId: number, data: Partial<SectionItem>): Promise<SectionItem> {
    const resp = await api.put(`/cms/sections/${sectionId}/items/${itemId}`, data);
    return resp.data as SectionItem;
  }

  static async remove(sectionId: number, itemId: number): Promise<{ message: string }> {
    const resp = await api.delete(`/cms/sections/${sectionId}/items/${itemId}`);
    return resp.data as { message: string };
  }

  // Fotos do Item
  static async listPhotos(sectionId: number, itemId: number): Promise<ItemPhoto[]> {
    const resp = await api.get(`/cms/sections/${sectionId}/items/${itemId}/photos`);
    return resp.data as ItemPhoto[];
  }

  static async uploadPhotos(sectionId: number, itemId: number, files: File[]): Promise<{ uploaded: ItemPhoto[] }> {
    const form = new FormData();
    files.forEach((f) => form.append('files[]', f));
    const resp = await api.post(`/cms/sections/${sectionId}/items/${itemId}/photos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return resp.data as { uploaded: ItemPhoto[] };
  }

  static async updatePhoto(sectionId: number, itemId: number, photoId: number, data: Partial<ItemPhoto>): Promise<ItemPhoto> {
    const resp = await api.put(`/cms/sections/${sectionId}/items/${itemId}/photos/${photoId}`, data);
    return resp.data as ItemPhoto;
  }

  static async deletePhoto(sectionId: number, itemId: number, photoId: number): Promise<{ message: string }> {
    const resp = await api.delete(`/cms/sections/${sectionId}/items/${itemId}/photos/${photoId}`);
    return resp.data as { message: string };
  }

  // Vinculação de keywords
  static async attachKeywords(sectionId: number, itemId: number, keywordIds: number[]): Promise<{ message: string }> {
    const resp = await api.post(`/cms/sections/${sectionId}/items/${itemId}/keywords`, { keyword_ids: keywordIds });
    return resp.data as { message: string };
  }

  static async detachKeyword(sectionId: number, itemId: number, keywordId: number): Promise<{ message: string }> {
    const resp = await api.delete(`/cms/sections/${sectionId}/items/${itemId}/keywords/${keywordId}`);
    return resp.data as { message: string };
  }
}
