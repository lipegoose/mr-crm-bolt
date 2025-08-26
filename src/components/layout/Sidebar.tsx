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
  BarChart3,
  Layers
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
  const [caracteristicasOpen, setCaracteristicasOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  // Abre o submenu de Características automaticamente quando estamos na rota
  // de características, para evidenciar o contexto atual.
  React.useEffect(() => {
    if (location.pathname === '/caracteristicas') {
      setCaracteristicasOpen(true);
    }
  }, [location.pathname]);

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

          {/* Grupo: Características */}
          <div className="mt-2">
            <button
              onClick={() => setCaracteristicasOpen(!caracteristicasOpen)}
              className={`
                w-full flex items-center px-4 py-3 text-left
                hover:bg-gray-700 transition-colors text-gray-300
                ${location.pathname === '/caracteristicas' ? 'bg-gray-800 text-white' : ''}
                ${isCollapsed ? 'justify-center' : ''}
              `}
              aria-expanded={caracteristicasOpen}
            >
              <Layers className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 font-body">Características</span>
              )}
            </button>

            {/* Subitens */}
            {!isCollapsed && caracteristicasOpen && (
              <div className="ml-6 mr-3 mt-1 flex flex-col bg-gray-800/60 rounded-md p-2 border border-gray-700">
                {(() => {
                  const escopo = new URLSearchParams(location.search).get('escopo');
                  const isImovel = location.pathname === '/caracteristicas' && escopo === 'IMOVEL';
                  const isCondominio = location.pathname === '/caracteristicas' && escopo === 'CONDOMINIO';
                  return (
                    <>
                      <button
                        onClick={() => handleNavigation('/caracteristicas?escopo=IMOVEL')}
                        className={`text-left py-2 text-sm rounded px-3 transition-colors
                          ${isImovel ? 'bg-primary-orange/20 text-primary-orange border-l-2 border-primary-orange' : 'text-gray-300 hover:text-white hover:bg-gray-700/60'}`}
                      >
                        Imóvel
                      </button>
                      <button
                        onClick={() => handleNavigation('/caracteristicas?escopo=CONDOMINIO')}
                        className={`text-left py-2 text-sm rounded px-3 transition-colors mt-1
                          ${isCondominio ? 'bg-primary-orange/20 text-primary-orange border-l-2 border-primary-orange' : 'text-gray-300 hover:text-white hover:bg-gray-700/60'}`}
                      >
                        Condomínio
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Item Proximidades */}
          <button
            onClick={() => handleNavigation('/proximidades')}
            className={`
              w-full flex items-center px-4 py-3 text-left mt-2
              hover:bg-gray-700 transition-colors
              ${location.pathname === '/proximidades' ? 'bg-primary-orange text-white' : 'text-gray-300'}
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <Building className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="ml-3 font-body">Proximidades</span>
            )}
          </button>
        </nav>
      </aside>
    </>
  );
};