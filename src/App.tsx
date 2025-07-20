import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Login } from './components/pages/Login';
import { Dashboard } from './components/pages/Dashboard';
import { Clientes } from './components/pages/Clientes';
import { Imoveis } from './components/pages/Imoveis';
import { Contratos } from './components/pages/Contratos';
import { Relatorios } from './components/pages/Relatorios';
import { Configuracoes } from './components/pages/Configuracoes';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header sidebarCollapsed={false} />
      
      <main className="transition-all duration-300 pt-16 lg:ml-64 ml-0">
        <div className="max-w-container mx-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/imoveis" element={<Imoveis />} />
            <Route path="/contratos" element={<Contratos />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </Router>
  );
}

export default App;