import api from './api';
import logger from '../utils/logger';

export interface SectionPhoto {
  id: number;
  url?: string; // backend pode retornar como accessor
  caminho?: string;
  titulo?: string | null;
  principal: boolean;
  ordem: number;
}

export interface SectionItemSummary {
  id: number;
  titulo: string;
  ordem: number;
  ativo: boolean;
}

export interface Section {
  id: number;
  slug: string;
  titulo: string;
  subtitulo?: string | null;
  descricao?: string | null;
  url_link?: string | null;
  texto_url?: string | null;
  botao?: boolean;
  template: 'destaques' | 'sobre' | 'servicos' | 'blog';
  show_on_home: boolean;
  ordem: number;
  ativo: boolean;
  published_at?: string | null;
  photos?: SectionPhoto[];
  items?: SectionItemSummary[];
}

export interface Pagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  has_more_pages: boolean;
}

export interface SectionListResponse {
  data: Section[];
  pagination: Pagination;
  links?: any;
  meta?: any;
}

export class SectionsService {
  // Anti-duplicação de GETs
  private static pendingList: Record<string, Promise<SectionListResponse> | undefined> = {};
  private static pendingGet: Record<number, Promise<Section> | undefined> = {};

  static async list(params?: { page?: number; per_page?: number; q?: string; ativo?: boolean; show_on_home?: boolean; slug?: string; template?: string; }): Promise<SectionListResponse> {
    const key = JSON.stringify(params || {});
    if (this.pendingList[key] !== undefined) {
      logger.debug(`[SECTIONS_SERVICE] Reutilizando list pendente: ${key}`);
      return this.pendingList[key]!;
    }
    this.pendingList[key] = (async () => {
      try {
        const resp = await api.get('/cms/sections', { params });
        return resp.data as SectionListResponse;
      } finally {
        delete this.pendingList[key];
      }
    })();
    return this.pendingList[key]!;
  }

  static async create(data: Partial<Section>): Promise<Section> {
    const resp = await api.post('/cms/sections', data);
    return resp.data as Section;
    }

  static async get(id: number): Promise<Section> {
    if (this.pendingGet[id] !== undefined) {
      return this.pendingGet[id]!;
    }
    this.pendingGet[id] = (async () => {
      try {
        const resp = await api.get(`/cms/sections/${id}`);
        return resp.data as Section;
      } finally {
        delete this.pendingGet[id];
      }
    })();
    return this.pendingGet[id]!;
  }

  static async update(id: number, data: Partial<Section>): Promise<Section> {
    const resp = await api.put(`/cms/sections/${id}`, data);
    return resp.data as Section;
  }

  static async remove(id: number): Promise<{ message: string }> {
    const resp = await api.delete(`/cms/sections/${id}`);
    return resp.data as { message: string };
  }

  // Fotos da Seção
  static async listPhotos(sectionId: number): Promise<SectionPhoto[]> {
    const resp = await api.get(`/cms/sections/${sectionId}/photos`);
    return resp.data as SectionPhoto[];
  }

  static async uploadPhotos(sectionId: number, files: File[]): Promise<{ uploaded: SectionPhoto[] }> {
    const form = new FormData();
    files.forEach((f) => form.append('files[]', f));
    const resp = await api.post(`/cms/sections/${sectionId}/photos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return resp.data as { uploaded: SectionPhoto[] };
  }

  static async updatePhoto(sectionId: number, photoId: number, data: Partial<SectionPhoto>): Promise<SectionPhoto> {
    const resp = await api.put(`/cms/sections/${sectionId}/photos/${photoId}`, data);
    return resp.data as SectionPhoto;
  }

  static async deletePhoto(sectionId: number, photoId: number): Promise<{ message: string }> {
    const resp = await api.delete(`/cms/sections/${sectionId}/photos/${photoId}`);
    return resp.data as { message: string };
  }
}
