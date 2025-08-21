import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ImovelService, ImagensEtapa } from '../../services/ImovelService';
import logger from '../../utils/logger';

interface ImagensImovelProps {
  onUpdate: (data: any) => void;
  onFieldChange?: () => void;
  imovelId?: number;
  initialData?: ImagensEtapa | Record<string, unknown>;
}

type UIImagem = { id: number; url: string; titulo: string | null; principal: boolean };

const ImagensImovel: React.FC<ImagensImovelProps> = ({ onUpdate, onFieldChange, imovelId, initialData }) => {
  const [imagens, setImagens] = useState<UIImagem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isUploadDragActive, setIsUploadDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const tituloDebounceTimers = useRef<Record<number, any>>({});
  const reorderDebounceTimer = useRef<any>(null);

  // Normaliza initialData caso venha como Record
  const normalizedInitial = useMemo(() => {
    if (!initialData) return undefined;
    if ('imagens' in (initialData as any)) return initialData as ImagensEtapa;
    return undefined;
  }, [initialData]);

  // Carregar imagens do backend quando inicializar a etapa
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (normalizedInitial && normalizedInitial.imagens) {
          const list = normalizedInitial.imagens.map(img => ({
            id: img.id,
            url: img.url,
            titulo: img.titulo ?? null,
            principal: !!img.principal,
          } as UIImagem));
          if (mounted) setImagens(list);
          return;
        }
        if (imovelId) {
          logger.debug(`[IMAGENS] Buscando etapaImagens do imóvel ${imovelId}`);
          const resp = await ImovelService.getEtapaImagens(imovelId);
          const list = (resp.data.imagens || []).map(img => ({
            id: img.id,
            url: img.url,
            titulo: img.titulo ?? null,
            principal: !!img.principal,
          } as UIImagem));
          if (mounted) setImagens(list);
        }
      } catch (error) {
        logger.error('[IMAGENS] Erro ao carregar imagens:', error);
      }
    };
    load();
    return () => { mounted = false; };
  }, [imovelId, normalizedInitial]);

  // Atualiza os dados do formulário quando há mudanças
  // Removemos onUpdate da lista de dependências para evitar o loop infinito
  useEffect(() => {
    // Chamamos onUpdate apenas quando imagens mudar
    onUpdate({ imagens });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagens]);

  // Helper para processar uma lista de arquivos (input ou DnD)
  const processFiles = async (files: FileList | File[]) => {
    if (!imovelId) {
      logger.warn('[IMAGENS] imovelId ausente, não é possível fazer upload');
      return;
    }
    const arr = Array.from(files as any as File[]);
    for (const file of arr) {
      try {
        const resp = await ImovelService.uploadImagem(imovelId, file);
        const img = resp.data; // ImagemImovel normalizado no service
        const url = (img as any)?.url_completa
          || (img as any)?.url
          || (img?.caminho ? `/storage/${img.caminho}` : '');
        setImagens(prev => ([
          ...prev,
          {
            id: img.id,
            url,
            titulo: img.titulo ?? null,
            principal: !!img.principal,
          },
        ]));
      } catch (error) {
        logger.error('[IMAGENS] Erro ao enviar imagem:', error);
      }
    }
  };

  // Função para adicionar novas imagens via input
  const adicionarImagens = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    await processFiles(files);
    // Limpa o input para permitir selecionar os mesmos arquivos novamente
    event.target.value = '';
    onFieldChange?.();
  };

  // Drag-and-drop na área de upload
  const onUploadDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const onUploadDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsUploadDragActive(true);
  };
  const onUploadDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsUploadDragActive(false);
  };
  const onUploadDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsUploadDragActive(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
      onFieldChange?.();
      // Limpamos os itens de DnD para evitar manter referência a arquivos
      e.dataTransfer.clearData();
    }
  };

  // Função para remover uma imagem
  const removerImagem = async (id: number) => {
    setImagens(prev => {
      const novasImagens = prev.filter(img => img.id !== id);
      
      // Se removemos a imagem principal, definimos a primeira como principal (se houver)
      if (prev.find(img => img.id === id)?.principal && novasImagens.length > 0) {
        novasImagens[0].principal = true;
      }
      
      return novasImagens;
    });
    if (imovelId) {
      try {
        await ImovelService.deletarImagem(imovelId, id);
      } catch (error) {
        logger.error('[IMAGENS] Erro ao deletar imagem:', error);
      }
    }
    
    // Notificar que houve mudança no campo
    onFieldChange?.();
  };

  // Função para definir uma imagem como principal
  const definirPrincipal = async (id: number) => {
    setImagens(prev => prev.map(img => ({
      ...img,
      principal: img.id === id
    })));
    if (imovelId) {
      try {
        await ImovelService.definirImagemPrincipal(imovelId, id);
      } catch (error) {
        logger.error('[IMAGENS] Erro ao definir principal:', error);
      }
    }
    
    // Notificar que houve mudança no campo
    onFieldChange?.();
  };

  // Função para atualizar o título da imagem
  const atualizarTitulo = (id: number, titulo: string) => {
    setImagens(prev => prev.map(img => (img.id === id ? { ...img, titulo } : img)));
    if (imovelId) {
      // debounce por imagem
      if (tituloDebounceTimers.current[id]) {
        clearTimeout(tituloDebounceTimers.current[id]);
      }
      tituloDebounceTimers.current[id] = setTimeout(async () => {
        try {
          await ImovelService.updateImagem(imovelId, id, { titulo });
        } catch (error) {
          logger.error('[IMAGENS] Erro ao atualizar título:', error);
        }
      }, 500);
    }
    
    // Notificar que houve mudança no campo
    onFieldChange?.();
  };

  // Funções para reordenar imagens
  const callReorder = (imgs: UIImagem[]) => {
    if (!imovelId) return;
    const ids = imgs.map(i => i.id);
    if (reorderDebounceTimer.current) clearTimeout(reorderDebounceTimer.current);
    reorderDebounceTimer.current = setTimeout(async () => {
      try {
        await ImovelService.reordenarImagens(imovelId, ids);
      } catch (error) {
        logger.error('[IMAGENS] Erro ao reordenar imagens:', error);
      }
    }, 400);
  };

  const moverParaCima = (index: number) => {
    if (index === 0) return;
    
    setImagens(prev => {
      const novasImagens = [...prev];
      const temp = novasImagens[index];
      novasImagens[index] = novasImagens[index - 1];
      novasImagens[index - 1] = temp;
      callReorder(novasImagens);
      return novasImagens;
    });
    
    // Notificar que houve mudança no campo
    onFieldChange?.();
  };

  const moverParaBaixo = (index: number) => {
    if (index === imagens.length - 1) return;
    
    setImagens(prev => {
      const novasImagens = [...prev];
      const temp = novasImagens[index];
      novasImagens[index] = novasImagens[index + 1];
      novasImagens[index + 1] = temp;
      callReorder(novasImagens);
      return novasImagens;
    });
    
    // Notificar que houve mudança no campo
    onFieldChange?.();
  };

  // Funções para drag and drop
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    setImagens(prev => {
      const novasImagens = [...prev];
      const [itemRemovido] = novasImagens.splice(draggedIndex, 1);
      novasImagens.splice(index, 0, itemRemovido);
      callReorder(novasImagens);
      return novasImagens;
    });
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div>
      <h2 className="text-xl font-title font-semibold mb-4">Imagens do Imóvel</h2>
      <p className="text-neutral-gray-medium mb-6">
        Adicione imagens de qualidade para destacar o imóvel.
      </p>

      <div className="mb-8">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isUploadDragActive ? 'border-primary-orange bg-orange-50' : 'border-neutral-gray'}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={onUploadDragOver}
          onDragEnter={onUploadDragEnter}
          onDragLeave={onUploadDragLeave}
          onDrop={onUploadDrop}
          role="button"
          aria-label="Área para soltar ou selecionar imagens"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
        >
          <input
            type="file"
            id="upload-imagens"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={adicionarImagens}
          />
          <div
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload size={48} className="text-neutral-gray-medium mb-2" />
            <p className="text-lg font-medium mb-2">Clique para adicionar imagens</p>
            <p className="text-neutral-gray-medium">ou arraste e solte aqui</p>
            <Button
              className="mt-4"
              type="button"
              onMouseDown={(e) => { e.stopPropagation(); }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              Selecionar arquivos
            </Button>
          </div>
        </div>
      </div>

      {imagens.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Imagens adicionadas ({imagens.length})</h3>
          
          <div className="space-y-4">
            {imagens.map((imagem, index) => (
              <div 
                key={imagem.id}
                className={`flex items-center border rounded-lg p-3 ${
                  dragOverIndex === index ? 'border-primary-orange bg-orange-50' : 'border-neutral-gray'
                } ${imagem.principal ? 'bg-orange-50' : ''}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="w-24 h-24 bg-gray-100 rounded-md flex-shrink-0 mr-4 overflow-hidden">
                  <img 
                    src={imagem.url} 
                    alt={imagem.titulo || `Imagem ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <Input
                    label="Título da imagem"
                    placeholder="Ex: Vista da sala, Fachada, Quarto principal..."
                    value={imagem.titulo ?? ''}
                    onChange={(e) => atualizarTitulo(imagem.id, e.target.value)}
                  />
                  
                  <div className="flex items-center mt-2">
                    <button
                      type="button"
                      className={`text-sm mr-4 ${imagem.principal ? 'text-primary-orange font-medium' : 'text-neutral-gray-medium hover:text-primary-orange'}`}
                      onClick={() => definirPrincipal(imagem.id)}
                      disabled={imagem.principal}
                    >
                      {imagem.principal ? '✓ Imagem principal' : 'Definir como principal'}
                    </button>
                    
                    <div className="flex-1"></div>
                    
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="p-1 text-neutral-gray-medium hover:text-primary-orange"
                        onClick={() => moverParaCima(index)}
                        disabled={index === 0}
                      >
                        <ArrowUp size={18} />
                      </button>
                      <button
                        type="button"
                        className="p-1 text-neutral-gray-medium hover:text-primary-orange"
                        onClick={() => moverParaBaixo(index)}
                        disabled={index === imagens.length - 1}
                      >
                        <ArrowDown size={18} />
                      </button>
                      <button
                        type="button"
                        className="p-1 text-red-500 hover:text-red-700"
                        onClick={() => removerImagem(imagem.id)}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {imagens.length === 0 && (
        <div className="text-center py-8">
          <ImageIcon size={48} className="mx-auto text-neutral-gray-medium mb-2" />
          <p className="text-neutral-gray-medium">
            Nenhuma imagem adicionada ainda
          </p>
        </div>
      )}
    </div>
  );
};

export default ImagensImovel;
