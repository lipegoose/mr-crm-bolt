import React, { useState, useEffect } from 'react';
import { TextArea } from '../ui/TextArea';
import { Input } from '../ui/Input';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface ComplementosProps {
  onUpdate: (data: any) => void;
}

const Complementos: React.FC<ComplementosProps> = ({ onUpdate }) => {
  const [formData, setFormData] = useState({
    observacoes: '',
    videos: [] as { titulo: string; url: string }[],
    tourVirtual: '',
    plantas: [] as { titulo: string; url: string }[],
  });

  const [novoVideo, setNovoVideo] = useState({ titulo: '', url: '' });
  const [novaPlanta, setNovaPlanta] = useState({ titulo: '', url: '' });

  // Atualiza os dados do formulário quando há mudanças
  // Removemos onUpdate da lista de dependências para evitar o loop infinito
  useEffect(() => {
    // Chamamos onUpdate apenas quando formData mudar
    onUpdate(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Função para adicionar um novo vídeo
  const adicionarVideo = () => {
    if (novoVideo.titulo && novoVideo.url) {
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, novoVideo]
      }));
      setNovoVideo({ titulo: '', url: '' });
    }
  };

  // Função para remover um vídeo
  const removerVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  // Função para adicionar uma nova planta
  const adicionarPlanta = () => {
    if (novaPlanta.titulo && novaPlanta.url) {
      setFormData(prev => ({
        ...prev,
        plantas: [...prev.plantas, novaPlanta]
      }));
      setNovaPlanta({ titulo: '', url: '' });
    }
  };

  // Função para remover uma planta
  const removerPlanta = (index: number) => {
    setFormData(prev => ({
      ...prev,
      plantas: prev.plantas.filter((_, i) => i !== index)
    }));
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
            onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
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
                onChange={(e) => setNovoVideo(prev => ({ ...prev, titulo: e.target.value }))}
              />
              <Input
                label="URL do vídeo (YouTube, Vimeo, etc.)"
                placeholder="https://..."
                value={novoVideo.url}
                onChange={(e) => setNovoVideo(prev => ({ ...prev, url: e.target.value }))}
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
            onChange={(e) => setFormData(prev => ({ ...prev, tourVirtual: e.target.value }))}
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
                onChange={(e) => setNovaPlanta(prev => ({ ...prev, titulo: e.target.value }))}
              />
              <Input
                label="URL da imagem da planta"
                placeholder="https://..."
                value={novaPlanta.url}
                onChange={(e) => setNovaPlanta(prev => ({ ...prev, url: e.target.value }))}
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
