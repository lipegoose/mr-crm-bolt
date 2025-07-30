import api from './api';

// Interfaces
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  status: boolean;
  remember_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  success: boolean;
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
}

class AuthService {
  /**
   * Realiza o login do usuário
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      
      if (response.data.success) {
        // Salvar token e dados do usuário
        this.setToken(response.data.access_token, response.data.expires_in);
        this.setUser(response.data.user);
        
        // Se remember for true, salvar refresh token (se disponível)
        if (credentials.remember) {
          // Nota: O backend pode não retornar refresh_token na resposta de login
          // Isso seria implementado se o backend suportar
        }
      }
      
      return response.data;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Realiza o registro do usuário
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/register', data);
      
      if (response.data.success) {
        // Salvar token e dados do usuário após registro
        this.setToken(response.data.access_token, response.data.expires_in);
        this.setUser(response.data.user);
      }
      
      return response.data;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Realiza o logout do usuário
   */
  async logout(): Promise<void> {
    try {
      // Chamar endpoint de logout no backend (se disponível)
      await api.post('/auth/logout');
    } catch (error) {
      // Mesmo se falhar no backend, limpar dados locais
      console.warn('Logout request failed, but clearing local data:', error);
    } finally {
      // Sempre limpar dados locais
      this.clearAuthData();
    }
  }

  /**
   * Renova o token de acesso
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post<LoginResponse>('/auth/refresh', {}, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (response.data.success) {
        this.setToken(response.data.access_token, response.data.expires_in);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      this.clearAuthData();
      return false;
    }
  }

  /**
   * Obtém os dados do usuário atual
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<{ data: User }>('/auth/me');
      const user = response.data.data;
      this.setUser(user);
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Verifica se o usuário está logado
   */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      return false;
    }

    // Verificar se o token não expirou
    const tokenExpiry = localStorage.getItem('token_expiry');
    if (tokenExpiry) {
      const expiryTime = new Date(tokenExpiry).getTime();
      const currentTime = new Date().getTime();
      
      if (currentTime >= expiryTime) {
        this.clearAuthData();
        return false;
      }
    }

    return true;
  }

  /**
   * Obtém o usuário atual do localStorage
   */
  getCurrentUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Failed to parse user from storage:', error);
      return null;
    }
  }

  /**
   * Obtém o token de acesso
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Define o token de acesso e sua expiração
   */
  private setToken(token: string, expiresIn: number): void {
    localStorage.setItem('access_token', token);
    localStorage.setItem('token_expiry', new Date(Date.now() + expiresIn * 1000).toISOString());
  }

  /**
   * Define os dados do usuário
   */
  private setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Limpa todos os dados de autenticação
   */
  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('user');
  }

  /**
   * Trata erros de autenticação
   */
  private handleAuthError(error: unknown): AuthError {
    // Verificar se o erro é um objeto com propriedade response
    if (typeof error === 'object' && error !== null && 'response' in error && error.response !== null && typeof error.response === 'object' && 'data' in error.response) {
      const responseData = error.response.data;
      if (typeof responseData === 'object' && responseData !== null) {
        const message = 'message' in responseData && typeof responseData.message === 'string' ? responseData.message : 'Erro de autenticação';
        const errors = 'errors' in responseData && responseData.errors && typeof responseData.errors === 'object' ? 
          responseData.errors as Record<string, string[]> : undefined;
        
        // Se há erros de validação específicos, formatar uma mensagem mais clara
        if (errors && Object.keys(errors).length > 0) {
          const errorMessages: string[] = [];
          
          // Adicionar erros específicos de campos
          Object.entries(errors).forEach(([field, fieldErrors]) => {
            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach(fieldError => {
                // Traduzir nomes dos campos para português
                const fieldName = this.translateFieldName(field);
                errorMessages.push(`${fieldName}: ${fieldError}`);
              });
            }
          });
          
          // Se há mensagem geral, incluí-la também
          if (message && message !== 'Erro de autenticação') {
            return {
              message: `${message}\n${errorMessages.join('\n')}`,
              errors,
            };
          } else {
            return {
              message: errorMessages.join('\n'),
              errors,
            };
          }
        }
        
        return {
          message,
          errors,
        };
      }
    }
    
    // Verificar se o erro é um objeto com propriedade message
    if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
      return {
        message: error.message,
      };
    }
    
    return {
      message: 'Erro desconhecido durante a autenticação',
    };
  }

  /**
   * Traduz nomes de campos para português
   */
  private translateFieldName(field: string): string {
    const translations: Record<string, string> = {
      email: 'E-mail',
      password: 'Senha',
      name: 'Nome',
      password_confirmation: 'Confirmação de senha',
    };
    
    return translations[field] || field;
  }
}

// Exportar instância única
export default new AuthService(); 