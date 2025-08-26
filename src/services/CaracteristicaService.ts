import api from './api';
import logger from '../utils/logger';

export type CaracteristicaEscopo = 'IMOVEL' | 'CONDOMINIO';

export interface Caracteristica {
  id: number;
  nome: string;
  escopo: CaracteristicaEscopo;
  sistema?: boolean | number;
  created_at?: string;
  updated_at?: string;
}

class CaracteristicaService {
  private static pendingList: Record<string, Promise<{ data: Caracteristica[]; total: number; current_page: number; per_page: number }> | undefined> = {};
  private static pendingSearch: Record<string, Promise<{ data: Caracteristica[]; total: number; current_page: number; per_page: number }> | undefined> = {};

  static async getCaracteristicas(params?: {
    page?: number;
    per_page?: number;
    escopo?: CaracteristicaEscopo;
  }): Promise<{ data: Caracteristica[]; total: number; current_page: number; per_page: number }> {
    const key = JSON.stringify(params || {});
    if (this.pendingList[key]) {
      logger.info('Reutilizando chamada pendente de getCaracteristicas');
      return this.pendingList[key]!;
    }

    const promise = (async () => {
      try {
        logger.info('Buscando características', params);
        const response = await api.get('/caracteristicas', { params });
        return response.data as { data: Caracteristica[]; total: number; current_page: number; per_page: number };
      } catch (error) {
        logger.error('Erro ao buscar características:', error);
        throw error;
      } finally {
        delete this.pendingList[key];
      }
    })();

    this.pendingList[key] = promise;
    return promise;
  }

  static async searchCaracteristicas(params?: {
    page?: number;
    per_page?: number;
    nome?: string;
    escopo?: CaracteristicaEscopo;
  }): Promise<{ data: Caracteristica[]; total: number; current_page: number; per_page: number }> {
    const key = JSON.stringify(params || {});
    if (this.pendingSearch[key]) {
      logger.info('Reutilizando chamada pendente de searchCaracteristicas');
      return this.pendingSearch[key]!;
    }

    const promise = (async () => {
      try {
        logger.info('Buscando características (search)', params);
        const response = await api.get('/caracteristicas/search', { params });
        return response.data as { data: Caracteristica[]; total: number; current_page: number; per_page: number };
      } catch (error) {
        logger.error('Erro na busca de características:', error);
        throw error;
      } finally {
        delete this.pendingSearch[key];
      }
    })();

    this.pendingSearch[key] = promise;
    return promise;
  }

  static async createCaracteristica(payload: { nome: string; escopo: CaracteristicaEscopo }): Promise<Caracteristica> {
    try {
      logger.info('Criando característica', payload);
      const response = await api.post('/caracteristicas', payload);
      return response.data as Caracteristica;
    } catch (error) {
      logger.error('Erro ao criar característica:', error);
      throw error;
    }
  }

  static async updateCaracteristica(id: number, payload: Partial<{ nome: string }>): Promise<Caracteristica> {
    try {
      logger.info(`Atualizando característica ${id}`, payload);
      const response = await api.put(`/caracteristicas/${id}`, payload);
      return response.data as Caracteristica;
    } catch (error) {
      logger.error(`Erro ao atualizar característica ${id}:`, error);
      throw error;
    }
  }

  static async deleteCaracteristica(id: number): Promise<void> {
    try {
      logger.info(`Removendo característica ${id}`);
      await api.delete(`/caracteristicas/${id}`);
    } catch (error) {
      logger.error(`Erro ao remover característica ${id}:`, error);
      throw error;
    }
  }
}

export default CaracteristicaService;
