import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ImovelService, Proximidade } from '../../services/ImovelService';
import logger from '../../utils/logger';

interface ProximidadesProps {
  onUpdate: (data: any) => void;
  onFieldChange?: () => void;
  imovelId?: number;
  initialData?: Record<string, unknown>;
}

const Proximidades: React.FC<ProximidadesProps> = ({ onUpdate, onFieldChange, imovelId, initialData }) => {
  // Processamento dos dados iniciais para extrair proximidades
  let proximidadesIniciaisIds: number[] = [];
  let customProximidadesIniciais: {nome: string, distancia: string}[] = [];
  
  if (initialData) {
    // Extrair proximidades padrão
    if (Array.isArray(initialData.proximidades)) {
      // Processar os dados iniciais para extrair IDs
      proximidadesIniciaisIds = initialData.proximidades.map((item: any) => {
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
    
    // Extrair proximidades customizadas
    if (Array.isArray(initialData.customProximidades)) {
      customProximidadesIniciais = initialData.customProximidades as {nome: string, distancia: string}[];
    }
  }
  
  const [proximidadesSelecionadas, setProximidadesSelecionadas] = useState<number[]>(proximidadesIniciaisIds);
  const [novaProximidade, setNovaProximidade] = useState('');
  const [showNovaProximidadeForm, setShowNovaProximidadeForm] = useState(false);
  const [customProximidades, setCustomProximidades] = useState<{nome: string, distancia: string}[]>(customProximidadesIniciais);
  const savingTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);
  const [novaCustomProximidade, setNovaCustomProximidade] = useState({nome: '', distancia: ''});
  const [showNovaCustomProximidadeForm, setShowNovaCustomProximidadeForm] = useState(false);

  // Estado para armazenar as opções de proximidades carregadas da API
  const [opcoesProximidades, setOpcoesProximidades] = useState<Proximidade[]>([]);
  
  // Referência para controlar se o componente está montado
  const isMountedRef = useRef<boolean>(true);

  // Carregar opções de proximidades da API e dados iniciais do imóvel
  useEffect(() => {
    // Garantir que o componente está montado
    isMountedRef.current = true;
    
    // Função para carregar opções de proximidades
    const carregarOpcoes = async () => {
      try {
        logger.debug('[PROXIMIDADES] Carregando opções de proximidades');
        const resp = await ImovelService.getProximidades();
        
        if (isMountedRef.current) {
          setOpcoesProximidades(resp.data);
          logger.debug('[PROXIMIDADES] Opções carregadas com sucesso');
        }
      } catch (error) {
        if (isMountedRef.current) {
          logger.error('[PROXIMIDADES] Erro ao carregar opções:', error);
        }
      }
    };
    
    // Função para carregar dados do imóvel
    const carregarDadosImovel = async () => {
      if (!imovelId) return;
      
      try {
        logger.debug(`[PROXIMIDADES] Carregando dados do imóvel ${imovelId}`);
        const resp = await ImovelService.getEtapaProximidades(imovelId);
        
        if (isMountedRef.current && resp.data && resp.data.proximidades) {
          // Extrair IDs das proximidades
          const proximidadesIds = resp.data.proximidades.map((item: any) => Number(item.id));
          setProximidadesSelecionadas(proximidadesIds);
          logger.debug(`[PROXIMIDADES] Dados do imóvel ${imovelId} carregados com sucesso: ${JSON.stringify(proximidadesIds)}`);
        }
      } catch (error) {
        if (isMountedRef.current) {
          logger.error('[PROXIMIDADES] Erro ao carregar dados do imóvel:', error);
        }
      }
    };
    
    // Executar carregamento de dados
    carregarOpcoes();
    carregarDadosImovel();
    
    // Cleanup para evitar atualização de estado em componente desmontado
    return () => {
      isMountedRef.current = false;
    };
  }, [imovelId]); // Dependência em imovelId para recarregar quando mudar

  // Atualiza os dados do formulário quando há mudanças
  useEffect(() => {
    // Chamamos onUpdate apenas quando proximidadesSelecionadas ou customProximidades mudar
    onUpdate({ 
      proximidades: proximidadesSelecionadas,
      customProximidades: customProximidades 
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proximidadesSelecionadas, customProximidades]);

  // Função para salvar os dados na API com debounce foi movida diretamente para dentro do toggleProximidade
  // para garantir que sempre usamos os dados mais recentes

  // Função para alternar a seleção de uma proximidade
  const toggleProximidade = (proximidadeId: number) => {
    // Calcular a nova seleção antes de atualizar o estado
    const newSelection = proximidadesSelecionadas.includes(proximidadeId)
      ? proximidadesSelecionadas.filter(item => item !== proximidadeId)
      : [...proximidadesSelecionadas, proximidadeId];
    
    logger.debug(`[PROXIMIDADES] Toggle proximidade ${proximidadeId}, nova seleção: ${JSON.stringify(newSelection)}`);
    
    // Atualizar o estado com a nova seleção
    setProximidadesSelecionadas(newSelection);
    
    // Notificar que houve mudança - movido para fora do setState para evitar atualização durante renderização
    setTimeout(() => {
      onFieldChange?.();
    }, 0);
    
    // Salvar na API se houver um ID de imóvel
    if (imovelId) {
      // Usar a nova seleção calculada diretamente no salvamento
      if (savingTimeoutRef.current) clearTimeout(savingTimeoutRef.current as number);
      savingTimeoutRef.current = setTimeout(async () => {
        try {
          logger.debug(`[PROXIMIDADES] Salvando proximidades após toggle: ${JSON.stringify(newSelection)}`);
          
          // Enviar a nova seleção diretamente, sem depender do estado que pode ter sido alterado
          await ImovelService.updateEtapaProximidades(imovelId, {
            proximidades: newSelection
          });
          logger.info('[PROXIMIDADES] Proximidades atualizadas com sucesso após toggle.');
        } catch (error) {
          logger.error('[PROXIMIDADES] Erro ao atualizar proximidades após toggle:', error);
        }
      }, 300);
    }
  };

  // Função para adicionar uma nova proximidade
  const adicionarProximidade = () => {
    if (novaProximidade && !opcoesProximidades.some(p => p.nome === novaProximidade)) {
      // No contexto atual, sem endpoint para criar proximidade. Apenas fechar o formulário.
      setNovaProximidade('');
      setShowNovaProximidadeForm(false);
      
      // Notificar que houve mudança no campo
      onFieldChange?.();
      
      // Nota: Não implementamos a criação de novas proximidades no backend
      // Esta funcionalidade pode ser implementada no futuro
    }
  };

  // Função para adicionar uma nova proximidade personalizada com distância
  const adicionarCustomProximidade = () => {
    if (novaCustomProximidade.nome && novaCustomProximidade.distancia) {
      const newCustomProximidades = [...customProximidades, novaCustomProximidade];
      setCustomProximidades(newCustomProximidades);
      setNovaCustomProximidade({nome: '', distancia: ''});
      setShowNovaCustomProximidadeForm(false);
      
      // Notificar que houve mudança no campo
      onFieldChange?.();
      
      // Nota: O backend não suporta mais customProximidades
      // Esta funcionalidade pode ser implementada no futuro
    }
  };

  // Função para remover uma proximidade personalizada
  const removerCustomProximidade = (index: number) => {
    const newCustomProximidades = customProximidades.filter((_, i) => i !== index);
    setCustomProximidades(newCustomProximidades);
    
    // Notificar que houve mudança no campo
    onFieldChange?.();
    
    // Nota: O backend não suporta mais customProximidades
    // Esta funcionalidade pode ser implementada no futuro
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
          {opcoesProximidades.map((proximidade) => (
            <div 
              key={proximidade.id} 
              className="flex items-center"
            >
              <input
                type="checkbox"
                id={`proximidade-${proximidade.id}`}
                checked={proximidadesSelecionadas.includes(proximidade.id)}
                onChange={() => toggleProximidade(proximidade.id)}
                className="w-4 h-4 text-primary-orange border-neutral-gray rounded focus:ring-primary-orange"
              />
              <label 
                htmlFor={`proximidade-${proximidade.id}`}
                className="ml-2 text-sm text-neutral-black cursor-pointer"
              >
                {proximidade.nome}
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
