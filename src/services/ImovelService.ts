import api from './api';
import logger from '../utils/logger';

// Interfaces principais
export interface Imovel {
  id: number;
  codigo_referencia: string;
  tipo: string;
  subtipo: string;
  perfil: string;
  status: string;
  endereco: Endereco;
  caracteristicas_fisicas: CaracteristicasFisicas;
  valores: Valores;
  publicacao: Publicacao;
  negociacao: Negociacao;
  created_at: string;
  updated_at: string;
  imagem_principal?: ImagemImovel | null;
}

export interface Endereco {
  cep: string | null;
  uf: string | null;
  cidade: string | null;
  bairro: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  mostrar_endereco_site: boolean;
  endereco_formatado: string;
}

export interface CaracteristicasFisicas {
  area_total: number | null;
  area_privativa: number | null;
  quartos: number | null;
  banheiros: number | null;
  suites: number | null;
  vagas: number | null;
}

export interface Valores {
  valor_venda: number | null;
  valor_locacao: number | null;
  valor_condominio: number | null;
  valor_iptu: number | null;
  mostrar_valores_site: boolean;
  valor_venda_formatado: string | null;
  valor_locacao_formatado: string | null;
  valor_condominio_formatado: string | null;
  valor_iptu_formatado: string | null;
}

export interface Publicacao {
  publicar_site: boolean;
  destaque_site: boolean;
}

export interface Negociacao {
  aceita_financiamento: boolean;
  aceita_permuta: boolean;
}

export interface ImagemImovel {
  id: number;
  imovel_id: number;
  caminho: string;
  url_completa: string;
  titulo: string | null;
  principal: boolean;
  ordem: number;
}

// Interfaces para etapas específicas
export interface InformacoesIniciais {
  id: number;
  codigo_referencia: string;
  tipo: string;
  subtipo: string;
  perfil: string;
  finalidade: string | null;
  tipo_negocio: string;
  situacao: string;
  data_captacao: string | null;
  data_disponibilidade: string | null;
  ano_construcao: number | null;
  ocupacao: string | null;
  mobiliado: boolean;
  reformado: boolean;
  ano_reforma: number | null;
  condominio_id: number | null;
  condominio: Record<string, unknown> | null;
  proprietario_id: number | null;
  // Campos adicionais para compatibilidade com o formulário
  incorporacao?: string | null;
  posicaoSolar?: string | null; // Campo usado no frontend
  posicao_solar?: string | null; // Campo usado no backend
  terreno?: string | null;
  averbado?: boolean | null;
  escriturado?: boolean | null;
  esquina?: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Comodos {
  id: number;
  quartos: number | null;
  banheiros: number | null;
  suites: number | null;
  salas: number | null;
  cozinhas: number | null;
  varandas: number | null;
  sacadas: number | null;
  lavabos: number | null;
  escritorios: number | null;
  closets: number | null;
  despensas: number | null;
  area_servico: number | null;
  created_at: string;
  updated_at: string;
}

export interface Medidas {
  id: number;
  area_total: number | null;
  area_privativa: number | null;
  area_construida: number | null;
  area_terreno: number | null;
  frente: number | null;
  fundos: number | null;
  lateral_direita: number | null;
  lateral_esquerda: number | null;
  created_at: string;
  updated_at: string;
}

export interface Preco {
  id: number;
  valor_venda: number | null;
  valor_locacao: number | null;
  valor_condominio: number | null;
  valor_iptu: number | null;
  mostrar_valores_site: boolean;
  created_at: string;
  updated_at: string;
}

export interface CaracteristicasImovel {
  id: number;
  caracteristicas: string[];
  created_at: string;
  updated_at: string;
}

export interface CaracteristicasCondominio {
  id: number;
  caracteristicas: string[];
  created_at: string;
  updated_at: string;
}

export interface Localizacao {
  id: number;
  cep: string | null;
  uf: string | null;
  cidade: string | null;
  bairro: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  mostrar_endereco_site: boolean;
  created_at: string;
  updated_at: string;
}

export interface Proximidades {
  id: number;
  proximidades: number[] | {id: number, nome: string}[];
  customProximidades?: {nome: string, distancia: string}[];
  mostrar_proximidades?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Descricao {
  id: number;
  titulo: string | null;
  descricao: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Complementos {
  id: number;
  complementos: string[];
  created_at: string;
  updated_at: string;
}

export interface DadosPrivativos {
  id: number;
  proprietario_id: number | null;
  proprietario: Record<string, unknown> | null;
  corretor_id: number | null;
  corretor: Record<string, unknown> | null;
  data_captacao: string | null;
  data_disponibilidade: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicacaoEtapa {
  id: number;
  publicar_site: boolean;
  destaque_site: boolean;
  aceita_financiamento: boolean;
  aceita_permuta: boolean;
  created_at: string;
  updated_at: string;
}

// Interfaces para opções
export interface TipoImovel {
  id: number;
  nome: string;
  subtipos: SubtipoImovel[];
}

export interface SubtipoImovel {
  id: number;
  nome: string;
  tipo_id: number;
}

export interface Caracteristica {
  id: number;
  nome: string;
  escopo: 'IMOVEL' | 'CONDOMINIO';
}

export interface Proximidade {
  id: number;
  nome: string;
  categoria: string;
}

// Interfaces para respostas da API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface IniciarCadastroResponse {
  message: string;
  imovel: Imovel;
}

export interface CodigoReferenciaResponse {
  disponivel: boolean;
  sugestao?: string;
}

export class ImovelService {
  // Método principal para iniciar cadastro
  static async iniciarCadastro(): Promise<IniciarCadastroResponse> {
    const response = await api.post('/imoveis/iniciar');
    return response.data;
  }

  // Obter imóvel por ID
  static async getImovel(id: number): Promise<ApiResponse<Imovel>> {
    const response = await api.get(`/imoveis/${id}`);
    return response.data;
  }

  // Atualizar imóvel geral
  static async updateImovel(id: number, data: Partial<Imovel>): Promise<ApiResponse<Imovel>> {
    const response = await api.put(`/imoveis/${id}`, data);
    return response.data;
  }

  // Métodos para etapas específicas - GET
  static async getEtapaInformacoes(id: number): Promise<ApiResponse<InformacoesIniciais>> {
    const response = await api.get(`/imoveis/${id}/etapas/informacoes`);
    return response.data;
  }

  static async getEtapaComodos(id: number): Promise<ApiResponse<Comodos>> {
    const response = await api.get(`/imoveis/${id}/etapas/comodos`);
    return response.data;
  }

  static async getEtapaMedidas(id: number): Promise<ApiResponse<Medidas>> {
    const response = await api.get(`/imoveis/${id}/etapas/medidas`);
    return response.data;
  }

  static async getEtapaPreco(id: number): Promise<ApiResponse<Preco>> {
    const response = await api.get(`/imoveis/${id}/etapas/preco`);
    return response.data;
  }

  static async getEtapaCaracteristicas(id: number): Promise<ApiResponse<CaracteristicasImovel>> {
    const response = await api.get(`/imoveis/${id}/etapas/caracteristicas`);
    return response.data;
  }

  static async getEtapaCaracteristicasCondominio(id: number): Promise<ApiResponse<CaracteristicasCondominio>> {
    const response = await api.get(`/imoveis/${id}/etapas/caracteristicas-condominio`);
    return response.data;
  }

  static async getEtapaLocalizacao(id: number): Promise<ApiResponse<Localizacao>> {
    const response = await api.get(`/imoveis/${id}/etapas/localizacao`);
    return response.data;
  }

  static async getEtapaProximidades(id: number): Promise<ApiResponse<Proximidades>> {
    // Log para identificar chamadas
    logger.debug(`[IMOVEL_SERVICE] Chamada getEtapaProximidades para imóvel ${id}`);
    
    // Verificar se já existe uma requisição pendente para este imóvel
    // Isso evita chamadas duplicadas durante o mesmo ciclo de renderização
    const pendingRequest = this.pendingEtapaProximidadesRequests[id];
    if (pendingRequest) {
      logger.debug(`[IMOVEL_SERVICE] Reaproveitando requisição pendente para etapaProximidades do imóvel ${id}`);
      return pendingRequest;
    }
    
    // Criar nova requisição e armazená-la
    logger.debug(`[IMOVEL_SERVICE] Criando nova requisição para etapaProximidades do imóvel ${id}`);
    this.pendingEtapaProximidadesRequests[id] = (async () => {
      try {
        // Sempre buscar dados atualizados da API
        const response = await api.get(`/imoveis/${id}/etapas/proximidades`);
        
        // Limpar o cache anterior e armazenar os novos dados
        delete this.etapaProximidadesCache[id];
        this.etapaProximidadesCache[id] = response.data;
        
        logger.debug(`[IMOVEL_SERVICE] Dados de proximidades do imóvel ${id} atualizados com sucesso`);
        return response.data;
      } catch (error) {
        // Em caso de erro, propaga o erro
        logger.error(`[IMOVEL_SERVICE] Erro ao buscar proximidades do imóvel ${id}:`, error);
        throw error;
      } finally {
        // Limpar a referência da Promise quando concluída (sucesso ou erro)
        delete this.pendingEtapaProximidadesRequests[id];
      }
    })();
    
    // Retornar a Promise armazenada
    return this.pendingEtapaProximidadesRequests[id];
  }

  static async getEtapaDescricao(id: number): Promise<ApiResponse<Descricao>> {
    const response = await api.get(`/imoveis/${id}/etapas/descricao`);
    return response.data;
  }

  static async getEtapaComplementos(id: number): Promise<ApiResponse<Complementos>> {
    const response = await api.get(`/imoveis/${id}/etapas/complementos`);
    return response.data;
  }

  static async getEtapaDadosPrivativos(id: number): Promise<ApiResponse<DadosPrivativos>> {
    const response = await api.get(`/imoveis/${id}/etapas/dados-privativos`);
    return response.data;
  }

  static async getEtapaPublicacao(id: number): Promise<ApiResponse<PublicacaoEtapa>> {
    const response = await api.get(`/imoveis/${id}/etapas/publicacao`);
    return response.data;
  }

  // Métodos para etapas específicas - PUT
  static async updateEtapaInformacoes(id: number, data: Partial<InformacoesIniciais>): Promise<ApiResponse<InformacoesIniciais>> {
    const response = await api.put(`/imoveis/${id}/etapas/informacoes`, data);
    return response.data;
  }

  static async updateEtapaComodos(id: number, data: Partial<Comodos>): Promise<ApiResponse<Comodos>> {
    const response = await api.put(`/imoveis/${id}/etapas/comodos`, data);
    return response.data;
  }

  static async updateEtapaMedidas(id: number, data: Partial<Medidas>): Promise<ApiResponse<Medidas>> {
    const response = await api.put(`/imoveis/${id}/etapas/medidas`, data);
    return response.data;
  }

  static async updateEtapaPreco(id: number, data: Partial<Preco>): Promise<ApiResponse<Preco>> {
    const response = await api.put(`/imoveis/${id}/etapas/preco`, data);
    return response.data;
  }

  static async updateEtapaCaracteristicas(id: number, data: Partial<CaracteristicasImovel>): Promise<ApiResponse<CaracteristicasImovel>> {
    const response = await api.put(`/imoveis/${id}/etapas/caracteristicas`, data);
    return response.data;
  }

  static async updateEtapaCaracteristicasCondominio(id: number, data: Partial<CaracteristicasCondominio>): Promise<ApiResponse<CaracteristicasCondominio>> {
    const response = await api.put(`/imoveis/${id}/etapas/caracteristicas-condominio`, data);
    return response.data;
  }

  static async updateEtapaLocalizacao(id: number, data: Partial<Localizacao>): Promise<ApiResponse<Localizacao>> {
    const response = await api.put(`/imoveis/${id}/etapas/localizacao`, data);
    return response.data;
  }

  static async updateEtapaProximidades(id: number, data: Partial<Proximidades>): Promise<ApiResponse<Proximidades>> {
    const response = await api.put(`/imoveis/${id}/etapas/proximidades`, data);
    return response.data;
  }

  static async updateEtapaDescricao(id: number, data: Partial<Descricao>): Promise<ApiResponse<Descricao>> {
    const response = await api.put(`/imoveis/${id}/etapas/descricao`, data);
    return response.data;
  }

  static async updateEtapaComplementos(id: number, data: Partial<Complementos>): Promise<ApiResponse<Complementos>> {
    const response = await api.put(`/imoveis/${id}/etapas/complementos`, data);
    return response.data;
  }

  static async updateEtapaDadosPrivativos(id: number, data: Partial<DadosPrivativos>): Promise<ApiResponse<DadosPrivativos>> {
    const response = await api.put(`/imoveis/${id}/etapas/dados-privativos`, data);
    return response.data;
  }

  static async updateEtapaPublicacao(id: number, data: Partial<PublicacaoEtapa>): Promise<ApiResponse<PublicacaoEtapa>> {
    const response = await api.put(`/imoveis/${id}/etapas/publicacao`, data);
    return response.data;
  }

  // Métodos para código de referência
  static async validarCodigoReferencia(codigo: string, imovelId?: number): Promise<CodigoReferenciaResponse> {
    const url = imovelId 
      ? `/imoveis/codigo-referencia/${codigo}/${imovelId}`
      : `/imoveis/codigo-referencia/${codigo}`;
    const response = await api.get(url);
    return response.data;
  }

  static async updateCodigoReferencia(id: number, codigo: string, editadoManualmente: boolean = false): Promise<ApiResponse<Imovel>> {
    const response = await api.put(`/imoveis/${id}/codigo-referencia`, { 
      codigo_referencia: codigo,
      editado_manualmente: editadoManualmente
    });
    return response.data;
  }

  // Métodos para imagens
  static async uploadImagem(id: number, file: File): Promise<ApiResponse<ImagemImovel>> {
    const formData = new FormData();
    formData.append('imagem', file);
    const response = await api.post(`/imoveis/${id}/imagens`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async reordenarImagens(id: number, imagens: { id: number; ordem: number }[]): Promise<ApiResponse<ImagemImovel[]>> {
    const response = await api.put(`/imoveis/${id}/imagens/reordenar`, { imagens });
    return response.data;
  }

  static async definirImagemPrincipal(id: number, imagemId: number): Promise<ApiResponse<ImagemImovel>> {
    const response = await api.put(`/imoveis/${id}/imagens/${imagemId}/principal`);
    return response.data;
  }

  static async deletarImagem(id: number, imagemId: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/imoveis/${id}/imagens/${imagemId}`);
    return response.data;
  }

  // Métodos para opções
  static async getTipos(): Promise<ApiResponse<string[]>> {
    const response = await api.get('/imoveis/opcoes/tipos');
    return response.data;
  }

  static async getSubtipos(tipo: string): Promise<ApiResponse<string[]>> {
    const response = await api.get(`/imoveis/opcoes/subtipos/${tipo}`);
    return response.data;
  }

  static async getTiposNegocio(): Promise<ApiResponse<string[]>> {
    const response = await api.get('/imoveis/opcoes/tipos-negocio');
    return response.data;
  }

  // Cache para evitar chamadas duplicadas à API
  private static caracteristicasCache: Record<string, ApiResponse<Caracteristica[]>> = {};
  private static proximidadesCache: ApiResponse<Proximidade[]> | null = null;
  private static etapaProximidadesCache: Record<number, ApiResponse<Proximidades>> = {};
  
  // Rastreamento de chamadas à API pendentes
  private static pendingRequests: Record<string, Promise<ApiResponse<Caracteristica[]>>> = {};
  private static pendingProximidadesRequest: Promise<ApiResponse<Proximidade[]>> | null = null;
  private static pendingEtapaProximidadesRequests: Record<number, Promise<ApiResponse<Proximidades>>> = {};
  
  static async getCaracteristicas(escopo: 'IMOVEL' | 'CONDOMINIO', forceCache: boolean = false): Promise<ApiResponse<Caracteristica[]>> {
    // 1. Verificar cache primeiro
    if (this.caracteristicasCache[escopo]) {
      return this.caracteristicasCache[escopo];
    }
    
    // 2. Se forceCache é true, mas não temos cache, lançamos um erro
    if (forceCache) {
      throw new Error(`Não há dados em cache para "${escopo}"`);
    }
    
    // 3. Verificar se já existe uma requisição pendente para este escopo
    const pendingRequest = this.pendingRequests[escopo];
    if (pendingRequest) {
      return pendingRequest;
    }
    
    // 4. Criar nova requisição e armazená-la
    this.pendingRequests[escopo] = (async () => {
      try {
        const response = await api.get(`/imoveis/opcoes/caracteristicas/${escopo}`);
        
        // Armazena no cache
        this.caracteristicasCache[escopo] = response.data;
        
        return response.data;
      } catch (error) {
        // Em caso de erro, propaga o erro
        throw error;
      } finally {
        // Limpar a referência da Promise quando concluída (sucesso ou erro)
        delete this.pendingRequests[escopo];
      }
    })();
    
    // Retornar a Promise armazenada
    return this.pendingRequests[escopo];
  }

  static async getProximidades(forceCache: boolean = false): Promise<ApiResponse<Proximidade[]>> {
    // 1. Verificar cache primeiro
    if (this.proximidadesCache) {
      return this.proximidadesCache;
    }
    
    // 2. Se forceCache é true, mas não temos cache, lançamos um erro
    if (forceCache) {
      throw new Error('Não há dados em cache para proximidades');
    }
    
    // 3. Verificar se já existe uma requisição pendente
    if (this.pendingProximidadesRequest) {
      return this.pendingProximidadesRequest;
    }
    
    // 4. Criar nova requisição e armazená-la
    this.pendingProximidadesRequest = (async () => {
      try {
        const response = await api.get('/imoveis/opcoes/proximidades');
        
        // Armazena no cache
        this.proximidadesCache = response.data;
        
        return response.data;
      } catch (error) {
        // Em caso de erro, propaga o erro
        throw error;
      } finally {
        // Limpar a referência da Promise quando concluída (sucesso ou erro)
        this.pendingProximidadesRequest = null;
      }
    })();
    
    // Retornar a Promise armazenada
    return this.pendingProximidadesRequest;
  }

  // Método para finalizar cadastro (ativar imóvel)
  static async finalizarCadastro(id: number): Promise<ApiResponse<Imovel>> {
    const response = await api.put(`/imoveis/${id}`, { status: 'ATIVO' });
    return response.data;
  }

  // Método para verificar completude das etapas
  static async getCompletude(id: number): Promise<ApiResponse<{ [key: string]: boolean }>> {
    const response = await api.get(`/imoveis/${id}/etapas/completude`);
    return response.data;
  }
}
