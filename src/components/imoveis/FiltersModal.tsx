import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  totalImoveis: number;
}

const FiltersModal: React.FC<FiltersModalProps> = ({ isOpen, onClose, onApplyFilters, totalImoveis }) => {
  // Estado para armazenar todos os filtros
  const [filters, setFilters] = useState({
    tipoSubtipo: '',
    transacao: '',
    uf: 'MG',
    cidade: '',
    bairros: [] as string[],
    perfilImovel: '',
    dormitorios: 0,
    suites: 0,
    garagens: 0,
    situacao: [] as string[],
    precoMin: '',
    precoMax: '',
    areaMin: '',
    areaMax: '',
    mobiliado: '',
    aceitaPermuta: '',
    aceitaFinanciamento: '',
    requisitosImovel: [] as string[],
    requisitosCondominio: [] as string[]
  });

  // Opções para os selects
  const tiposSubtipos = [
    { value: '', label: 'Selecione' },
    { value: 'apartamento', label: 'Apartamento' },
    { value: 'casa', label: 'Casa' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'terreno', label: 'Terreno' },
    { value: 'rural', label: 'Rural' }
  ];

  const cidades = [
    { value: '', label: 'Selecione' },
    { value: 'belo-horizonte', label: 'Belo Horizonte' },
    { value: 'nova-lima', label: 'Nova Lima' }
  ];

  const bairros = [
    { value: 'centro', label: 'Centro' },
    { value: 'savassi', label: 'Savassi' },
    { value: 'lourdes', label: 'Lourdes' },
    { value: 'funcionarios', label: 'Funcionários' },
    { value: 'serra', label: 'Serra' },
    { value: 'sion', label: 'Sion' },
    { value: 'mangabeiras', label: 'Mangabeiras' },
    { value: 'vila-da-serra', label: 'Vila da Serra' },
    { value: 'vale-dos-cristais', label: 'Vale dos Cristais' },
    { value: 'jardim-canada', label: 'Jardim Canadá' }
  ];

  const perfisImovel = [
    { value: '', label: 'Selecione' },
    { value: 'residencial', label: 'Residencial' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'rural', label: 'Rural' },
    { value: 'misto', label: 'Misto' }
  ];

  const situacoes = [
    { value: 'novo', label: 'Novo' },
    { value: 'usado', label: 'Usado' },
    { value: 'na-planta', label: 'Na planta' },
    { value: 'em-construcao', label: 'Em construção' }
  ];

  const requisitosImovel = [
    { value: 'piscina', label: 'Piscina' },
    { value: 'churrasqueira', label: 'Churrasqueira' },
    { value: 'jardim', label: 'Jardim' },
    { value: 'quintal', label: 'Quintal' },
    { value: 'varanda', label: 'Varanda' },
    { value: 'sacada', label: 'Sacada' },
    { value: 'area-de-servico', label: 'Área de serviço' },
    { value: 'suite-master', label: 'Suíte master' }
  ];

  const requisitosCondominio = [
    { value: 'academia', label: 'Academia' },
    { value: 'piscina', label: 'Piscina' },
    { value: 'salao-de-festas', label: 'Salão de festas' },
    { value: 'churrasqueira', label: 'Churrasqueira' },
    { value: 'playground', label: 'Playground' },
    { value: 'quadra', label: 'Quadra' },
    { value: 'portaria-24h', label: 'Portaria 24h' },
    { value: 'seguranca', label: 'Segurança' }
  ];

  // Funções para manipular os incrementadores
  const incrementField = (field: 'dormitorios' | 'suites' | 'garagens') => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field] + 1
    }));
  };

  const decrementField = (field: 'dormitorios' | 'suites' | 'garagens') => {
    if (filters[field] > 0) {
      setFilters(prev => ({
        ...prev,
        [field]: prev[field] - 1
      }));
    }
  };

  // Função para manipular os campos de texto e selects simples
  const handleChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para manipular os selects múltiplos
  const handleMultiSelectChange = (field: 'bairros' | 'situacao' | 'requisitosImovel' | 'requisitosCondominio', value: string) => {
    setFilters(prev => {
      const currentValues = prev[field] as string[];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [field]: currentValues.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [field]: [...currentValues, value]
        };
      }
    });
  };
  
  // Função para manipular os botões de alternativa única ou nenhuma
  const handleToggleButton = (field: 'transacao' | 'mobiliado' | 'aceitaPermuta' | 'aceitaFinanciamento', value: string) => {
    setFilters(prev => {
      // Se o valor já está selecionado, desmarca (define como string vazia)
      if (prev[field] === value) {
        return {
          ...prev,
          [field]: ''
        };
      } 
      // Caso contrário, seleciona esse valor (substitui o valor anterior, se houver)
      else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };
  
  // Função para verificar se um valor está selecionado em um array
  const isArraySelected = (field: 'bairros' | 'situacao' | 'requisitosImovel' | 'requisitosCondominio', value: string): boolean => {
    return (filters[field] as string[]).includes(value);
  };
  
  // Função para verificar se um botão de alternativa única está selecionado
  const isButtonSelected = (field: 'transacao' | 'mobiliado' | 'aceitaPermuta' | 'aceitaFinanciamento', value: string): boolean => {
    return filters[field] === value;
  };

  // Função para aplicar os filtros
  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" style={{ marginTop: 0 }}>
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-black">Pesquisa de Imóveis</h2>
            <button 
              onClick={onClose}
              className="text-neutral-gray-medium hover:text-neutral-black"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo e Subtipo */}
            <div>
              <label className="block text-sm font-medium text-neutral-gray-dark mb-1">
                Tipo e Subtipo
              </label>
              <Select
                options={tiposSubtipos}
                value={filters.tipoSubtipo}
                onChange={(e) => handleChange('tipoSubtipo', e.target.value)}
              />
            </div>

            {/* Transação */}
            <div>
              <label className="block text-sm font-medium text-neutral-gray-dark mb-1">
                Transação
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleButton('transacao', 'venda')}
                  className={`px-4 py-2 rounded-md ${isButtonSelected('transacao', 'venda') 
                    ? 'bg-primary-orange text-white' 
                    : 'bg-neutral-gray-light text-neutral-gray-dark'}`}
                >
                  Venda
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleButton('transacao', 'aluguel')}
                  className={`px-4 py-2 rounded-md ${isButtonSelected('transacao', 'aluguel') 
                    ? 'bg-primary-orange text-white' 
                    : 'bg-neutral-gray-light text-neutral-gray-dark'}`}
                >
                  Aluguel
                </button>
              </div>
            </div>

            {/* UF removido pois será sempre MG */}

            {/* Cidade */}
            <div>
              <label className="block text-sm font-medium text-neutral-gray-dark mb-1">
                Cidade
              </label>
              <Select
                options={cidades}
                value={filters.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
              />
            </div>

            {/* Bairros - Select múltiplo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-gray-dark mb-1">
                Bairros
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {bairros.map(bairro => (
                  <div key={bairro.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`bairro-${bairro.value}`}
                      checked={isArraySelected('bairros', bairro.value)}
                      onChange={() => handleMultiSelectChange('bairros', bairro.value)}
                      className="mr-2"
                    />
                    <label htmlFor={`bairro-${bairro.value}`} className="text-sm">
                      {bairro.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Perfil do Imóvel */}
            <div>
              <label className="block text-sm font-medium text-neutral-gray-dark mb-1">
                Perfil do Imóvel
              </label>
              <Select
                options={perfisImovel}
                value={filters.perfilImovel}
                onChange={(e) => handleChange('perfilImovel', e.target.value)}
              />
            </div>

            {/* Dormitórios, Suítes e Garagens em uma linha */}
            <div className="md:col-span-3 flex flex-wrap gap-4">
              {/* Dormitórios */}
              <div className="flex-1 min-w-[120px]">
                <label className="block text-sm font-medium text-neutral-gray-dark mb-1">
                  Dormitórios
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => decrementField('dormitorios')}
                    className="bg-neutral-gray-light p-2 rounded-l-md"
                    disabled={filters.dormitorios === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="px-4 py-2 border-t border-b border-neutral-gray">
                    {filters.dormitorios}
                  </div>
                  <button
                    type="button"
                    onClick={() => incrementField('dormitorios')}
                    className="bg-neutral-gray-light p-2 rounded-r-md"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Suítes */}
              <div className="flex-1 min-w-[120px]">
                <label className="block text-sm font-medium text-neutral-gray-dark mb-1">
                  Suítes
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => decrementField('suites')}
                    className="bg-neutral-gray-light p-2 rounded-l-md"
                    disabled={filters.suites === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="px-4 py-2 border-t border-b border-neutral-gray">
                    {filters.suites}
                  </div>
                  <button
                    type="button"
                    onClick={() => incrementField('suites')}
                    className="bg-neutral-gray-light p-2 rounded-r-md"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Garagens */}
              <div className="flex-1 min-w-[120px]">
                <label className="block text-sm font-medium text-neutral-gray-dark mb-1">
                  Garagens
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => decrementField('garagens')}
                    className="bg-neutral-gray-light p-2 rounded-l-md"
                    disabled={filters.garagens === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="px-4 py-2 border-t border-b border-neutral-gray">
                    {filters.garagens}
                  </div>
                  <button
                    type="button"
                    onClick={() => incrementField('garagens')}
                    className="bg-neutral-gray-light p-2 rounded-r-md"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Situação - Select múltiplo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-gray-dark mb-1">
                Situação
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {situacoes.map(situacao => (
                  <div key={situacao.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`situacao-${situacao.value}`}
                      checked={isArraySelected('situacao', situacao.value)}
                      onChange={() => handleMultiSelectChange('situacao', situacao.value)}
                      className="mr-2"
                    />
                    <label htmlFor={`situacao-${situacao.value}`} className="text-sm">
                      {situacao.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Preço e Área na mesma linha */}
            <div className="md:col-span-3 flex flex-wrap gap-4">
              {/* Preço */}
              <div className="flex-1 min-w-[250px]">
                <label className="block text-sm font-medium text-neutral-gray-dark mb-1">
                  Preço
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Mínimo"
                    value={filters.precoMin}
                    onChange={(e) => handleChange('precoMin', e.target.value)}
                  />
                  <span>até</span>
                  <Input
                    type="text"
                    placeholder="Máximo"
                    value={filters.precoMax}
                    onChange={(e) => handleChange('precoMax', e.target.value)}
                  />
                </div>
              </div>

              {/* Área */}
              <div className="flex-1 min-w-[250px]">
                <label className="block text-sm font-medium text-neutral-gray-dark mb-1">
                  Área
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Mínimo"
                    value={filters.areaMin}
                    onChange={(e) => handleChange('areaMin', e.target.value)}
                  />
                  <span>até</span>
                  <Input
                    type="text"
                    placeholder="Máximo"
                    value={filters.areaMax}
                    onChange={(e) => handleChange('areaMax', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Mobiliado, Aceita Permuta e Aceita Financiamento em uma linha */}
            <div className="md:col-span-3 flex flex-wrap gap-4">
              {/* Mobiliado */}
              <div className="flex-1 min-w-[120px]">
                <label className="block text-sm font-medium text-neutral-gray-dark mb-1">
                  Mobiliado
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleButton('mobiliado', 'sim')}
                    className={`px-4 py-2 rounded-md ${isButtonSelected('mobiliado', 'sim') 
                      ? 'bg-primary-orange text-white' 
                      : 'bg-neutral-gray-light text-neutral-gray-dark'}`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleButton('mobiliado', 'nao')}
                    className={`px-4 py-2 rounded-md ${isButtonSelected('mobiliado', 'nao') 
                      ? 'bg-primary-orange text-white' 
                      : 'bg-neutral-gray-light text-neutral-gray-dark'}`}
                  >
                    Não
                  </button>
                </div>
              </div>

              {/* Aceita Permuta */}
              <div className="flex-1 min-w-[120px]">
                <label className="block text-sm font-medium text-neutral-gray-dark mb-1">
                  Aceita Permuta
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleButton('aceitaPermuta', 'sim')}
                    className={`px-4 py-2 rounded-md ${isButtonSelected('aceitaPermuta', 'sim') 
                      ? 'bg-primary-orange text-white' 
                      : 'bg-neutral-gray-light text-neutral-gray-dark'}`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleButton('aceitaPermuta', 'nao')}
                    className={`px-4 py-2 rounded-md ${isButtonSelected('aceitaPermuta', 'nao') 
                      ? 'bg-primary-orange text-white' 
                      : 'bg-neutral-gray-light text-neutral-gray-dark'}`}
                  >
                    Não
                  </button>
                </div>
              </div>

              {/* Aceita Financiamento */}
              <div className="flex-1 min-w-[160px]">
                <label className="block text-sm font-medium text-neutral-gray-dark mb-1">
                  Aceita Financiamento
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleButton('aceitaFinanciamento', 'sim')}
                    className={`px-4 py-2 rounded-md ${isButtonSelected('aceitaFinanciamento', 'sim') 
                      ? 'bg-primary-orange text-white' 
                      : 'bg-neutral-gray-light text-neutral-gray-dark'}`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleButton('aceitaFinanciamento', 'nao')}
                    className={`px-4 py-2 rounded-md ${isButtonSelected('aceitaFinanciamento', 'nao') 
                      ? 'bg-primary-orange text-white' 
                      : 'bg-neutral-gray-light text-neutral-gray-dark'}`}
                  >
                    Não
                  </button>
                </div>
              </div>
            </div>

            {/* Requisitos do Imóvel - Select múltiplo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-gray-dark mb-1">
                Requisitos do Imóvel
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {requisitosImovel.map(requisito => (
                  <div key={requisito.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`requisito-imovel-${requisito.value}`}
                      checked={isArraySelected('requisitosImovel', requisito.value)}
                      onChange={() => handleMultiSelectChange('requisitosImovel', requisito.value)}
                      className="mr-2"
                    />
                    <label htmlFor={`requisito-imovel-${requisito.value}`} className="text-sm">
                      {requisito.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Requisitos do Condomínio - Select múltiplo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-gray-dark mb-1">
                Requisitos do Condomínio
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {requisitosCondominio.map(requisito => (
                  <div key={requisito.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`requisito-condominio-${requisito.value}`}
                      checked={isArraySelected('requisitosCondominio', requisito.value)}
                      onChange={() => handleMultiSelectChange('requisitosCondominio', requisito.value)}
                      className="mr-2"
                    />
                    <label htmlFor={`requisito-condominio-${requisito.value}`} className="text-sm">
                      {requisito.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-neutral-gray-light pt-4">
            <div className="flex justify-between items-center">
              <div className="text-lg font-bold">
                {totalImoveis} imóveis encontrados
              </div>
              <div className="flex gap-4">
                <Button variant="secondary" onClick={onClose}>
                  Cancelar
                </Button>
                <Button onClick={applyFilters}>
                  Ver Imóveis
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersModal;
