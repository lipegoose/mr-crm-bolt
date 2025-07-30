import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Login } from './components/pages/Login';
import { Dashboard } from './components/pages/Dashboard';
import { Clientes } from './components/pages/Clientes';
import ClienteCadastroCompleto from './components/pages/ClienteCadastroCompleto';
import { Imoveis } from './components/pages/Imoveis';
import ImovelCadastro from './components/pages/ImovelCadastro';
import { Contratos } from './components/pages/Contratos';
import { Relatorios } from './components/pages/Relatorios';
import { Configuracoes } from './components/pages/Configuracoes';

const AppLayout: React.FC = () => {
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
            <Route path="/clientes/novo" element={<ClienteCadastroCompleto />} />
            <Route path="/imoveis" element={<Imoveis />} />
            <Route path="/imoveis/novo" element={<ImovelCadastro />} />
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
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;