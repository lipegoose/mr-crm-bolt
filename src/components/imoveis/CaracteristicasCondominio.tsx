import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { ImovelService } from '../../services/ImovelService';
import logger from '../../utils/logger';

interface CaracteristicasCondominioProps {
  onUpdate: (data: any) => void;
  onFieldChange?: () => void;
  imovelId?: number;
  initialData?: Record<string, unknown>;
}

const CaracteristicasCondominio: React.FC<CaracteristicasCondominioProps> = ({ onUpdate, onFieldChange, imovelId, initialData }) => {
  const [caracteristicasSelecionadas, setCaracteristicasSelecionadas] = useState<number[]>(
    Array.isArray(initialData?.caracteristicas) ? (initialData?.caracteristicas as number[]) : []
  );
  const [novaCaracteristica, setNovaCaracteristica] = useState('');
  const [showNovaCaracteristicaForm, setShowNovaCaracteristicaForm] = useState(false);
  const [opcoes, setOpcoes] = useState<{ id: number; nome: string }[]>([]);
  const savingTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await ImovelService.getCaracteristicas('CONDOMINIO');
        setOpcoes(resp.data.map((c: any) => ({ id: c.id, nome: c.nome })));
      } catch (error) {
        logger.error('[CARACTERISTICAS_COND] Erro ao carregar opções:', error);
      }
    })();
  }, []);

  useEffect(() => {
    onUpdate({ caracteristicasCondominio: caracteristicasSelecionadas });
    if (!imovelId) return;
    if (savingTimeoutRef.current) clearTimeout(savingTimeoutRef.current as number);
    savingTimeoutRef.current = setTimeout(async () => {
      try {
        await ImovelService.updateEtapaCaracteristicasCondominio(imovelId, { caracteristicas: caracteristicasSelecionadas });
        logger.info('[CARACTERISTICAS_COND] Características atualizadas com sucesso.');
      } catch (error) {
        logger.error('[CARACTERISTICAS_COND] Erro ao atualizar características:', error);
      }
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caracteristicasSelecionadas]);

  // Função para alternar a seleção de uma característica
  const toggleCaracteristica = (id: number) => {
    setCaracteristicasSelecionadas(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
    onFieldChange?.();
  };

  // Função para adicionar uma nova característica
  const adicionarCaracteristica = async () => {
    try {
      if (!novaCaracteristica.trim()) return;
      setNovaCaracteristica('');
      setShowNovaCaracteristicaForm(false);
    } catch (error) {
      logger.error('[CARACTERISTICAS_COND] Erro ao adicionar característica:', error);
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
        {opcoes.map((opt) => (
          <div 
            key={opt.id} 
            className="flex items-center"
          >
            <input
              type="checkbox"
              id={`caracteristica-condominio-${opt.id}`}
              checked={caracteristicasSelecionadas.includes(opt.id)}
              onChange={() => toggleCaracteristica(opt.id)}
              className="w-4 h-4 text-primary-orange border-neutral-gray rounded focus:ring-primary-orange"
            />
            <label 
              htmlFor={`caracteristica-condominio-${opt.id}`}
              className="ml-2 text-sm text-neutral-black cursor-pointer"
            >
              {opt.nome}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaracteristicasCondominio;
