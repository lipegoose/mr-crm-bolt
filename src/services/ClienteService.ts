import api from './api';
import logger from '../utils/logger';

export type ClienteTipo = 'PESSOA_FISICA' | 'PESSOA_JURIDICA';
export type ClienteStatus = 'ATIVO' | 'INATIVO';
export type ClienteCategoria = 'cliente' | 'prospecto' | 'lead';
export type ClienteOrigemCaptacao = 'site' | 'indicacao' | 'redes_sociais' | 'anuncio' | 'outro';

export interface Cliente {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  celular?: string;
  cpf_cnpj: string;
  tipo: ClienteTipo;
  status: ClienteStatus;
  categoria?: ClienteCategoria;
  origem_captacao?: ClienteOrigemCaptacao;
  // Endereço
  cep?: string;
  uf?: string;
  cidade?: string;
  bairro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  observacoes?: string;
  // Novos campos PF/PJ
  rg_ie?: string;
  data_nascimento?: string; // YYYY-MM-DD
  profissao?: string;
  estado_civil?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';
  renda_mensal?: string | number; // decimal
  razao_social?: string;
  nome_fantasia?: string;
  data_fundacao?: string; // YYYY-MM-DD
  ramo_atividade?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProprietarioOption {
  value: string;
  label: string;
}

export class ClienteService {
  // Controle de chamadas pendentes para evitar duplicações (StrictMode)
  private static pendingGetClientes: Record<string, Promise<{ data: Cliente[]; total: number; current_page: number; per_page: number }> | undefined> = {};
  private static pendingSearchClientes: Record<string, Promise<{ data: Cliente[]; total: number; current_page: number; per_page: number }> | undefined> = {};
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
      return response.data as Cliente;
    } catch (error) {
      logger.error(`Erro ao buscar cliente ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Lista clientes com paginação básica (sem filtros)
   * @param params Parâmetros de paginação
   * @returns Promise<{ data: Cliente[], total: number, current_page: number, per_page: number }>
   */
  static async getClientes(params?: {
    page?: number;
    per_page?: number;
  }): Promise<{ data: Cliente[]; total: number; current_page: number; per_page: number }> {
    const key = JSON.stringify(params || {});
    if (this.pendingGetClientes[key]) {
      logger.info('Reutilizando chamada pendente de getClientes');
      return this.pendingGetClientes[key]!;
    }

    const promise = (async () => {
      try {
        logger.info('Buscando lista de clientes');
        const response = await api.get('/clientes', { params });
        logger.info(`Clientes carregados: ${(response.data?.data?.length) ?? 0} de ${response.data?.total ?? 0}`);
        return response.data as { data: Cliente[]; total: number; current_page: number; per_page: number };
      } catch (error) {
        logger.error('Erro ao buscar clientes:', error);
        throw error;
      } finally {
        // Limpar referência após término
        delete this.pendingGetClientes[key];
      }
    })();

    this.pendingGetClientes[key] = promise;
    return promise;
  }

  /**
   * Busca avançada de clientes com filtros e paginação
   * Usa rota GET /clientes/search com filtros nome, tipo, cpf_cnpj, status
   */
  static async searchClientes(params?: {
    page?: number;
    per_page?: number;
    nome?: string;
    tipo?: ClienteTipo;
    cpf_cnpj?: string;
    status?: ClienteStatus;
    categoria?: ClienteCategoria;
    origem_captacao?: ClienteOrigemCaptacao;
  }): Promise<{ data: Cliente[]; total: number; current_page: number; per_page: number }> {
    const key = JSON.stringify(params || {});
    if (this.pendingSearchClientes[key]) {
      logger.info('Reutilizando chamada pendente de searchClientes');
      return this.pendingSearchClientes[key]!;
    }

    const promise = (async () => {
      try {
        logger.info('Buscando clientes (search)');
        const response = await api.get('/clientes/search', { params });
        logger.info(`Resultado da busca: ${(response.data?.data?.length) ?? 0} de ${response.data?.total ?? 0}`);
        return response.data as { data: Cliente[]; total: number; current_page: number; per_page: number };
      } catch (error) {
        logger.error('Erro na busca de clientes:', error);
        throw error;
      } finally {
        delete this.pendingSearchClientes[key];
      }
    })();

    this.pendingSearchClientes[key] = promise;
    return promise;
  }

  /**
   * Cria um novo cliente
   * @param cliente Dados do cliente
   * @returns Promise<Cliente>
   */
  static async createCliente(cliente: {
    nome: string;
    tipo?: ClienteTipo;
    cpf_cnpj?: string;
    rg_ie?: string;
    email?: string;
    telefone?: string;
    celular?: string;
    status?: ClienteStatus;
    categoria?: ClienteCategoria;
    origem_captacao?: ClienteOrigemCaptacao;
    // Endereço
    cep?: string;
    uf?: string;
    cidade?: string;
    bairro?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    observacoes?: string;
    data_nascimento?: string;
    profissao?: string;
    estado_civil?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';
    renda_mensal?: string | number;
    razao_social?: string;
    nome_fantasia?: string;
    data_fundacao?: string;
    ramo_atividade?: string;
  }): Promise<Cliente> {
    try {
      logger.info('Criando novo cliente');
      const payload = {
        tipo: cliente.tipo ?? 'PESSOA_FISICA',
        status: cliente.status ?? 'ATIVO',
        ...cliente,
      };
      const response = await api.post('/clientes', payload);
      logger.info('Cliente criado com sucesso');
      return response.data as Cliente;
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
  static async updateCliente(
    id: number,
    cliente: Partial<{
      nome: string;
      tipo: ClienteTipo;
      cpf_cnpj: string;
      rg_ie?: string;
      email?: string;
      telefone?: string;
      celular?: string;
      status?: ClienteStatus;
      categoria?: ClienteCategoria;
      origem_captacao?: ClienteOrigemCaptacao;
      // Endereço
      cep?: string;
      uf?: string;
      cidade?: string;
      bairro?: string;
      logradouro?: string;
      numero?: string;
      complemento?: string;
      observacoes?: string;
      data_nascimento?: string;
      profissao?: string;
      estado_civil?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';
      renda_mensal?: string | number;
      razao_social?: string;
      nome_fantasia?: string;
      data_fundacao?: string;
      ramo_atividade?: string;
    }>
  ): Promise<Cliente> {
    try {
      logger.info(`Atualizando cliente ID: ${id}`);
      const response = await api.put(`/clientes/${id}`, cliente);
      logger.info('Cliente atualizado com sucesso');
      return response.data as Cliente;
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
