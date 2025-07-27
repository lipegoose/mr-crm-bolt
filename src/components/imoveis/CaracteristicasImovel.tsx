import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface CaracteristicasImovelProps {
  onUpdate: (data: any) => void;
}

const CaracteristicasImovel: React.FC<CaracteristicasImovelProps> = ({ onUpdate }) => {
  const [caracteristicasSelecionadas, setCaracteristicasSelecionadas] = useState<string[]>([]);
  const [novaCaracteristica, setNovaCaracteristica] = useState('');
  const [showNovaCaracteristicaForm, setShowNovaCaracteristicaForm] = useState(false);

  // Lista de características disponíveis
  const caracteristicasDisponiveis = [
    'Aceita Financiamento', 'Aceita Permuta', 'Adega', 'Alarme', 'Aprovado Ambiental',
    'Aquecimento a gás', 'Aquecimento central', 'Aquecimento solar', 'Ar',
    'Ar condicionado central', 'Área esportiva', 'Area Serviço', 'Armario Area De Servico',
    'Armario Banheiro', 'Armario Closet', 'Armario Corredor', 'Armario Cozinha',
    'Armario Dorm. Empregada', 'Armario Dormitorio', 'Armario Escritorio', 'Armario Home Theater',
    'Armário na cozinha', 'Armario Sala', 'Banheira', 'Banheiro Empregada', 'Biblioteca',
    'Cabeamento estruturado', 'Calefação', 'Campo Futebol', 'Churrasqueira', 'Cimento Queimado',
    'Circuito de segurança', 'Condominio Fechado', 'Copa', 'Cozinha', 'Cozinha americana',
    'Cozinha gourmet', 'Deck Molhado', 'Depósito', 'Deposito', 'Despensa', 'Destaque',
    'Dormitorio Empregada', 'Dormitorio Reversivel', 'Elevador', 'Energia solar', 'Escritorio',
    'Espaço Pet', 'Espaço verde', 'Exclusividade', 'Fechadura digital', 'Fgts', 'Forro de gesso',
    'Forro de madeira', 'Forro de PVC', 'Gás central', 'Gás individual', 'Gerador elétrico',
    'Hidro', 'Hidromassagem', 'Hidrômetro individual', 'Interfone', 'Internet',
    'Isolamento acústico', 'Jardim Inverno', 'Lareira', 'Lavabo', 'Lavanderia', 'Litoral',
    'Locado', 'Mezanino', 'Mobiliado', 'Ofuro', 'Pe Direito Duplo', 'Piscina', 'Piso Ardosia',
    'Piso Granito', 'Piso Laminado', 'Piso Marmore', 'Piso Porcelanato', 'Piso Taboa',
    'Piso Taco', 'Placa', 'Portais', 'Portao', 'Portaria', 'Projeto Aprovado',
    'Quadra Poliesportiva', 'Ronda/Vigilância', 'Rua asfaltada', 'Sacada', 'Sauna',
    'Sem Comdomínio', 'Sistema de alarme', 'Site', 'Solarium', 'Terraco', 'Tv Cabo',
    'Varanda', 'Varanda Gourmet', 'Vestiario', 'Vigia', 'Vista exterior',
    'Vista para a montanha', 'Vista para o lago', 'Zelador'
  ];

  // Atualiza os dados do formulário quando há mudanças
  // Removemos onUpdate da lista de dependências para evitar o loop infinito
  useEffect(() => {
    // Chamamos onUpdate apenas quando caracteristicasSelecionadas mudar
    onUpdate({ caracteristicas: caracteristicasSelecionadas });
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
          <h2 className="text-xl font-title font-semibold">Características do Imóvel</h2>
          <p className="text-neutral-gray-medium">
            Defina todas as características deste imóvel.
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
              id={`caracteristica-${caracteristica}`}
              checked={caracteristicasSelecionadas.includes(caracteristica)}
              onChange={() => toggleCaracteristica(caracteristica)}
              className="w-4 h-4 text-primary-orange border-neutral-gray rounded focus:ring-primary-orange"
            />
            <label 
              htmlFor={`caracteristica-${caracteristica}`}
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

export default CaracteristicasImovel;
