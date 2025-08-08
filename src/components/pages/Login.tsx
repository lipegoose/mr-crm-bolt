import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Limpar erro quando o usuário começar a digitar
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) clearError();
    if (hasError) setHasError(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) clearError();
    if (hasError) setHasError(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setHasError(false);
      setErrorMessage('');
      await login({ email, password, remember: rememberMe });
      // Redirecionamento feito pelo useEffect acima
    } catch (err: unknown) {
      let message = 'Erro ao fazer login';
      if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as any).message === 'string') {
        message = (err as any).message as string;
      }
      setHasError(true);
      setErrorMessage(message);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-black via-gray-900 to-neutral-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <img src="/logo_semfundo.png" alt="Logo Mr.CRM" className="h-24 w-auto mx-auto" />
          </div>
          <p className="text-neutral-gray-medium">
            CRM e CMS no mesmo lugar. 
            <br />
            Funcional, simples e do seu jeito.
          </p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white rounded-default shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-title font-semibold text-neutral-black mb-2">
              Fazer Login
            </h2>
            <p className="text-neutral-gray-medium">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          {/* Exibir erro com flags simples */}
          {hasError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-500 rounded-default text-red-700">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={handleEmailChange}
              required
              error={error && error.toLowerCase().includes('e-mail') ? 'Campo obrigatório' : undefined}
            />

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={password}
                onChange={handlePasswordChange}
                required
                error={error && error.toLowerCase().includes('senha') ? 'Campo obrigatório' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-neutral-gray-medium hover:text-neutral-black"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary-orange border-neutral-gray rounded focus:ring-primary-orange"
                />
                <span className="ml-2 text-neutral-gray-medium">Lembrar-me</span>
              </label>
              <a href="#" className="text-primary-orange hover:text-primary-orange-hover">
                Esqueceu a senha?
              </a>
            </div>

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
              disabled={!email || !password || isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-default">
            <p className="text-sm text-neutral-gray-medium mb-2">
              <strong>Credenciais de demonstração:</strong>
            </p>
            <p className="text-xs text-neutral-gray-medium">
              E-mail: admin@mrcrm.com
              <br />
              Senha: 123456
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-neutral-gray-medium">
            © 2024 <a href="https://mrcrm.com.br/" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:text-primary-orange-hover" title="Site oficial do Mr.CRM">Mr.CRM</a>. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};