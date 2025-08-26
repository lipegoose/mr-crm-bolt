import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { ImovelService } from '../../services/ImovelService';
import logger from '../../utils/logger';
import CaracteristicaService from '../../services/CaracteristicaService';

// Removido cache de módulo para evitar dados desatualizados e múltiplos fluxos

interface CaracteristicasImovelProps {
  onUpdate: (data: any) => void;
  onFieldChange?: () => void;
  imovelId?: number;
  initialData?: Record<string, unknown>;
  active?: boolean;
}

const CaracteristicasImovel: React.FC<CaracteristicasImovelProps> = ({ onUpdate, onFieldChange, imovelId, initialData, active }) => {
  // Processamento dos dados iniciais para extrair IDs de objetos ou usar IDs diretos
  let sanitizedInitialData: number[] = [];
  
  if (Array.isArray(initialData?.caracteristicas)) {
    sanitizedInitialData = initialData.caracteristicas.map(item => {
      // Caso 1: O item é um objeto com propriedade id (formato do retorno da API)
      if (item && typeof item === 'object' && 'id' in item) {
        return Number(item.id);
      }
      // Caso 2: O item já é um número ou string numérica
      else if (typeof item === 'number' || (typeof item === 'string' && !isNaN(Number(item)))) {
        return Number(item);
      }
      // Caso 3: Item inválido, será filtrado
      else {
        return NaN;
      }
    }).filter(id => !isNaN(id)); // Filtra quaisquer valores NaN
  }
  
  const [caracteristicasSelecionadas, setCaracteristicasSelecionadas] = useState<number[]>(sanitizedInitialData);
  const [novaCaracteristica, setNovaCaracteristica] = useState('');
  const [showNovaCaracteristicaForm, setShowNovaCaracteristicaForm] = useState(false);
  const [opcoes, setOpcoes] = useState<{ id: number; nome: string }[]>([]);
  const savingTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);
  const loadedOnceRef = useRef(false);
  const prevActiveRef = useRef<boolean | undefined>(undefined);

  const reloadOpcoes = useCallback(async () => {
    let isMounted = true;
    try {
      logger.info('[CARACTERISTICAS_IMOVEL] reloadOpcoes -> refreshCaracteristicas(IMOVEL)');
      const resp = await ImovelService.refreshCaracteristicas('IMOVEL');
      if (isMounted) {
        setOpcoes(resp.data.map((c: any) => ({ id: c.id, nome: c.nome })));
      }
    } catch (err) {
      if (isMounted) logger.error('[CARACTERISTICAS_IMOVEL] Erro ao recarregar opções:', err);
    }
    return () => { isMounted = false; };
  }, []);

  // Carregar no mount (uma única vez) e proteger contra StrictMode
  useEffect(() => {
    if (!loadedOnceRef.current) {
      loadedOnceRef.current = true;
      logger.info('[CARACTERISTICAS_IMOVEL] useEffect(mount): carregando opções (primeira vez)');
      void reloadOpcoes();
    } else {
      logger.info('[CARACTERISTICAS_IMOVEL] useEffect(mount): ignorado (já carregado)');
    }
  }, [reloadOpcoes]);

  // Recarregar ao reentrar na aba (transição false -> true)
  useEffect(() => {
    const prev = prevActiveRef.current;
    prevActiveRef.current = active;
    if (prev === false && active === true) {
      logger.info('[CARACTERISTICAS_IMOVEL] useEffect(active): reentrando na aba, recarregando opções');
      void reloadOpcoes();
    } else {
      logger.info('[CARACTERISTICAS_IMOVEL] useEffect(active): sem reload (prev=', prev, ', active=', active, ')');
    }
  }, [active, reloadOpcoes]);


  // Notifica o componente pai sobre as características selecionadas (sem salvar na API)
  useEffect(() => {
    onUpdate({ caracteristicas: caracteristicasSelecionadas });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caracteristicasSelecionadas]);

  // Função para alternar a seleção de uma característica (por ID)
  const toggleCaracteristica = (id: number) => {
    // Calcular a nova seleção antes de atualizar o estado
    const newSelection = caracteristicasSelecionadas.includes(id)
      ? caracteristicasSelecionadas.filter(item => item !== id)
      : [...caracteristicasSelecionadas, id];
    
    // Atualizar o estado com a nova seleção
    setCaracteristicasSelecionadas(newSelection);
    
    // Notifica que houve mudança - movido para fora do setState para evitar atualização durante renderização
    setTimeout(() => {
      onFieldChange?.();
    }, 0);
    
    // Salva na API com debounce - usando a nova seleção calculada
    if (imovelId) {
      if (savingTimeoutRef.current) clearTimeout(savingTimeoutRef.current as number);
      savingTimeoutRef.current = setTimeout(async () => {
        try {
          // Converter cada ID para string individualmente
          const stringIds = newSelection.map(itemId => String(itemId));
          
          await ImovelService.updateEtapaCaracteristicas(imovelId, { 
            caracteristicas: stringIds
          });
          logger.info('[CARACTERISTICAS_IMOVEL] Características atualizadas com sucesso.');
        } catch (error) {
          logger.error('[CARACTERISTICAS_IMOVEL] Erro ao atualizar características:', error);
        }
      }, 300);
    }
  };

  // Função para adicionar uma nova característica (requer backend para criar e retornar ID)
  const adicionarCaracteristica = async () => {
    try {
      if (!novaCaracteristica.trim()) return;
      // Evitar duplicidade por nome (case-insensitive)
      const exists = opcoes.some(
        (o) => o.nome.trim().toLowerCase() === novaCaracteristica.trim().toLowerCase()
      );
      if (exists) {
        logger.warn('[CARACTERISTICAS_IMOVEL] Característica já existe pelo nome. Selecionando existente.');
        const existing = opcoes.find(
          (o) => o.nome.trim().toLowerCase() === novaCaracteristica.trim().toLowerCase()
        );
        if (existing) {
          const newSelection = caracteristicasSelecionadas.includes(existing.id)
            ? caracteristicasSelecionadas
            : [...caracteristicasSelecionadas, existing.id];
          setCaracteristicasSelecionadas(newSelection);
          onFieldChange?.();
          if (imovelId) {
            if (savingTimeoutRef.current) clearTimeout(savingTimeoutRef.current as number);
            savingTimeoutRef.current = setTimeout(async () => {
              try {
                const stringIds = newSelection.map((id) => String(id));
                await ImovelService.updateEtapaCaracteristicas(imovelId, { caracteristicas: stringIds });
              } catch (e) {
                logger.error('[CARACTERISTICAS_IMOVEL] Erro ao salvar após seleção de existente:', e);
              }
            }, 0);
          }
        }
        setNovaCaracteristica('');
        setShowNovaCaracteristicaForm(false);
        return;
      }

      // Criar no backend
      const created = await CaracteristicaService.createCaracteristica({
        nome: novaCaracteristica.trim(),
        escopo: 'IMOVEL',
      });

      // Atualizar opções rapidamente e depois forçar reload para ordenar pelo backend
      const novasOpcoes = [...opcoes, { id: created.id, nome: created.nome }];
      setOpcoes(novasOpcoes);

      // Marcar como selecionada imediatamente
      const newSelection = caracteristicasSelecionadas.includes(created.id)
        ? caracteristicasSelecionadas
        : [...caracteristicasSelecionadas, created.id];
      setCaracteristicasSelecionadas(newSelection);

      // Notificar mudança e salvar no backend (se houver imovelId)
      onFieldChange?.();
      if (imovelId) {
        if (savingTimeoutRef.current) clearTimeout(savingTimeoutRef.current as number);
        savingTimeoutRef.current = setTimeout(async () => {
          try {
            const stringIds = newSelection.map((id) => String(id));
            await ImovelService.updateEtapaCaracteristicas(imovelId, { caracteristicas: stringIds });
            logger.info('[CARACTERISTICAS_IMOVEL] Nova característica criada e salva no imóvel.');
          } catch (error) {
            logger.error('[CARACTERISTICAS_IMOVEL] Erro ao salvar após criação de característica:', error);
          }
        }, 0);
      }

      // Aplicar ordenação e estado real do backend
      try {
        await reloadOpcoes();
      } catch {}

      // Fechar form
      setNovaCaracteristica('');
      setShowNovaCaracteristicaForm(false);
    } catch (error) {
      logger.error('[CARACTERISTICAS_IMOVEL] Erro ao adicionar característica:', error);
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
        {opcoes.map((opt) => (
          <div 
            key={opt.id} 
            className="flex items-center"
          >
            <input
              type="checkbox"
              id={`caracteristica-${opt.id}`}
              checked={caracteristicasSelecionadas.includes(opt.id)}
              onChange={() => toggleCaracteristica(opt.id)}
              className="w-4 h-4 text-primary-orange border-neutral-gray rounded focus:ring-primary-orange"
            />
            <label 
              htmlFor={`caracteristica-${opt.id}`}
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

export default CaracteristicasImovel;
