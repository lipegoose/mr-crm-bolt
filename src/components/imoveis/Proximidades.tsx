import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ProximidadesProps {
  onUpdate: (data: any) => void;
}

const Proximidades: React.FC<ProximidadesProps> = ({ onUpdate }) => {
  const [proximidadesSelecionadas, setProximidadesSelecionadas] = useState<string[]>([]);
  const [novaProximidade, setNovaProximidade] = useState('');
  const [showNovaProximidadeForm, setShowNovaProximidadeForm] = useState(false);
  const [customProximidades, setCustomProximidades] = useState<{nome: string, distancia: string}[]>([]);
  const [novaCustomProximidade, setNovaCustomProximidade] = useState({nome: '', distancia: ''});
  const [showNovaCustomProximidadeForm, setShowNovaCustomProximidadeForm] = useState(false);

  // Lista de proximidades disponíveis
  const proximidadesDisponiveis = [
    'Academia', 'Aeroporto', 'Banco', 'Biblioteca', 'Centro comercial', 
    'Cinema', 'Escola', 'Estação de metrô', 'Estação de trem', 'Farmácia', 
    'Hospital', 'Padaria', 'Parque', 'Ponto de ônibus', 'Posto de gasolina', 
    'Praia', 'Restaurante', 'Shopping', 'Supermercado', 'Teatro', 'Universidade'
  ];

  // Atualiza os dados do formulário quando há mudanças
  // Removemos onUpdate da lista de dependências para evitar o loop infinito
  useEffect(() => {
    // Chamamos onUpdate apenas quando proximidadesSelecionadas ou customProximidades mudar
    onUpdate({ 
      proximidades: proximidadesSelecionadas,
      customProximidades: customProximidades 
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proximidadesSelecionadas, customProximidades]);

  // Função para alternar a seleção de uma proximidade
  const toggleProximidade = (proximidade: string) => {
    if (proximidadesSelecionadas.includes(proximidade)) {
      setProximidadesSelecionadas(prev => 
        prev.filter(item => item !== proximidade)
      );
    } else {
      setProximidadesSelecionadas(prev => [...prev, proximidade]);
    }
  };

  // Função para adicionar uma nova proximidade
  const adicionarProximidade = () => {
    if (novaProximidade && !proximidadesDisponiveis.includes(novaProximidade)) {
      setProximidadesSelecionadas(prev => [...prev, novaProximidade]);
      setNovaProximidade('');
      setShowNovaProximidadeForm(false);
    }
  };

  // Função para adicionar uma nova proximidade personalizada com distância
  const adicionarCustomProximidade = () => {
    if (novaCustomProximidade.nome && novaCustomProximidade.distancia) {
      setCustomProximidades(prev => [...prev, novaCustomProximidade]);
      setNovaCustomProximidade({nome: '', distancia: ''});
      setShowNovaCustomProximidadeForm(false);
    }
  };

  // Função para remover uma proximidade personalizada
  const removerCustomProximidade = (index: number) => {
    setCustomProximidades(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-title font-semibold">Proximidades</h2>
          <p className="text-neutral-gray-medium">
            Defina os pontos de interesse próximos ao imóvel.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="secondary"
            className="flex items-center"
            onClick={() => setShowNovaProximidadeForm(true)}
          >
            <Plus size={16} className="mr-2" />
            Nova proximidade
          </Button>
          <Button 
            variant="secondary"
            className="flex items-center"
            onClick={() => setShowNovaCustomProximidadeForm(true)}
          >
            <Plus size={16} className="mr-2" />
            Proximidade com distância
          </Button>
        </div>
      </div>

      {showNovaProximidadeForm && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-sm font-medium mb-2">Adicionar nova proximidade</h3>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Nome da proximidade"
              className="flex-1 px-3 py-2 border border-neutral-gray rounded-default focus:outline-none focus:border-primary-orange"
              value={novaProximidade}
              onChange={(e) => setNovaProximidade(e.target.value)}
            />
            <Button onClick={adicionarProximidade}>Adicionar</Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowNovaProximidadeForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {showNovaCustomProximidadeForm && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-sm font-medium mb-2">Adicionar proximidade com distância</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Nome do local"
              placeholder="Ex: Shopping Center"
              value={novaCustomProximidade.nome}
              onChange={(e) => setNovaCustomProximidade(prev => ({...prev, nome: e.target.value}))}
            />
            <Input
              label="Distância (metros ou km)"
              placeholder="Ex: 500m ou 2km"
              value={novaCustomProximidade.distancia}
              onChange={(e) => setNovaCustomProximidade(prev => ({...prev, distancia: e.target.value}))}
            />
          </div>
          <div className="flex space-x-3">
            <Button onClick={adicionarCustomProximidade}>Adicionar</Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowNovaCustomProximidadeForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Proximidades gerais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {proximidadesDisponiveis.map((proximidade) => (
            <div 
              key={proximidade} 
              className="flex items-center"
            >
              <input
                type="checkbox"
                id={`proximidade-${proximidade}`}
                checked={proximidadesSelecionadas.includes(proximidade)}
                onChange={() => toggleProximidade(proximidade)}
                className="w-4 h-4 text-primary-orange border-neutral-gray rounded focus:ring-primary-orange"
              />
              <label 
                htmlFor={`proximidade-${proximidade}`}
                className="ml-2 text-sm text-neutral-black cursor-pointer"
              >
                {proximidade}
              </label>
            </div>
          ))}
        </div>
      </div>

      {customProximidades.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Proximidades com distância</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customProximidades.map((item, index) => (
              <div 
                key={index}
                className="flex justify-between items-center p-3 border border-neutral-gray rounded-default"
              >
                <div>
                  <span className="font-medium">{item.nome}</span>
                  <span className="ml-2 text-neutral-gray-medium">({item.distancia})</span>
                </div>
                <button
                  onClick={() => removerCustomProximidade(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Proximidades;
