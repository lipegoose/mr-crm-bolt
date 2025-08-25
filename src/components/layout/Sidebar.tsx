import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Building, 
  FileText, 
  Settings, 
  Menu,
  X,
  BarChart3
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'clientes', label: 'Clientes', icon: Users, path: '/clientes' },
  { id: 'condominios', label: 'Condomínios', icon: Building, path: '/condominios' },
  { id: 'imoveis', label: 'Imóveis', icon: Building, path: '/imoveis' },
  { id: 'contratos', label: 'Contratos', icon: FileText, path: '/contratos' },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3, path: '/relatorios' },
  { id: 'configuracoes', label: 'Configurações', icon: Settings, path: '/configuracoes' },
];

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-neutral-black text-white p-2 rounded-default"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full bg-neutral-black text-white z-50
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b border-gray-700 ${isCollapsed ? 'p-4' : 'py-0 px-4'}`}>
          {!isCollapsed && (
            <div 
              onClick={() => handleNavigation('/dashboard')} 
              className="cursor-pointer"
              role="button"
              aria-label="Ir para Dashboard"
            >
              <img src="/logo-mrcrm.png" alt="Logo Mr.CRM" className="h-16 w-auto" />
            </div>
          )}
          <button
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              setIsMobileOpen(false);
            }}
            className="p-1 hover:bg-gray-700 rounded"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center px-4 py-3 text-left
                  hover:bg-gray-700 transition-colors
                  ${isActive ? 'bg-primary-orange text-white' : 'text-gray-300'}
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="ml-3 font-body">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};