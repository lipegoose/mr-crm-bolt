import api from './api';
import logger from '../utils/logger';

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cpf_cnpj?: string;
  tipo: 'fisica' | 'juridica';
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProprietarioOption {
  value: string;
  label: string;
}

export class ClienteService {
  /**
   * Busca lista de proprietários para o select
   * @returns Promise<ProprietarioOption[]>
   */
  static async getProprietarios(): Promise<ProprietarioOption[]> {
    try {
      logger.info('Buscando proprietários da API');
      const response = await api.get('/clientes/select/proprietarios');
      
      // Converter os dados da API para o formato esperado pelo Select
      const opcoesConvertidas = response.data.map((item: { value: number; label: string }) => ({
        value: item.value.toString(),
        label: item.label
      }));
      
      // Adicionar opção padrão "Selecione"
      const opcoes = [
        { value: '', label: 'Selecione' },
        ...opcoesConvertidas
      ];
      
      logger.info(`Proprietários carregados com sucesso: ${opcoes.length - 1} opções`);
      return opcoes;
    } catch (error) {
      logger.error('Erro ao buscar proprietários:', error);
      throw error;
    }
  }

  /**
   * Busca cliente por ID
   * @param id ID do cliente
   * @returns Promise<Cliente>
   */
  static async getCliente(id: number): Promise<Cliente> {
    try {
      logger.info(`Buscando cliente ID: ${id}`);
      const response = await api.get(`/clientes/${id}`);
      logger.info('Cliente encontrado com sucesso');
      return response.data;
    } catch (error) {
      logger.error(`Erro ao buscar cliente ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Lista todos os clientes
   * @param params Parâmetros de paginação e filtros
   * @returns Promise<{ data: Cliente[], total: number, current_page: number, per_page: number }>
   */
  static async getClientes(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    tipo?: string;
    status?: boolean;
  }): Promise<{ data: Cliente[], total: number, current_page: number, per_page: number }> {
    try {
      logger.info('Buscando lista de clientes');
      const response = await api.get('/clientes', { params });
      logger.info(`Clientes carregados: ${response.data.data.length} de ${response.data.total}`);
      return response.data;
    } catch (error) {
      logger.error('Erro ao buscar clientes:', error);
      throw error;
    }
  }

  /**
   * Cria um novo cliente
   * @param cliente Dados do cliente
   * @returns Promise<Cliente>
   */
  static async createCliente(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<Cliente> {
    try {
      logger.info('Criando novo cliente');
      const response = await api.post('/clientes', cliente);
      logger.info('Cliente criado com sucesso');
      return response.data;
    } catch (error) {
      logger.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  /**
   * Atualiza um cliente existente
   * @param id ID do cliente
   * @param cliente Dados atualizados do cliente
   * @returns Promise<Cliente>
   */
  static async updateCliente(id: number, cliente: Partial<Omit<Cliente, 'id' | 'created_at' | 'updated_at'>>): Promise<Cliente> {
    try {
      logger.info(`Atualizando cliente ID: ${id}`);
      const response = await api.put(`/clientes/${id}`, cliente);
      logger.info('Cliente atualizado com sucesso');
      return response.data;
    } catch (error) {
      logger.error(`Erro ao atualizar cliente ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Remove um cliente
   * @param id ID do cliente
   * @returns Promise<void>
   */
  static async deleteCliente(id: number): Promise<void> {
    try {
      logger.info(`Removendo cliente ID: ${id}`);
      await api.delete(`/clientes/${id}`);
      logger.info('Cliente removido com sucesso');
    } catch (error) {
      logger.error(`Erro ao remover cliente ID ${id}:`, error);
      throw error;
    }
  }
}

export default ClienteService;
