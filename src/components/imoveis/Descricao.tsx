import React, { useState, useEffect, useRef } from 'react';
import { TextArea } from '../ui/TextArea';
import { Input } from '../ui/Input';
import { RadioGroup } from '../ui/RadioGroup';
import { Wand2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ImovelService } from '../../services/ImovelService';
import logger from '../../utils/logger';

interface DescricaoProps {
  onUpdate: (data: any) => void;
  onFieldChange?: () => void;
  imovelId?: number;
  initialData?: Record<string, unknown>;
}

const Descricao: React.FC<DescricaoProps> = ({ onUpdate, onFieldChange, imovelId, initialData }) => {
  // Processamento dos dados iniciais
  const initialTitulo = initialData?.titulo_anuncio as string || '';
  const initialDescricao = initialData?.descricao as string || '';
  const initialPalavrasChave = initialData?.palavras_chave as string || '';
  const initialMostrarDescricaoSite = initialData?.mostrar_descricao === false ? 'nao' : 'sim';
  const initialMostrarTituloSite = initialData?.mostrar_titulo === false ? 'nao' : 'sim';
  
  const [formData, setFormData] = useState({
    titulo: initialTitulo,
    descricao: initialDescricao,
    palavrasChave: initialPalavrasChave,
    mostrarDescricaoSite: initialMostrarDescricaoSite,
    mostrarTituloSite: initialMostrarTituloSite,
  });
  
  // Referência para controlar o timeout de salvamento por campo
  const savingTimeoutsRef = useRef<Record<string, NodeJS.Timeout | number>>({});

  // Atualiza os dados do formulário quando há mudanças
  // Removemos onUpdate da lista de dependências para evitar o loop infinito
  useEffect(() => {
    // Chamamos onUpdate apenas quando formData mudar
    onUpdate(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Função para atualizar os dados do formulário e salvar na API
  const handleChange = (field: string, value: string) => {
    // Calcular os novos dados antes de atualizar o estado
    const newFormData = {
      ...formData,
      [field]: value
    };
    
    // Atualizar o estado com os novos dados
    setFormData(newFormData);
    
    // Notificar que houve mudança no campo
    setTimeout(() => {
      onFieldChange?.();
    }, 0);
    
    // Salvar na API se houver um ID de imóvel
    if (imovelId) {
      // Cancelar qualquer timeout de salvamento pendente para este campo
      if (savingTimeoutsRef.current[field]) clearTimeout(savingTimeoutsRef.current[field] as number);
      
      // Configurar um novo timeout para salvar após um breve atraso
      savingTimeoutsRef.current[field] = setTimeout(async () => {
        try {
          logger.debug(`[DESCRICAO] Salvando alterações no campo ${field}: ${value}`);
          
          // Preparar os dados para envio à API - apenas o campo alterado
          const apiData: Record<string, unknown> = {};
          
          // Mapear o nome do campo do formulário para o nome do campo na API
          switch (field) {
            case 'titulo':
              apiData.titulo_anuncio = value;
              break;
            case 'descricao':
              apiData.descricao = value;
              break;
            case 'palavrasChave':
              apiData.palavras_chave = value;
              break;
            case 'mostrarDescricaoSite':
              apiData.mostrar_descricao = value === 'sim';
              break;
            case 'mostrarTituloSite':
              apiData.mostrar_titulo = value === 'sim';
              break;
            default:
              return;
          }
          
          // Enviar apenas o campo alterado para a API
          await ImovelService.updateEtapaDescricao(imovelId, apiData);
          logger.info(`[DESCRICAO] Campo ${field} atualizado com sucesso.`);
        } catch (error) {
          logger.error(`[DESCRICAO] Erro ao atualizar campo ${field}:`, error);
        }
      }, 300);
    }
  };

  // Função para gerar descrição automática (simulação)
  const gerarDescricaoAutomatica = async () => {
    // Simulação de geração de descrição
    const descricaoGerada = "Excelente imóvel localizado em área privilegiada, com ótima infraestrutura e fácil acesso aos principais pontos da cidade. Ambiente aconchegante e bem iluminado, ideal para quem busca conforto e qualidade de vida. Não perca esta oportunidade única!";
    
    // Atualizar o estado local com a descrição gerada
    setFormData(prev => ({
      ...prev,
      descricao: descricaoGerada
    }));
    
    // Notificar que houve mudança no campo
    onFieldChange?.();
    
    // Salvar na API se houver um ID de imóvel
    if (imovelId) {
      try {
        const apiData = {
          descricao: descricaoGerada,
          gerar_descricao_automatica: true
        };
        
        await ImovelService.updateEtapaDescricao(imovelId, apiData);
        logger.info(`[DESCRICAO] Descrição gerada automaticamente com sucesso.`);
      } catch (error) {
        logger.error(`[DESCRICAO] Erro ao gerar descrição automaticamente:`, error);
      }
    }
  };

  // Função para gerar título automático (simulação)
  const gerarTituloAutomatico = async () => {
    // Simulação de geração de título
    const tituloGerado = "Excelente Imóvel em Localização Privilegiada - Pronto para Morar";
    
    // Atualizar o estado local com o título gerado
    setFormData(prev => ({
      ...prev,
      titulo: tituloGerado
    }));
    
    // Notificar que houve mudança no campo
    onFieldChange?.();
    
    // Salvar na API se houver um ID de imóvel
    if (imovelId) {
      try {
        const apiData = {
          titulo_anuncio: tituloGerado,
          gerar_titulo_automatico: true
        };
        
        await ImovelService.updateEtapaDescricao(imovelId, apiData);
        logger.info(`[DESCRICAO] Título gerado automaticamente com sucesso.`);
      } catch (error) {
        logger.error(`[DESCRICAO] Erro ao gerar título automaticamente:`, error);
      }
    }
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
          <label className="block text-sm font-semibold mb-1">
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
          <label className="block text-sm font-semibold mb-1">
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
