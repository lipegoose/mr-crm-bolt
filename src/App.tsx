import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/pages/Dashboard';
import { Clientes } from './components/pages/Clientes';
import { Imoveis } from './components/pages/Imoveis';
import { Contratos } from './components/pages/Contratos';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'clientes':
        return <Clientes />;
      case 'imoveis':
        return <Imoveis />;
      case 'contratos':
        return <Contratos />;
      case 'relatorios':
        return (
          <div className="text-center py-12">
            <h1 className="text-2xl font-title font-bold text-neutral-black mb-4">Relatórios</h1>
            <p className="text-neutral-gray-medium">Página em desenvolvimento</p>
          </div>
        );
      case 'configuracoes':
        return (
          <div className="text-center py-12">
            <h1 className="text-2xl font-title font-bold text-neutral-black mb-4">Configurações</h1>
            <p className="text-neutral-gray-medium">Página em desenvolvimento</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
      />
      
      <Header sidebarCollapsed={sidebarCollapsed} />
      
      <main className={`
        transition-all duration-300 pt-16
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
        ml-0
      `}>
        <div className="max-w-container mx-auto p-6">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;