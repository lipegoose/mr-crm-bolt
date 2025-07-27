import React, { useState, useEffect } from 'react';
import { TextArea } from '../ui/TextArea';
import { Input } from '../ui/Input';
import { RadioGroup } from '../ui/RadioGroup';
import { Wand2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface DescricaoProps {
  onUpdate: (data: any) => void;
}

const Descricao: React.FC<DescricaoProps> = ({ onUpdate }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    palavrasChave: '',
    mostrarDescricaoSite: 'sim',
    mostrarTituloSite: 'sim',
  });

  // Atualiza os dados do formulário quando há mudanças
  // Removemos onUpdate da lista de dependências para evitar o loop infinito
  useEffect(() => {
    // Chamamos onUpdate apenas quando formData mudar
    onUpdate(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Função para atualizar os dados do formulário
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para gerar descrição automática (simulação)
  const gerarDescricaoAutomatica = () => {
    // Simulação de geração de descrição
    const descricaoGerada = "Excelente imóvel localizado em área privilegiada, com ótima infraestrutura e fácil acesso aos principais pontos da cidade. Ambiente aconchegante e bem iluminado, ideal para quem busca conforto e qualidade de vida. Não perca esta oportunidade única!";
    
    setFormData(prev => ({
      ...prev,
      descricao: descricaoGerada
    }));
  };

  // Função para gerar título automático (simulação)
  const gerarTituloAutomatico = () => {
    // Simulação de geração de título
    const tituloGerado = "Excelente Imóvel em Localização Privilegiada - Pronto para Morar";
    
    setFormData(prev => ({
      ...prev,
      titulo: tituloGerado
    }));
  };

  return (
    <div>
      <h2 className="text-xl font-title font-semibold mb-4">Descrição</h2>
      <p className="text-neutral-gray-medium mb-6">
        Defina o título e a descrição do imóvel para exibição no site.
      </p>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:space-x-3">
          <div className="flex-1 mb-3 md:mb-0">
            <Input
              label="Título do anúncio"
              placeholder="Digite um título atrativo para o anúncio"
              value={formData.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
            />
          </div>
          <div className="pb-1">
            <Button 
              variant="secondary"
              className="flex items-center"
              onClick={gerarTituloAutomatico}
            >
              <Wand2 size={16} className="mr-2" />
              Gerar título
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-black mb-1">
            Mostrar título no site?
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="mostrarTituloSite"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.mostrarTituloSite}
              onChange={(value) => handleChange('mostrarTituloSite', value)}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:space-x-3">
          <div className="flex-1 mb-3 md:mb-0">
            <TextArea
              label="Descrição do imóvel"
              placeholder="Descreva o imóvel de forma detalhada, destacando seus principais diferenciais..."
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              rows={8}
            />
          </div>
          <div className="pb-1">
            <Button 
              variant="secondary"
              className="flex items-center"
              onClick={gerarDescricaoAutomatica}
            >
              <Wand2 size={16} className="mr-2" />
              Gerar descrição
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-black mb-1">
            Mostrar descrição no site?
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="mostrarDescricaoSite"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.mostrarDescricaoSite}
              onChange={(value) => handleChange('mostrarDescricaoSite', value)}
            />
          </div>
        </div>

        <div>
          <Input
            label="Palavras-chave (SEO)"
            placeholder="Separe as palavras-chave por vírgula"
            value={formData.palavrasChave}
            onChange={(e) => handleChange('palavrasChave', e.target.value)}
          />
          <p className="text-xs text-neutral-gray-medium mt-1">
            Estas palavras-chave ajudarão seu imóvel a ser encontrado nos mecanismos de busca.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Descricao;
