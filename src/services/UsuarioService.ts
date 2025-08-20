import api from './api';

// Interface para opções de select
export interface SelectOption {
  value: string | number;
  label: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class UsuarioService {
  // Rastreamento de chamadas à API pendentes
  private static pendingUsuariosSelectRequest: Promise<ApiResponse<SelectOption[]>> | null = null;
  
  /**
   * Busca a lista de usuários formatada para uso em componentes Select
   * Implementa controle de chamadas pendentes para evitar duplicação
   * Removido o cache persistente para garantir dados atualizados a cada montagem do componente
   */
  static async getUsuariosSelect(): Promise<ApiResponse<SelectOption[]>> {
    // Verificar se já existe uma requisição pendente
    if (this.pendingUsuariosSelectRequest) {
      return this.pendingUsuariosSelectRequest;
    }
    
    // Criar nova requisição e armazená-la
    this.pendingUsuariosSelectRequest = (async () => {
      try {
        // Buscar dados da API
        const response = await api.get('/usuarios/select');

        // Normalização do formato de retorno
        // Pode vir como array direto ou como objeto { success, data }
        let items: SelectOption[] = [];
        let success = true;

        const raw = response.data;
        if (Array.isArray(raw)) {
          items = raw as SelectOption[];
        } else if (raw && Array.isArray(raw.data)) {
          items = raw.data as SelectOption[];
          success = typeof raw.success === 'boolean' ? raw.success : true;
        } else {
          items = [];
          success = false;
        }

        return { success, data: items } as ApiResponse<SelectOption[]>;
      } catch (error) {
        // Em caso de erro, propaga o erro
        throw error;
      } finally {
        // Limpar a referência da Promise quando concluída (sucesso ou erro)
        this.pendingUsuariosSelectRequest = null;
      }
    })();
    
    // Retornar a Promise armazenada
    return this.pendingUsuariosSelectRequest;
  }
}
