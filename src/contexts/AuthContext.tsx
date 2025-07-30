import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService, { User, LoginCredentials, RegisterData, AuthError } from '../services/AuthService';

// Interface para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

// Criar contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Interface para as props do provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider do contexto
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar autenticação ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Verificar se há token válido
        if (AuthService.isLoggedIn()) {
          // Tentar obter usuário do localStorage primeiro
          const storedUser = AuthService.getCurrentUserFromStorage();
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // Se não há usuário no localStorage, buscar da API
            const currentUser = await AuthService.getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
              setIsAuthenticated(true);
            } else {
              // Se não conseguiu obter usuário, limpar autenticação
              await logout();
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        await logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Função de login
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await AuthService.login(credentials);
      
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Login failed');
      }
    } catch (error: unknown) {
      const authError = error as AuthError;
      setError(authError.message || 'Erro durante o login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de registro
  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await AuthService.register(data);
      
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: unknown) {
      const authError = error as AuthError;
      setError(authError.message || 'Erro durante o registro');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await AuthService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      setError(null);
    }
  };

  // Função para atualizar dados do usuário
  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        await logout();
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      await logout();
    }
  };

  // Função para limpar erros
  const clearError = (): void => {
    setError(null);
  };

  // Valor do contexto
  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 