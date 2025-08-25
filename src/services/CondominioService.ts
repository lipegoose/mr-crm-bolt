import api from './api';
import logger from '../utils/logger';

export interface Condominio {
  id: number;
  nome: string;
  descricao?: string;
  cep?: string;
  uf?: string;
  cidade?: string;
  bairro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  latitude?: number | string;
  longitude?: number | string;
  created_at?: string;
  updated_at?: string;
}

export class CondominioService {
  // Controles para evitar chamadas duplicadas (StrictMode)
  private static pendingList: Record<string, Promise<{ data: Condominio[]; total: number; current_page: number; per_page: number }> | undefined> = {};
  private static pendingSearch: Record<string, Promise<{ data: Condominio[]; total: number; current_page: number; per_page: number }> | undefined> = {};

  static async getCondominio(id: number): Promise<Condominio> {
    try {
      logger.info(`Buscando condomínio ID: ${id}`);
      const response = await api.get(`/condominios/${id}`);
      return response.data as Condominio;
    } catch (error) {
      logger.error(`Erro ao buscar condomínio ID ${id}:`, error);
      throw error;
    }
  }

  static async getCondominios(params?: { page?: number; per_page?: number }): Promise<{ data: Condominio[]; total: number; current_page: number; per_page: number }> {
    const key = JSON.stringify(params || {});
    if (this.pendingList[key]) {
      logger.info('Reutilizando chamada pendente de getCondominios');
      return this.pendingList[key]!;
    }

    const promise = (async () => {
      try {
        logger.info('Buscando lista de condomínios');
        const response = await api.get('/condominios', { params });
        return response.data as { data: Condominio[]; total: number; current_page: number; per_page: number };
      } catch (error) {
        logger.error('Erro ao buscar condomínios:', error);
        throw error;
      } finally {
        delete this.pendingList[key];
      }
    })();

    this.pendingList[key] = promise;
    return promise;
  }

  static async searchCondominios(params?: { page?: number; per_page?: number; nome?: string; cidade?: string; bairro?: string; uf?: string; }): Promise<{ data: Condominio[]; total: number; current_page: number; per_page: number }> {
    const key = JSON.stringify(params || {});
    if (this.pendingSearch[key]) {
      logger.info('Reutilizando chamada pendente de searchCondominios');
      return this.pendingSearch[key]!;
    }

    const promise = (async () => {
      try {
        logger.info('Buscando condomínios (search)');
        const response = await api.get('/condominios/search', { params });
        return response.data as { data: Condominio[]; total: number; current_page: number; per_page: number };
      } catch (error) {
        logger.error('Erro na busca de condomínios:', error);
        throw error;
      } finally {
        delete this.pendingSearch[key];
      }
    })();

    this.pendingSearch[key] = promise;
    return promise;
  }

  static async createCondominio(data: Partial<Condominio> & { nome: string }): Promise<Condominio> {
    try {
      logger.info('Criando novo condomínio');
      const response = await api.post('/condominios', data);
      return response.data as Condominio;
    } catch (error) {
      logger.error('Erro ao criar condomínio:', error);
      throw error;
    }
  }

  static async updateCondominio(id: number, data: Partial<Condominio>): Promise<Condominio> {
    try {
      logger.info(`Atualizando condomínio ID: ${id}`);
      const response = await api.put(`/condominios/${id}`, data);
      return response.data as Condominio;
    } catch (error) {
      logger.error(`Erro ao atualizar condomínio ID ${id}:`, error);
      throw error;
    }
  }

  static async deleteCondominio(id: number): Promise<void> {
    try {
      logger.info(`Removendo condomínio ID: ${id}`);
      await api.delete(`/condominios/${id}`);
    } catch (error) {
      logger.error(`Erro ao remover condomínio ID ${id}:`, error);
      throw error;
    }
  }
}

export default CondominioService;
