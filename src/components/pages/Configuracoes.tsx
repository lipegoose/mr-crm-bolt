import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Mail,
  Phone,
  MapPin,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

export const Configuracoes: React.FC = () => {
  const [activeTab, setActiveTab] = useState('perfil');
  const [showPassword, setShowPassword] = useState(false);

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'aparencia', label: 'Aparência', icon: Palette },
    { id: 'sistema', label: 'Sistema', icon: Database },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <Avatar name="João Silva" size="lg" />
              <div>
                <h3 className="text-lg font-semibold">João Silva</h3>
                <p className="text-neutral-gray-medium">Administrador</p>
                <Button variant="secondary" size="sm" className="mt-2">
                  Alterar Foto
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nome completo" defaultValue="João Silva" />
              <Input label="Email" type="email" defaultValue="joao.silva@mrcrm.com" />
              <Input label="Telefone" defaultValue="(11) 99999-9999" />
              <Input label="Cargo" defaultValue="Administrador" />
            </div>

            <div>
              <Input 
                label="Endereço" 
                defaultValue="Rua das Flores, 123 - Centro, São Paulo - SP" 
              />
            </div>

            <div className="flex justify-end">
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        );

      case 'notificacoes':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Preferências de Notificação</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-neutral-gray rounded-default">
                  <div>
                    <h4 className="font-medium">Novos clientes</h4>
                    <p className="text-sm text-neutral-gray-medium">Receber notificação quando um novo cliente for cadastrado</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between p-4 border border-neutral-gray rounded-default">
                  <div>
                    <h4 className="font-medium">Contratos assinados</h4>
                    <p className="text-sm text-neutral-gray-medium">Notificar quando um contrato for assinado</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between p-4 border border-neutral-gray rounded-default">
                  <div>
                    <h4 className="font-medium">Relatórios semanais</h4>
                    <p className="text-sm text-neutral-gray-medium">Receber resumo semanal por email</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between p-4 border border-neutral-gray rounded-default">
                  <div>
                    <h4 className="font-medium">Lembretes de follow-up</h4>
                    <p className="text-sm text-neutral-gray-medium">Lembrar de entrar em contato com prospects</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Salvar Preferências
              </Button>
            </div>
          </div>
        );

      case 'seguranca':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Alterar Senha</h3>
              
              <div className="space-y-4 max-w-md">
                <Input label="Senha atual" type="password" />
                
                <div className="relative">
                  <Input 
                    label="Nova senha" 
                    type={showPassword ? "text" : "password"} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-neutral-gray-medium"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                <Input label="Confirmar nova senha" type="password" />
                
                <Button>Alterar Senha</Button>
              </div>
            </div>

            <div className="border-t border-neutral-gray pt-6">
              <h3 className="text-lg font-semibold mb-4">Autenticação em Duas Etapas</h3>
              
              <div className="flex items-center justify-between p-4 border border-neutral-gray rounded-default">
                <div>
                  <h4 className="font-medium">2FA via SMS</h4>
                  <p className="text-sm text-neutral-gray-medium">Adicionar uma camada extra de segurança</p>
                </div>
                <Button variant="secondary" size="sm">Configurar</Button>
              </div>
            </div>
          </div>
        );

      case 'aparencia':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Tema</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border-2 border-primary-orange rounded-default cursor-pointer">
                  <div className="w-full h-20 bg-white border rounded mb-3"></div>
                  <h4 className="font-medium">Claro</h4>
                  <p className="text-sm text-neutral-gray-medium">Tema padrão</p>
                </div>

                <div className="p-4 border border-neutral-gray rounded-default cursor-pointer hover:border-primary-orange">
                  <div className="w-full h-20 bg-gray-800 rounded mb-3"></div>
                  <h4 className="font-medium">Escuro</h4>
                  <p className="text-sm text-neutral-gray-medium">Em breve</p>
                </div>

                <div className="p-4 border border-neutral-gray rounded-default cursor-pointer hover:border-primary-orange">
                  <div className="w-full h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded mb-3"></div>
                  <h4 className="font-medium">Automático</h4>
                  <p className="text-sm text-neutral-gray-medium">Segue o sistema</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Personalização</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Sidebar compacta por padrão</span>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Mostrar dicas de ferramentas</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Animações reduzidas</span>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'sistema':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Informações do Sistema</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <h4 className="font-medium mb-2">Versão</h4>
                  <p className="text-neutral-gray-medium">Mr.CRM v2.1.0</p>
                </Card>

                <Card>
                  <h4 className="font-medium mb-2">Última Atualização</h4>
                  <p className="text-neutral-gray-medium">15 de Janeiro, 2024</p>
                </Card>

                <Card>
                  <h4 className="font-medium mb-2">Usuários Ativos</h4>
                  <p className="text-neutral-gray-medium">12 usuários</p>
                </Card>

                <Card>
                  <h4 className="font-medium mb-2">Armazenamento</h4>
                  <p className="text-neutral-gray-medium">2.3 GB / 10 GB</p>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Backup e Exportação</h3>
              
              <div className="space-y-3">
                <Button variant="secondary" className="w-full md:w-auto">
                  <Database className="w-4 h-4 mr-2" />
                  Fazer Backup dos Dados
                </Button>
                
                <Button variant="secondary" className="w-full md:w-auto">
                  <Mail className="w-4 h-4 mr-2" />
                  Exportar Relatórios
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-section">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-title font-bold text-neutral-black">Configurações</h1>
        <p className="text-neutral-gray-medium mt-1">Gerencie suas preferências e configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center px-3 py-2 text-left rounded-default transition-colors
                    ${activeTab === tab.id 
                      ? 'bg-primary-orange text-white' 
                      : 'text-neutral-gray-medium hover:bg-gray-50 hover:text-neutral-black'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Content */}
        <Card className="lg:col-span-3">
          {renderTabContent()}
        </Card>
      </div>
    </div>
  );
};