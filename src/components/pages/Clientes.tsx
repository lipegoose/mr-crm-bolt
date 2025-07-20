import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { Plus, Search, Filter, Edit, Trash2, Phone, Mail } from 'lucide-react';

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  status: 'ativo' | 'inativo' | 'prospecto';
  dataUltimoContato: string;
}

const mockClientes: Cliente[] = [
  {
    id: 1,
    nome: 'Maria Santos',
    email: 'maria.santos@email.com',
    telefone: '(11) 99999-9999',
    cidade: 'São Paulo',
    status: 'ativo',
    dataUltimoContato: '2024-01-15',
  },
  {
    id: 2,
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    telefone: '(11) 88888-8888',
    cidade: 'Rio de Janeiro',
    status: 'prospecto',
    dataUltimoContato: '2024-01-14',
  },
  {
    id: 3,
    nome: 'Ana Costa',
    email: 'ana.costa@email.com',
    telefone: '(11) 77777-7777',
    cidade: 'Belo Horizonte',
    status: 'ativo',
    dataUltimoContato: '2024-01-13',
  },
];

export const Clientes: React.FC = () => {
  const [clientes] = useState<Cliente[]>(mockClientes);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-status-success text-white';
      case 'inativo':
        return 'bg-neutral-gray-medium text-white';
      case 'prospecto':
        return 'bg-status-info text-white';
      default:
        return 'bg-neutral-gray text-neutral-black';
    }
  };

  return (
    <div className="space-y-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-title font-bold text-neutral-black">Clientes</h1>
          <p className="text-neutral-gray-medium mt-1">Gerencie seus clientes e prospects</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-medium w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-gray rounded-default focus:outline-none focus:border-primary-orange"
              />
            </div>
          </div>
          <Button variant="secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
      </Card>

      {/* Clients List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClientes.map((cliente) => (
          <Card key={cliente.id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar name={cliente.nome} />
                <div>
                  <h3 className="font-semibold text-neutral-black">{cliente.nome}</h3>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(cliente.status)}`}>
                    {cliente.status.charAt(0).toUpperCase() + cliente.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex space-x-1">
                <button className="p-1 text-neutral-gray-medium hover:text-primary-orange">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-1 text-neutral-gray-medium hover:text-status-error">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-neutral-gray-medium">
                <Mail className="w-4 h-4 mr-2" />
                {cliente.email}
              </div>
              <div className="flex items-center text-sm text-neutral-gray-medium">
                <Phone className="w-4 h-4 mr-2" />
                {cliente.telefone}
              </div>
              <div className="text-sm text-neutral-gray-medium">
                📍 {cliente.cidade}
              </div>
              <div className="text-xs text-neutral-gray-medium pt-2 border-t border-neutral-gray">
                Último contato: {new Date(cliente.dataUltimoContato).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-title font-semibold">Novo Cliente</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-neutral-gray-medium hover:text-neutral-black"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4">
              <Input label="Nome completo" placeholder="Digite o nome" />
              <Input label="Email" type="email" placeholder="email@exemplo.com" />
              <Input label="Telefone" placeholder="(11) 99999-9999" />
              <Input label="Cidade" placeholder="Digite a cidade" />
              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex-1">Salvar</Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};