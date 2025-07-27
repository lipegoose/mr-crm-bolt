import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, Search, Filter, Edit, Trash2, MapPin, DollarSign, Home } from 'lucide-react';

interface Imovel {
  id: number;
  titulo: string;
  tipo: 'casa' | 'apartamento' | 'comercial';
  endereco: string;
  preco: number;
  area: number;
  quartos?: number;
  banheiros?: number;
  status: 'disponivel' | 'vendido' | 'alugado' | 'reservado';
  imagem: string;
}

const mockImoveis: Imovel[] = [
  {
    id: 1,
    titulo: 'Apartamento Centro',
    tipo: 'apartamento',
    endereco: 'Rua das Flores, 123 - Centro',
    preco: 450000,
    area: 85,
    quartos: 3,
    banheiros: 2,
    status: 'disponivel',
    imagem: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 2,
    titulo: 'Casa Jardim América',
    tipo: 'casa',
    endereco: 'Av. Paulista, 456 - Jardim América',
    preco: 850000,
    area: 180,
    quartos: 4,
    banheiros: 3,
    status: 'vendido',
    imagem: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 3,
    titulo: 'Loja Comercial',
    tipo: 'comercial',
    endereco: 'Rua do Comércio, 789 - Vila Madalena',
    preco: 320000,
    area: 120,
    status: 'disponivel',
    imagem: 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export const Imoveis: React.FC = () => {
  const navigate = useNavigate();
  const [imoveis] = useState<Imovel[]>(mockImoveis);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredImoveis = imoveis.filter(imovel =>
    imovel.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    imovel.endereco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel':
        return 'bg-status-success text-white';
      case 'vendido':
        return 'bg-neutral-gray-medium text-white';
      case 'alugado':
        return 'bg-status-info text-white';
      case 'reservado':
        return 'bg-primary-orange text-white';
      default:
        return 'bg-neutral-gray text-neutral-black';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'casa':
        return Home;
      case 'apartamento':
        return Home;
      case 'comercial':
        return Home;
      default:
        return Home;
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
          <h1 className="text-3xl font-title font-bold text-neutral-black">Imóveis</h1>
          <p className="text-neutral-gray-medium mt-1">Gerencie seu portfólio de imóveis</p>
        </div>
        <Button onClick={() => navigate('/imoveis/novo')}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Imóvel
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
                placeholder="Buscar imóveis..."
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

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImoveis.map((imovel) => {
          const TipoIcon = getTipoIcon(imovel.tipo);
          
          return (
            <Card key={imovel.id} className="overflow-hidden p-0">
              {/* Image */}
              <div className="relative h-48">
                <img
                  src={imovel.imagem}
                  alt={imovel.titulo}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(imovel.status)}`}>
                    {imovel.status.charAt(0).toUpperCase() + imovel.status.slice(1)}
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <div className="bg-white bg-opacity-90 p-1 rounded">
                    <TipoIcon className="w-4 h-4 text-primary-orange" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-component">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-neutral-black">{imovel.titulo}</h3>
                    <div className="flex items-center text-sm text-neutral-gray-medium mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {imovel.endereco}
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
                  <div className="flex items-center text-lg font-semibold text-primary-orange">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {formatPrice(imovel.preco)}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-neutral-gray-medium">
                    <span>{imovel.area}m²</span>
                    {imovel.quartos && (
                      <span>{imovel.quartos} quartos</span>
                    )}
                    {imovel.banheiros && (
                      <span>{imovel.banheiros} banheiros</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
    </div>
  );
};