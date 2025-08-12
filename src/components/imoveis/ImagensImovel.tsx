import React, { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ImagensImovelProps {
  onUpdate: (data: any) => void;
  onFieldChange?: () => void;
}

const ImagensImovel: React.FC<ImagensImovelProps> = ({ onUpdate, onFieldChange }) => {
  const [imagens, setImagens] = useState<Array<{
    id: string;
    url: string;
    titulo: string;
    principal: boolean;
  }>>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Atualiza os dados do formulário quando há mudanças
  // Removemos onUpdate da lista de dependências para evitar o loop infinito
  useEffect(() => {
    // Chamamos onUpdate apenas quando imagens mudar
    onUpdate({ imagens });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagens]);

  // Função para adicionar novas imagens
  const adicionarImagens = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const novasImagens = Array.from(files).map(file => {
      const id = Math.random().toString(36).substring(2, 15);
      return {
        id,
        url: URL.createObjectURL(file),
        titulo: '',
        principal: imagens.length === 0, // A primeira imagem será a principal
      };
    });

    setImagens(prev => [...prev, ...novasImagens]);
    
    // Limpa o input para permitir selecionar os mesmos arquivos novamente
    event.target.value = '';
    
    // Notificar que houve mudança no campo
    onFieldChange?.();
  };

  // Função para remover uma imagem
  const removerImagem = (id: string) => {
    setImagens(prev => {
      const novasImagens = prev.filter(img => img.id !== id);
      
      // Se removemos a imagem principal, definimos a primeira como principal (se houver)
      if (prev.find(img => img.id === id)?.principal && novasImagens.length > 0) {
        novasImagens[0].principal = true;
      }
      
      return novasImagens;
    });
    
    // Notificar que houve mudança no campo
    onFieldChange?.();
  };

  // Função para definir uma imagem como principal
  const definirPrincipal = (id: string) => {
    setImagens(prev => prev.map(img => ({
      ...img,
      principal: img.id === id
    })));
    
    // Notificar que houve mudança no campo
    onFieldChange?.();
  };

  // Função para atualizar o título da imagem
  const atualizarTitulo = (id: string, titulo: string) => {
    setImagens(prev => prev.map(img => 
      img.id === id ? { ...img, titulo } : img
    ));
    
    // Notificar que houve mudança no campo
    onFieldChange?.();
  };

  // Funções para reordenar imagens
  const moverParaCima = (index: number) => {
    if (index === 0) return;
    
    setImagens(prev => {
      const novasImagens = [...prev];
      const temp = novasImagens[index];
      novasImagens[index] = novasImagens[index - 1];
      novasImagens[index - 1] = temp;
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
        <div className="border-2 border-dashed border-neutral-gray rounded-lg p-8 text-center">
          <input
            type="file"
            id="upload-imagens"
            multiple
            accept="image/*"
            className="hidden"
            onChange={adicionarImagens}
          />
          <label 
            htmlFor="upload-imagens"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload size={48} className="text-neutral-gray-medium mb-2" />
            <p className="text-lg font-medium mb-2">Clique para adicionar imagens</p>
            <p className="text-neutral-gray-medium">ou arraste e solte aqui</p>
            <Button className="mt-4">Selecionar arquivos</Button>
          </label>
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
                    value={imagem.titulo}
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
