import React, { useState, useEffect, useRef } from 'react';
import { TextArea } from '../ui/TextArea';
import { Input } from '../ui/Input';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ImovelService } from '../../services/ImovelService';
import logger from '../../utils/logger';

/**
 * Componente Complementos
 * 
 * Este componente gerencia a etapa de Complementos do cadastro de imóveis.
 * 
 * Alterações realizadas:
 * - Ajustado o formato do payload para corresponder ao esperado pela API
 * - Corrigido o mapeamento dos campos entre frontend e backend
 * - Implementado auto-save com debounce para todos os campos
 * - Adicionado suporte para ambos os formatos de dados (url/caminho) para compatibilidade
 * - Melhorado o sistema de logs para facilitar depuração
 */

// Interfaces para tipagem correta dos dados
interface Video {
  id?: number;
  titulo: string;
  url: string;
  ordem?: number;
}

// Interface para plantas no formato da API
interface PlantaAPI {
  id?: number;
  titulo: string;
  url: string;
  ordem?: number;
}

// Interface para o formato interno do componente
interface FormDataType {
  observacoes: string;
  videos: Video[];
  tourVirtual: string;
  plantas: Array<{
    id?: number;
    titulo: string;
    url: string;
  }>;
}

// Interface para os dados enviados à API - usando a interface do ImovelService

// Usando a interface do ImovelService para tipagem correta
type Complementos = {
  id: number;
  complementos?: string[];
  created_at: string;
  updated_at: string;
  observacoes_internas?: string;
  tour_virtual_url?: string;
  videos?: Video[];
  plantas?: PlantaAPI[];
}

interface ComplementosProps {
  onUpdate: (data: Record<string, unknown>) => void;
  onFieldChange?: () => void;
  imovelId?: number;
  initialData?: Record<string, unknown>;
}

const Complementos: React.FC<ComplementosProps> = ({ onUpdate, onFieldChange, imovelId, initialData }) => {
  if (!imovelId) {
    throw new Error('ImovelId é obrigatório');
  }

  // Processamento dos dados iniciais
  const initialObservacoes = initialData?.observacoes_internas as string || '';
  const initialVideos = initialData?.videos as Video[] || [];
  const initialTourVirtual = initialData?.tour_virtual_url as string || '';
  
  // Converter plantas para o formato interno
  // O campo pode ser 'url' ou 'caminho' dependendo da origem dos dados
  const initialPlantas = (initialData?.plantas as Array<any> || []).map(planta => ({
    id: planta.id,
    titulo: planta.titulo,
    url: planta.url || planta.caminho || '', // Usar url (do payload) ou caminho (legado)
  }));
  
  const [formData, setFormData] = useState<FormDataType>({
    observacoes: initialObservacoes,
    videos: initialVideos,
    tourVirtual: initialTourVirtual,
    plantas: initialPlantas,
  });
  
  // Log para debug
  useEffect(() => {
    logger.debug('[COMPLEMENTOS] Dados iniciais recebidos:', initialData);
  }, [initialData]);
  
  // Referência para controlar o timeout de salvamento por campo
  const savingTimeoutsRef = useRef<Record<string, NodeJS.Timeout | number>>({});

  const [novoVideo, setNovoVideo] = useState({ titulo: '', url: '' });
  const [novaPlanta, setNovaPlanta] = useState({ titulo: '', url: '' });

  // Atualiza os dados do formulário quando há mudanças
  // Removemos onUpdate da lista de dependências para evitar o loop infinito
  useEffect(() => {
    // Chamamos onUpdate apenas quando formData mudar
    // Convertemos explicitamente para Record<string, unknown>
    onUpdate(formData as unknown as Record<string, unknown>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);
  
  // Função para salvar dados na API com o formato correto
  const salvarNaAPI = async (data: Partial<FormDataType> & Record<string, unknown>) => {
    console.log('[COMPLEMENTOS] Iniciando salvarNaAPI com dados:', data);
    
    if (!imovelId) {
      console.log('[COMPLEMENTOS] Erro: Tentativa de salvar sem imovelId');
      return;
    }
    
    try {
      // Converter do formato interno para o formato da API
      const apiData: Record<string, any> = {};
      console.log('[COMPLEMENTOS] imovelId:', imovelId);
      
      // Mapear campos para o formato esperado pela API
      if ('observacoes' in data) {
        apiData.observacoes_internas = data.observacoes;
        console.log(`[COMPLEMENTOS] Preparando observações para API: ${data.observacoes}`);
      }
      
      if ('tourVirtual' in data) {
        apiData.tour_virtual_url = data.tourVirtual;
        console.log(`[COMPLEMENTOS] Preparando tour virtual para API: ${data.tourVirtual}`);
      }
      
      if ('videos' in data && data.videos) {
        // Manter a estrutura exata conforme o payload do Postman
        apiData.videos = data.videos.map(video => ({
          titulo: video.titulo,
          url: video.url,
          ...(video.id ? { id: video.id } : {})
        }));
        console.log(`[COMPLEMENTOS] Preparando vídeos para API: ${data.videos.length} vídeos`);
      }
      
      if ('plantas' in data && data.plantas) {
        // Converter plantas do formato interno para o formato da API
        // Conforme o payload do Postman, o campo é 'url' e não 'caminho'
        apiData.plantas = data.plantas.map(planta => ({
          titulo: planta.titulo,
          url: planta.url,
          ...(planta.id ? { id: planta.id } : {})
        }));
        console.log(`[COMPLEMENTOS] Preparando plantas para API: ${data.plantas.length} plantas`);
      }
      
      console.log(`[COMPLEMENTOS] Enviando dados para API:`, apiData);
      console.log(`[COMPLEMENTOS] Chamando ImovelService.updateEtapaComplementos(${imovelId}, ...)`);
      const response = await ImovelService.updateEtapaComplementos(imovelId, apiData);
      console.log(`[COMPLEMENTOS] Dados salvos com sucesso:`, response);
    } catch (error) {
      console.error(`[COMPLEMENTOS] Erro ao salvar dados:`, error);
    }
  };

  // Função de debounce para evitar chamadas excessivas à API
  const debounceSave = (fieldName: string, data: Partial<FormDataType>) => {
    // Log para debug com console.log direto
    console.log(`[COMPLEMENTOS] Iniciando debounce para o campo: ${fieldName}`, data);
    
    // Cancelar timeout anterior se existir
    if (savingTimeoutsRef.current[fieldName]) {
      console.log(`[COMPLEMENTOS] Cancelando timeout anterior para o campo: ${fieldName}`);
      clearTimeout(savingTimeoutsRef.current[fieldName] as NodeJS.Timeout);
    }
    
    // Configurar novo timeout
    console.log(`[COMPLEMENTOS] Configurando novo timeout para o campo: ${fieldName}`);
    savingTimeoutsRef.current[fieldName] = setTimeout(() => {
      console.log(`[COMPLEMENTOS] Executando salvamento para o campo: ${fieldName} após debounce`);
      salvarNaAPI(data);
      // Limpar a referência após executar
      delete savingTimeoutsRef.current[fieldName];
    }, 500); // Reduzindo para 500ms para ser mais responsivo
  };
  
  // Função para adicionar um novo vídeo
  const adicionarVideo = async () => {
    if (novoVideo.titulo && novoVideo.url) {
      // Criar nova lista de vídeos com o novo vídeo adicionado
      const updatedVideos = [...formData.videos, novoVideo];
      
      // Atualizar o estado local
      setFormData(prev => ({
        ...prev,
        videos: updatedVideos
      }));
      
      setNovoVideo({ titulo: '', url: '' });
      
      // Notificar que houve mudança no campo
      onFieldChange?.();
      
      // Salvar na API com debounce
      if (imovelId) {
        debounceSave('videos', { videos: updatedVideos });
      }
    }
  };

  // Função para remover um vídeo
  const removerVideo = async (index: number) => {
    // Criar nova lista de vídeos sem o vídeo removido
    const updatedVideos = formData.videos.filter((_, i) => i !== index);
    
    // Atualizar o estado local
    setFormData(prev => ({
      ...prev,
      videos: updatedVideos
    }));
    
    // Notificar que houve mudança no campo
    onFieldChange?.();
    
    // Salvar na API com debounce
    if (imovelId) {
      debounceSave('videos', { videos: updatedVideos });
    }
  };

  // Função para adicionar uma nova planta
  const adicionarPlanta = async () => {
    if (novaPlanta.titulo && novaPlanta.url) {
      // Criar nova lista de plantas com a nova planta adicionada
      const updatedPlantas = [...formData.plantas, novaPlanta];
      
      // Atualizar o estado local
      setFormData(prev => ({
        ...prev,
        plantas: updatedPlantas
      }));
      
      setNovaPlanta({ titulo: '', url: '' });
      
      // Notificar que houve mudança no campo
      onFieldChange?.();
      
      // Salvar na API com debounce
      if (imovelId) {
        debounceSave('plantas', { plantas: updatedPlantas });
      }
    }
  };

  // Função para remover uma planta
  const removerPlanta = async (index: number) => {
    // Criar nova lista de plantas sem a planta removida
    const updatedPlantas = formData.plantas.filter((_, i) => i !== index);
    
    // Atualizar o estado local
    setFormData(prev => ({
      ...prev,
      plantas: updatedPlantas
    }));
    
    // Notificar que houve mudança no campo
    onFieldChange?.();
    
    // Salvar na API com debounce
    if (imovelId) {
      debounceSave('plantas', { plantas: updatedPlantas });
    }
  };

  // Função para lidar com a alteração das observações internas
  const handleObservacoesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Atualizar o estado local
    setFormData(prev => ({
      ...prev,
      observacoes: newValue
    }));
    
    // Notificar que houve mudança no campo
    onFieldChange?.();
    
    // Salvar na API com debounce
    if (imovelId) {
      debounceSave('observacoes', { observacoes: newValue });
    }
  };
  
  // Função para lidar com a alteração do tour virtual
  const handleTourVirtualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Atualizar o estado local
    setFormData(prev => ({
      ...prev,
      tourVirtual: newValue
    }));
    
    // Notificar que houve mudança no campo
    onFieldChange?.();
    
    // Salvar na API com debounce
    if (imovelId) {
      debounceSave('tourVirtual', { tourVirtual: newValue });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-title font-semibold mb-4">Complementos</h2>
      <p className="text-neutral-gray-medium mb-6">
        Adicione informações complementares ao imóvel.
      </p>

      <div className="space-y-8">
        <div>
          <TextArea
            label="Observações internas (não aparece no site)"
            placeholder="Adicione observações internas sobre o imóvel..."
            value={formData.observacoes}
            onChange={handleObservacoesChange}
            rows={4}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Vídeos</h3>
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Título do vídeo"
                placeholder="Ex: Tour pelo imóvel"
                value={novoVideo.titulo}
                onChange={(e) => {
                  setNovoVideo(prev => ({ ...prev, titulo: e.target.value }));
                  onFieldChange?.();
                }}
              />
              <Input
                label="URL do vídeo (YouTube, Vimeo, etc.)"
                placeholder="https://..."
                value={novoVideo.url}
                onChange={(e) => {
                  setNovoVideo(prev => ({ ...prev, url: e.target.value }));
                  onFieldChange?.();
                }}
              />
            </div>
            <Button 
              onClick={adicionarVideo}
              disabled={!novoVideo.titulo || !novoVideo.url}
              className="flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Adicionar vídeo
            </Button>
          </div>

          {formData.videos.length > 0 && (
            <div className="space-y-3">
              {formData.videos.map((video, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center p-3 border border-neutral-gray rounded-default"
                >
                  <div>
                    <span className="font-medium">{video.titulo}</span>
                    <span className="block text-sm text-neutral-gray-medium">{video.url}</span>
                  </div>
                  <button
                    onClick={() => removerVideo(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Tour Virtual</h3>
          <Input
            label="URL do Tour Virtual (360°)"
            placeholder="https://..."
            value={formData.tourVirtual}
            onChange={handleTourVirtualChange}
          />
          <p className="text-xs text-neutral-gray-medium mt-1">
            Adicione o link do tour virtual em 360° do imóvel, se disponível.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Plantas do Imóvel</h3>
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Título da planta"
                placeholder="Ex: Planta baixa - 1° andar"
                value={novaPlanta.titulo}
                onChange={(e) => {
                  setNovaPlanta(prev => ({ ...prev, titulo: e.target.value }));
                  onFieldChange?.();
                }}
              />
              <Input
                label="URL da imagem da planta"
                placeholder="https://..."
                value={novaPlanta.url}
                onChange={(e) => {
                  setNovaPlanta(prev => ({ ...prev, url: e.target.value }));
                  onFieldChange?.();
                }}
              />
            </div>
            <Button 
              onClick={adicionarPlanta}
              disabled={!novaPlanta.titulo || !novaPlanta.url}
              className="flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Adicionar planta
            </Button>
          </div>

          {formData.plantas.length > 0 && (
            <div className="space-y-3">
              {formData.plantas.map((planta, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center p-3 border border-neutral-gray rounded-default"
                >
                  <div>
                    <span className="font-medium">{planta.titulo}</span>
                    <span className="block text-sm text-neutral-gray-medium">{planta.url}</span>
                  </div>
                  <button
                    onClick={() => removerPlanta(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Complementos;
