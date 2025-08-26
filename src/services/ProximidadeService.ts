import api from './api';
import logger from '../utils/logger';

export interface Proximidade {
  id: number;
  nome: string;
  sistema?: boolean | number;
  created_at?: string;
  updated_at?: string;
}

class ProximidadeService {
  private static pendingList: Record<string, Promise<{ data: Proximidade[]; total: number; current_page: number; per_page: number }> | undefined> = {};
  private static pendingSearch: Record<string, Promise<{ data: Proximidade[]; total: number; current_page: number; per_page: number }> | undefined> = {};

  static async getProximidades(params?: {
    page?: number;
    per_page?: number;
  }): Promise<{ data: Proximidade[]; total: number; current_page: number; per_page: number }> {
    const key = JSON.stringify(params || {});
    if (this.pendingList[key]) {
      logger.info('Reutilizando chamada pendente de getProximidades');
      return this.pendingList[key]!;
    }

    const promise = (async () => {
      try {
        logger.info('Buscando proximidades', params);
        const response = await api.get('/proximidades', { params });
        return response.data as { data: Proximidade[]; total: number; current_page: number; per_page: number };
      } catch (error) {
        logger.error('Erro ao buscar proximidades:', error);
        throw error;
      } finally {
        delete this.pendingList[key];
      }
    })();

    this.pendingList[key] = promise;
    return promise;
  }

  static async searchProximidades(params?: {
    page?: number;
    per_page?: number;
    nome?: string;
  }): Promise<{ data: Proximidade[]; total: number; current_page: number; per_page: number }> {
    const key = JSON.stringify(params || {});
    if (this.pendingSearch[key]) {
      logger.info('Reutilizando chamada pendente de searchProximidades');
      return this.pendingSearch[key]!;
    }

    const promise = (async () => {
      try {
        logger.info('Buscando proximidades (search)', params);
        const response = await api.get('/proximidades/search', { params });
        return response.data as { data: Proximidade[]; total: number; current_page: number; per_page: number };
      } catch (error) {
        logger.error('Erro na busca de proximidades:', error);
        throw error;
      } finally {
        delete this.pendingSearch[key];
      }
    })();

    this.pendingSearch[key] = promise;
    return promise;
  }

  static async createProximidade(payload: { nome: string }): Promise<Proximidade> {
    try {
      logger.info('Criando proximidade', payload);
      const response = await api.post('/proximidades', payload);
      return response.data as Proximidade;
    } catch (error) {
      logger.error('Erro ao criar proximidade:', error);
      throw error;
    }
  }

  static async updateProximidade(id: number, payload: Partial<{ nome: string }>): Promise<Proximidade> {
    try {
      logger.info(`Atualizando proximidade ${id}`, payload);
      const response = await api.put(`/proximidades/${id}`, payload);
      return response.data as Proximidade;
    } catch (error) {
      logger.error(`Erro ao atualizar proximidade ${id}:`, error);
      throw error;
    }
  }

  static async deleteProximidade(id: number): Promise<void> {
    try {
      logger.info(`Removendo proximidade ${id}`);
      await api.delete(`/proximidades/${id}`);
    } catch (error) {
      logger.error(`Erro ao remover proximidade ${id}:`, error);
      throw error;
    }
  }
}

export default ProximidadeService;
