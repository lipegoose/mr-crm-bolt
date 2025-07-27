import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface CaracteristicasCondominioProps {
  onUpdate: (data: any) => void;
}

const CaracteristicasCondominio: React.FC<CaracteristicasCondominioProps> = ({ onUpdate }) => {
  const [caracteristicasSelecionadas, setCaracteristicasSelecionadas] = useState<string[]>([]);
  const [novaCaracteristica, setNovaCaracteristica] = useState('');
  const [showNovaCaracteristicaForm, setShowNovaCaracteristicaForm] = useState(false);

  // Lista de características disponíveis para condomínio
  const caracteristicasDisponiveis = [
    'Academia', 'Área de festas', 'Área gourmet', 'Bicicletário', 'Brinquedoteca',
    'Campo de futebol', 'Churrasqueira coletiva', 'Cinema', 'Circuito de segurança',
    'Elevador', 'Espaço coworking', 'Espaço gourmet', 'Espaço pet', 'Espaço zen',
    'Estacionamento para visitantes', 'Fitness', 'Gerador', 'Guarita', 'Jardim',
    'Lavanderia coletiva', 'Piscina adulto', 'Piscina infantil', 'Playground',
    'Portaria 24h', 'Portaria eletrônica', 'Porteiro eletrônico', 'Quadra de esportes',
    'Quadra de tênis', 'Quadra poliesportiva', 'Salão de festas', 'Salão de jogos',
    'Sauna', 'Segurança 24h', 'Spa', 'Vagas para visitantes', 'Wi-fi nas áreas comuns'
  ];

  // Atualiza os dados do formulário quando há mudanças
  // Removemos onUpdate da lista de dependências para evitar o loop infinito
  useEffect(() => {
    // Chamamos onUpdate apenas quando caracteristicasSelecionadas mudar
    onUpdate({ caracteristicasCondominio: caracteristicasSelecionadas });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caracteristicasSelecionadas]);

  // Função para alternar a seleção de uma característica
  const toggleCaracteristica = (caracteristica: string) => {
    if (caracteristicasSelecionadas.includes(caracteristica)) {
      setCaracteristicasSelecionadas(prev => 
        prev.filter(item => item !== caracteristica)
      );
    } else {
      setCaracteristicasSelecionadas(prev => [...prev, caracteristica]);
    }
  };

  // Função para adicionar uma nova característica
  const adicionarCaracteristica = () => {
    if (novaCaracteristica && !caracteristicasDisponiveis.includes(novaCaracteristica)) {
      setCaracteristicasSelecionadas(prev => [...prev, novaCaracteristica]);
      setNovaCaracteristica('');
      setShowNovaCaracteristicaForm(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-title font-semibold">Características do Condomínio</h2>
          <p className="text-neutral-gray-medium">
            Defina todas as características do condomínio onde o imóvel está localizado.
          </p>
        </div>
        <Button 
          variant="secondary"
          className="flex items-center"
          onClick={() => setShowNovaCaracteristicaForm(true)}
        >
          <Plus size={16} className="mr-2" />
          Nova característica
        </Button>
      </div>

      {showNovaCaracteristicaForm && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-sm font-medium mb-2">Adicionar nova característica</h3>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Nome da característica"
              className="flex-1 px-3 py-2 border border-neutral-gray rounded-default focus:outline-none focus:border-primary-orange"
              value={novaCaracteristica}
              onChange={(e) => setNovaCaracteristica(e.target.value)}
            />
            <Button onClick={adicionarCaracteristica}>Adicionar</Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowNovaCaracteristicaForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {caracteristicasDisponiveis.map((caracteristica) => (
          <div 
            key={caracteristica} 
            className="flex items-center"
          >
            <input
              type="checkbox"
              id={`caracteristica-condominio-${caracteristica}`}
              checked={caracteristicasSelecionadas.includes(caracteristica)}
              onChange={() => toggleCaracteristica(caracteristica)}
              className="w-4 h-4 text-primary-orange border-neutral-gray rounded focus:ring-primary-orange"
            />
            <label 
              htmlFor={`caracteristica-condominio-${caracteristica}`}
              className="ml-2 text-sm text-neutral-black cursor-pointer"
            >
              {caracteristica}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaracteristicasCondominio;
