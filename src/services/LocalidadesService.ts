// LocalidadesService.ts
import api from './api';

export interface Cidade {
  id?: number;
  nome?: string;
  uf?: string;
  value: string;  // Para uso direto em selects
  label: string;  // Para uso direto em selects
}

export interface Bairro {
  id: number;
  nome: string;
  cidade_id: number;
  cidade_nome?: string;
  value: string;  // Para uso direto em selects
  label: string;  // Para uso direto em selects
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  is_new?: boolean;
}

export class LocalidadesService {
  // Cache para reduzir chamadas à API
  private static cidadesPorUF: Record<string, ApiResponse<Cidade[]>> = {};
  private static bairrosPorCidade: Record<string, ApiResponse<Bairro[]>> = {};
  
  // Controle de chamadas em andamento para evitar chamadas duplicadas
  private static chamadasEmAndamento: Record<string, Promise<any>> = {};
  
  // Métodos para cidades
  static async getCidades(): Promise<ApiResponse<Cidade[]>> {
    const response = await api.get('/cidades/select');
    return response.data;
  }
  
  static async getCidadesPorUF(uf: string): Promise<ApiResponse<Cidade[]>> {
    
    // Verificar se já temos os dados em cache
    if (this.cidadesPorUF[uf] && this.cidadesPorUF[uf].data && this.cidadesPorUF[uf].data.length > 0) {
      console.log(`[CACHE] Utilizando cache para cidades da UF: ${uf}`);
      return this.cidadesPorUF[uf];
    }
    
    // Verificar se já existe uma chamada em andamento para esta UF
    const chaveRequisicao = `cidades-${uf}`;
    if (this.chamadasEmAndamento[chaveRequisicao] !== undefined) {
      console.log(`[API] Reutilizando chamada em andamento para UF: ${uf}`);
      return this.chamadasEmAndamento[chaveRequisicao];
    }
    
    // Criar nova chamada e armazená-la para reutilização
    console.log(`[API] Buscando cidades da UF: ${uf}`);
    this.chamadasEmAndamento[chaveRequisicao] = api.get(`/cidades/uf/${uf}/select`)
      .then(response => {
        // Limpar a chamada em andamento após conclusão
        delete this.chamadasEmAndamento[chaveRequisicao];
        return response.data;
      })
      .catch(error => {
        // Limpar a chamada em andamento em caso de erro
        delete this.chamadasEmAndamento[chaveRequisicao];
        throw error;
      });
    
    const response = await this.chamadasEmAndamento[chaveRequisicao];
    
    // Validar e salvar no cache apenas se houver dados
    if (response.data && response.data.success) {
      this.cidadesPorUF[uf] = response.data;
    }
    
    return response.data;
  }
  
  static async buscarOuCriarCidade(dados: { nome: string; uf: string }): Promise<ApiResponse<Cidade>> {
    const response = await api.post('/cidades/buscar-ou-criar', dados);
    
    // Se criar nova cidade, invalidar cache da UF
    if (response.data.is_new) {
      delete this.cidadesPorUF[dados.uf];
    }
    
    return response.data;
  }
  
  // Métodos para bairros
  static async getBairrosPorCidade(cidadeId: number): Promise<ApiResponse<Bairro[]>> {
    const chave = `cidade-${cidadeId}`;
    
    // Verificar se já temos os dados em cache
    if (this.bairrosPorCidade[chave] && this.bairrosPorCidade[chave].data && this.bairrosPorCidade[chave].data.length > 0) {
      console.log(`[CACHE] Utilizando cache para bairros da cidade ID: ${cidadeId}`);
      return this.bairrosPorCidade[chave];
    }
    
    // Verificar se já existe uma chamada em andamento para esta cidade
    const chaveRequisicao = `bairros-${cidadeId}`;
    if (this.chamadasEmAndamento[chaveRequisicao] !== undefined) {
      console.log(`[API] Reutilizando chamada em andamento para bairros da cidade ID: ${cidadeId}`);
      return this.chamadasEmAndamento[chaveRequisicao];
    }
    
    // Criar nova chamada e armazená-la para reutilização
    console.log(`[API] Buscando bairros para cidade ID: ${cidadeId}`);
    this.chamadasEmAndamento[chaveRequisicao] = api.get(`/bairros/cidade/${cidadeId}/select`)
      .then(response => {
        // Limpar a chamada em andamento após conclusão
        delete this.chamadasEmAndamento[chaveRequisicao];
        return response.data;
      })
      .catch(error => {
        // Limpar a chamada em andamento em caso de erro
        delete this.chamadasEmAndamento[chaveRequisicao];
        throw error;
      });
    
    const response = await this.chamadasEmAndamento[chaveRequisicao];
    
    // Salvar no cache apenas se houver dados válidos
    if (response.data && response.data.success) {
      this.bairrosPorCidade[chave] = response.data;
    }
    
    return response.data;
  }
  
  static async buscarOuCriarBairro(dados: { 
    nome: string; 
    cidade_id: number;
    cidade_nome: string;
    uf: string;
  }): Promise<ApiResponse<Bairro>> {
    const response = await api.post('/bairros/buscar-ou-criar', dados);
    
    // Se criar novo bairro, invalidar cache da cidade
    if (response.data.is_new) {
      delete this.bairrosPorCidade[dados.cidade_id.toString()];
    }
    
    return response.data;
  }
  
  // Método para limpar cache
  static limparCache() {
    this.cidadesPorUF = {};
    this.bairrosPorCidade = {};
  }
}
