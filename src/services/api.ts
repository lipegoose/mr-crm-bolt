import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Estendendo o tipo InternalAxiosRequestConfig para incluir _retry
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// Configuração da URL base baseada no ambiente
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';



// Interface para resposta de erro da API
interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Criar instância do Axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Função para obter token do localStorage
const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// Função para verificar se o token está próximo do vencimento (5 minutos antes)
const isTokenExpiringSoon = (): boolean => {
  const tokenExpiry = localStorage.getItem('token_expiry');
  if (!tokenExpiry) return true;
  
  const expiryTime = new Date(tokenExpiry).getTime();
  const currentTime = new Date().getTime();
  const fiveMinutes = 5 * 60 * 1000; // 5 minutos em millisegundos
  
  return (expiryTime - currentTime) < fiveMinutes;
};

// Função para renovar token
const refreshToken = async (): Promise<boolean> => {
  try {
    const refreshTokenValue = localStorage.getItem('refresh_token');
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
      headers: {
        'Authorization': `Bearer ${refreshTokenValue}`,
      },
    });

    const { access_token, expires_in } = response.data;
    
    // Salvar novo token
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('token_expiry', new Date(Date.now() + expires_in * 1000).toISOString());
    
    return true;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
};

// Evitar redirecionar em rotas de autenticação
const isAuthRoute = (url?: string): boolean => {
  if (!url) return false;
  return url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');
};

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  async (config) => {
    const token = getToken();
    
    if (token) {
      // Verificar se o token está próximo do vencimento
      if (isTokenExpiringSoon()) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          // Se não conseguiu renovar, limpar tokens e redirecionar somente se houver token e não estiver no /login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('token_expiry');
          localStorage.removeItem('user');
          const onLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';
          if (!onLoginPage) {
            // Evitar recarregar a página se já estiver na tela de login
            // Apenas rejeitar a request e deixar a UI lidar
          }
          return Promise.reject(new Error('Token expired and refresh failed'));
        }
      }
      
      // Adicionar token atualizado
      const currentToken = getToken();
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url;

    // Se o erro veio de uma rota de autenticação (ex.: /auth/login), não tentar refresh nem redirecionar
    if (error.response?.status === 401 && isAuthRoute(requestUrl)) {
      return Promise.reject(error);
    }
    
    // Se recebeu 401 e não é uma tentativa de refresh
    if (error.response?.status === 401 && originalRequest) {
      // Verificar se já tentou refresh para evitar loop infinito
      if (originalRequest._retry) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      
      try {
        // Tentar renovar o token
        const refreshed = await refreshToken();
        
        if (refreshed) {
          // Repetir a requisição original com o novo token
          const newToken = getToken();
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        } else {
          // Se não conseguiu renovar, limpar tokens e redirecionar apenas se houver token e não estiver na tela de login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('token_expiry');
          localStorage.removeItem('user');
          const hasToken = !!getToken();
          const onLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';
          if (hasToken && !onLoginPage) {
            window.location.href = '/login';
          }
        }
      } catch {
        // Se houve erro no refresh, limpar tokens e redirecionar apenas se houver token e não estiver na tela de login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expiry');
        localStorage.removeItem('user');
        const hasToken = !!getToken();
        const onLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';
        if (hasToken && !onLoginPage) {
          window.location.href = '/login';
        }
      }
    }
    
    // Tratamento de outros erros
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response?.data);
    } else if (error.response?.status === 404) {
      console.error('Resource not found:', error.response?.data);
    } else if (error.response?.status === 422) {
      console.error('Validation error:', error.response?.data);
    } else if (error.response?.status && error.response.status >= 500) {
      console.error('Server error:', error.response?.data);
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.code === 'NETWORK_ERROR') {
      console.error('Network error');
    }
    
    return Promise.reject(error);
  }
);

export default api; 