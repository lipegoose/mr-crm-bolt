import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ sidebarCollapsed }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Aqui poderia ter lógica adicional de logout como limpar tokens, etc.
    navigate('/login');
  };
  return (
    <header className={`
      fixed top-0 right-0 h-16 bg-white border-b border-neutral-gray z-30
      transition-all duration-300
      ${sidebarCollapsed ? 'left-16' : 'left-64'}
      lg:left-${sidebarCollapsed ? '16' : '64'}
      left-0
    `}>
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-medium w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-gray rounded-default focus:outline-none focus:border-primary-orange"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-neutral-gray-medium hover:text-neutral-black">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-status-error rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <Avatar name="Dan" size="sm" />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-neutral-black">Dan</p>
              <p className="text-xs text-neutral-gray-medium">Administrador</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};