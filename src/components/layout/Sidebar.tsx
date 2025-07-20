import React, { useState } from 'react';
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

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'imoveis', label: 'Imóveis', icon: Building },
  { id: 'contratos', label: 'Contratos', icon: FileText },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!isCollapsed && (
            <h1 className="text-xl font-title font-bold text-primary-orange">
              Mr.CRM
            </h1>
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
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setIsMobileOpen(false);
                }}
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