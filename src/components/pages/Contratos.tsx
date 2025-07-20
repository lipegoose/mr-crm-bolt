import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, Search, Filter, Edit, Trash2, FileText, Calendar, User, Building } from 'lucide-react';

interface Contrato {
  id: number;
  numero: string;
  cliente: string;
  imovel: string;
  tipo: 'venda' | 'aluguel';
  valor: number;
  dataInicio: string;
  dataFim?: string;
  status: 'ativo' | 'finalizado' | 'cancelado' | 'pendente';
}

const mockContratos: Contrato[] = [
  {
    id: 1,
    numero: 'CT-2024-001',
    cliente: 'Maria Santos',
    imovel: 'Apartamento Centro',
    tipo: 'venda',
    valor: 450000,
    dataInicio: '2024-01-15',
    status: 'ativo',
  },
  {
    id: 2,
    numero: 'CT-2024-002',
    cliente: 'João Silva',
    imovel: 'Casa Jardim América',
    tipo: 'aluguel',
    valor: 3500,
    dataInicio: '2024-01-10',
    dataFim: '2025-01-10',
    status: 'ativo',
  },
  {
    id: 3,
    numero: 'CT-2024-003',
    cliente: 'Ana Costa',
    imovel: 'Loja Comercial',
    tipo: 'aluguel',
    valor: 2800,
    dataInicio: '2024-01-05',
    dataFim: '2024-12-05',
    status: 'pendente',
  },
];

export const Contratos: React.FC = () => {
  const [contratos] = useState<Contrato[]>(mockContratos);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filteredContratos = contratos.filter(contrato =>
    contrato.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.imovel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-status-success text-white';
      case 'finalizado':
        return 'bg-neutral-gray-medium text-white';
      case 'cancelado':
        return 'bg-status-error text-white';
      case 'pendente':
        return 'bg-primary-orange text-white';
      default:
        return 'bg-neutral-gray text-neutral-black';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'venda':
        return 'bg-status-info text-white';
      case 'aluguel':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-neutral-gray text-neutral-black';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="space-y-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-title font-bold text-neutral-black">Contratos</h1>
          <p className="text-neutral-gray-medium mt-1">Gerencie contratos de venda e aluguel</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
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
                placeholder="Buscar contratos..."
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

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContratos.map((contrato) => (
          <Card key={contrato.id}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Contract Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary-orange bg-opacity-10 rounded-default">
                    <FileText className="w-5 h-5 text-primary-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-black">{contrato.numero}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(contrato.status)}`}>
                        {contrato.status.charAt(0).toUpperCase() + contrato.status.slice(1)}
                      </span>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTipoColor(contrato.tipo)}`}>
                        {contrato.tipo.charAt(0).toUpperCase() + contrato.tipo.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-neutral-gray-medium">
                    <User className="w-4 h-4 mr-2" />
                    <div>
                      <p className="text-neutral-black font-medium">{contrato.cliente}</p>
                      <p>Cliente</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-neutral-gray-medium">
                    <Building className="w-4 h-4 mr-2" />
                    <div>
                      <p className="text-neutral-black font-medium">{contrato.imovel}</p>
                      <p>Imóvel</p>
                    </div>
                  </div>

                  <div className="flex items-center text-neutral-gray-medium">
                    <Calendar className="w-4 h-4 mr-2" />
                    <div>
                      <p className="text-neutral-black font-medium">
                        {new Date(contrato.dataInicio).toLocaleDateString('pt-BR')}
                        {contrato.dataFim && ` - ${new Date(contrato.dataFim).toLocaleDateString('pt-BR')}`}
                      </p>
                      <p>Período</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Value and Actions */}
              <div className="flex items-center justify-between lg:flex-col lg:items-end gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-orange">
                    {formatPrice(contrato.valor)}
                  </p>
                  <p className="text-sm text-neutral-gray-medium">
                    {contrato.tipo === 'aluguel' ? 'por mês' : 'total'}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button className="p-2 text-neutral-gray-medium hover:text-primary-orange">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-neutral-gray-medium hover:text-status-error">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-title font-semibold">Novo Contrato</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-neutral-gray-medium hover:text-neutral-black"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-black mb-1">
                  Número do Contrato
                </label>
                <input
                  type="text"
                  placeholder="CT-2024-XXX"
                  className="w-full px-component py-2 border border-neutral-gray rounded-default focus:outline-none focus:border-primary-orange"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-black mb-1">
                  Cliente
                </label>
                <select className="w-full px-component py-2 border border-neutral-gray rounded-default focus:outline-none focus:border-primary-orange">
                  <option value="">Selecione o cliente</option>
                  <option value="1">Maria Santos</option>
                  <option value="2">João Silva</option>
                  <option value="3">Ana Costa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-black mb-1">
                  Imóvel
                </label>
                <select className="w-full px-component py-2 border border-neutral-gray rounded-default focus:outline-none focus:border-primary-orange">
                  <option value="">Selecione o imóvel</option>
                  <option value="1">Apartamento Centro</option>
                  <option value="2">Casa Jardim América</option>
                  <option value="3">Loja Comercial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-black mb-1">
                  Tipo
                </label>
                <select className="w-full px-component py-2 border border-neutral-gray rounded-default focus:outline-none focus:border-primary-orange">
                  <option value="">Selecione o tipo</option>
                  <option value="venda">Venda</option>
                  <option value="aluguel">Aluguel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-black mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  placeholder="0,00"
                  className="w-full px-component py-2 border border-neutral-gray rounded-default focus:outline-none focus:border-primary-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-black mb-1">
                    Data Início
                  </label>
                  <input
                    type="date"
                    className="w-full px-component py-2 border border-neutral-gray rounded-default focus:outline-none focus:border-primary-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-black mb-1">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    className="w-full px-component py-2 border border-neutral-gray rounded-default focus:outline-none focus:border-primary-orange"
                  />
                </div>
              </div>

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