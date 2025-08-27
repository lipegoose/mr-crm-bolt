import React, { useEffect, useRef, useState } from 'react';
import { Upload, X, ArrowUp, ArrowDown, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SectionsService, SectionPhoto } from '../../services/SectionsService';
import logger from '../../utils/logger';

interface Props {
  sectionId: number;
}

type UIImagem = { id: number; url: string; titulo: string | null; principal: boolean };

const SectionImagens: React.FC<Props> = ({ sectionId }) => {
  const [imagens, setImagens] = useState<UIImagem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isUploadDragActive, setIsUploadDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const tituloDebounceTimers = useRef<Record<number, any>>({});
  const reorderDebounceTimer = useRef<any>(null);

  // Atenção: evitar gate de 1a execução para não conflitar com StrictMode (montagem dupla em dev)

  const deriveTitleFromPath = (path?: string | null): string | null => {
    if (!path) return null;
    const seg = String(path).split('/').pop() || '';
    if (!seg) return null;
    const base = seg.replace(/\.[^.]+$/, '');
    return base || null;
  };
  
  // Logar mudanças do estado de imagens para diagnosticar renderização
  useEffect(() => {
    logger.info('[SECTION_IMAGENS] imagens state changed', { count: imagens.length, imagens });
  }, [imagens]);

  const toUIImagem = (p: SectionPhoto): UIImagem => {
    const direct = (p as any).url || (p as any).url_completa;
    const caminho = (p as any).caminho as string | undefined;
    const url = direct ? String(direct) : (caminho ? `/${caminho.replace(/^\//, '')}` : '');
    logger.debug('[SECTION_IMAGENS] toUIImagem ->', { id: p.id, direct: !!direct, caminho, url });
    return {
      id: p.id,
      url,
      titulo: (p as any).titulo ?? deriveTitleFromPath(caminho),
      principal: !!p.principal,
    };
  };
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const list = await SectionsService.listPhotos(sectionId);
        logger.info('[SECTION_IMAGENS] listPhotos resp', { sectionId, count: Array.isArray(list) ? list.length : null, list });
        const mapped: UIImagem[] = (list || []).map((p: SectionPhoto) => toUIImagem(p));
        logger.info('[SECTION_IMAGENS] mapped imagens', { count: mapped.length, mapped });
        if (mounted) setImagens(mapped);
        if (mounted) {
          logger.info('[SECTION_IMAGENS] setImagens done', { count: mapped.length });
        }
      } catch (e) {
        logger.error('[SECTION_IMAGENS] Erro ao listar fotos:' + (e instanceof Error ? ` ${e.message}` : ''));
      }
    };
    load();
    return () => { mounted = false; };
  }, [sectionId]);

  const processFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files as any as File[]);
    try {
      const resp = await SectionsService.uploadPhotos(sectionId, arr);
      const uploaded = resp.uploaded || [];
      logger.info('[SECTION_IMAGENS] uploadPhotos resp', { sectionId, uploaded });
      // Atualiza títulos com base no nome dos arquivos se backend não definiu
      const updates: Promise<any>[] = [];
      const uiNew = uploaded.map((img, idx) => {
        let ui = toUIImagem(img);
        if ((!img.titulo || img.titulo === null) && arr[idx]) {
          const fileName = arr[idx].name;
          const base = fileName.replace(/\.[^.]+$/, '');
          ui = { ...ui, titulo: base };
          updates.push(SectionsService.updatePhoto(sectionId, img.id, { titulo: base } as any));
        }
        return ui;
      });
      if (updates.length) {
        try { await Promise.allSettled(updates); } catch {}
      }
      setImagens(prev => ([...prev, ...uiNew]));
      logger.info('[SECTION_IMAGENS] setImagens after upload');
    } catch (e) {
      logger.error('[SECTION_IMAGENS] Erro no upload:' + (e instanceof Error ? ` ${e.message}` : ''));
    }
  };


  const adicionarImagens = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    await processFiles(files);
    event.target.value = '';
  };

  const onUploadDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const onUploadDragEnter = (e: React.DragEvent) => { e.preventDefault(); setIsUploadDragActive(true); };
  const onUploadDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsUploadDragActive(false); };
  const onUploadDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setIsUploadDragActive(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const removerImagem = async (id: number) => {
    setImagens(prev => {
      const novas = prev.filter(i => i.id !== id);
      if (prev.find(i => i.id === id)?.principal && novas.length > 0) {
        novas[0].principal = true;
      }
      return novas;
    });
    try { await SectionsService.deletePhoto(sectionId, id); } catch (e) { logger.error('[SECTION_IMAGENS] deletePhoto:' + (e instanceof Error ? ` ${e.message}` : '')); }
  };

  const definirPrincipal = async (id: number) => {
    setImagens(prev => prev.map(i => ({ ...i, principal: i.id === id })));
    try { await SectionsService.updatePhoto(sectionId, id, { principal: true }); } catch (e) { logger.error('[SECTION_IMAGENS] update principal:' + (e instanceof Error ? ` ${e.message}` : '')); }
  };

  const atualizarTitulo = (id: number, titulo: string) => {
    setImagens(prev => prev.map(i => (i.id === id ? { ...i, titulo } : i)));
    if (tituloDebounceTimers.current[id]) clearTimeout(tituloDebounceTimers.current[id]);
    tituloDebounceTimers.current[id] = setTimeout(async () => {
      try { await SectionsService.updatePhoto(sectionId, id, { titulo }); } catch (e) { logger.error('[SECTION_IMAGENS] update titulo:' + (e instanceof Error ? ` ${e.message}` : '')); }
    }, 500);
  };

  const callReorder = (imgs: UIImagem[]) => {
    if (reorderDebounceTimer.current) clearTimeout(reorderDebounceTimer.current);
    reorderDebounceTimer.current = setTimeout(async () => {
      try {
        // Persistir ordem individualmente
        for (let index = 0; index < imgs.length; index++) {
          const photo = imgs[index];
          await SectionsService.updatePhoto(sectionId, photo.id, { ordem: index });
        }
      } catch (e) {
        logger.error('[SECTION_IMAGENS] Erro ao reordenar:' + (e instanceof Error ? ` ${e.message}` : ''));
      }
    }, 400);
  };

  const moverParaCima = (index: number) => {
    if (index === 0) return;
    setImagens(prev => {
      const arr = [...prev];
      const t = arr[index];
      arr[index] = arr[index - 1];
      arr[index - 1] = t;
      callReorder(arr);
      return arr;
    });
  };

  const moverParaBaixo = (index: number) => {
    if (index === imagens.length - 1) return;
    setImagens(prev => {
      const arr = [...prev];
      const t = arr[index];
      arr[index] = arr[index + 1];
      arr[index + 1] = t;
      callReorder(arr);
      return arr;
    });
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); setDragOverIndex(index); };
  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    setImagens(prev => {
      const arr = [...prev];
      const [item] = arr.splice(draggedIndex, 1);
      arr.splice(index, 0, item);
      callReorder(arr);
      return arr;
    });
    setDraggedIndex(null); setDragOverIndex(null);
  };
  const handleDragEnd = () => { setDraggedIndex(null); setDragOverIndex(null); };

  return (
    <div>
      <h2 className="text-xl font-title font-semibold mb-4">Imagens da Seção</h2>
      <p className="text-neutral-gray-medium mb-6">Adicione imagens para ilustrar a seção.</p>

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
          <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={adicionarImagens} />
          <div className="cursor-pointer flex flex-col items-center">
            <Upload size={48} className="text-neutral-gray-medium mb-2" />
            <p className="text-lg font-medium mb-2">Clique para adicionar imagens</p>
            <p className="text-neutral-gray-medium">ou arraste e solte aqui</p>
            <Button className="mt-4" type="button" onMouseDown={(e) => { e.stopPropagation(); }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileInputRef.current?.click(); }}>Selecionar arquivos</Button>
          </div>
        </div>
      </div>

      {imagens.length > 0 && (
        <div className="space-y-4">
          {imagens.map((imagem, index) => (
            <div
              key={imagem.id}
              className={`flex items-center border rounded-lg p-3 ${dragOverIndex === index ? 'border-primary-orange bg-orange-50' : 'border-neutral-gray'} ${imagem.principal ? 'bg-orange-50' : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="w-24 h-24 bg-gray-100 rounded-md flex-shrink-0 mr-4 overflow-hidden">
                <img src={imagem.url} alt={imagem.titulo || `Imagem ${index + 1}`} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <Input label="Título da imagem" placeholder="Ex: Banner, Fundo, Ilustração..." value={imagem.titulo ?? ''} onChange={(e) => atualizarTitulo(imagem.id, e.target.value)} />
                <div className="flex items-center mt-2">
                  <button type="button" className={`text-sm mr-4 ${imagem.principal ? 'text-primary-orange font-medium' : 'text-neutral-gray-medium hover:text-primary-orange'}`} onClick={() => definirPrincipal(imagem.id)} disabled={imagem.principal}>
                    {imagem.principal ? '✓ Imagem principal' : 'Definir como principal'}
                  </button>
                  <div className="flex-1" />
                  <div className="flex space-x-2">
                    <button type="button" className="p-1 text-neutral-gray-medium hover:text-primary-orange" onClick={() => moverParaCima(index)} disabled={index === 0}><ArrowUp size={18} /></button>
                    <button type="button" className="p-1 text-neutral-gray-medium hover:text-primary-orange" onClick={() => moverParaBaixo(index)} disabled={index === imagens.length - 1}><ArrowDown size={18} /></button>
                    <button type="button" className="p-1 text-red-500 hover:text-red-700" onClick={() => removerImagem(imagem.id)}><X size={18} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {imagens.length === 0 && (
        <div className="text-center py-8">
          <ImageIcon size={48} className="mx-auto text-neutral-gray-medium mb-2" />
          <p className="text-neutral-gray-medium">Nenhuma imagem adicionada ainda</p>
        </div>
      )}
    </div>
  );
};

export default SectionImagens;
