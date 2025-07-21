import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simular delay de login
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1500);
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

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              loading={loading}
              className="w-full"
              disabled={!email || !password}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-default">
            <p className="text-sm text-neutral-gray-medium mb-2">
              <strong>Credenciais de demonstração:</strong>
            </p>
            <p className="text-xs text-neutral-gray-medium">
              E-mail: admin@mrcrm.com<br />
              Senha: 123456
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-neutral-gray-medium">
            © 2024 Mr.CRM. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};