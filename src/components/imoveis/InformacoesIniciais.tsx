import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RadioGroup } from '../ui/RadioGroup';
import { ImovelService } from '../../services/ImovelService';
import WizardStep from '../wizard/WizardStep';
import logger from '../../utils/logger';

interface InformacoesIniciaisProps {
  onUpdate: (data: Record<string, unknown>, hasChanges?: boolean) => void;
  submitCallback?: (callback: () => void) => void;
  initialData?: Record<string, unknown>;
}

interface InformacoesForm extends Record<string, unknown> {
  codigo_referencia: string;
  isCondominio: string;
  condominio: string;
  proprietario: string;
  tipo: string;
  subtipo: string;
  perfil: string;
  situacao: string;
  ano_construcao: string;
  incorporacao: string;
  posicaoSolar: string;
  terreno: string;
  averbado: string;
  escriturado: string;
  esquina: string;
  mobiliado: string;
}

const InformacoesIniciais: React.FC<InformacoesIniciaisProps> = ({ onUpdate, submitCallback, initialData }) => {
  // Estado para opções da API
  const [tipos, setTipos] = useState<string[]>([]);
  const [subtipos, setSubtipos] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  // Log dos dados iniciais para debug
  useEffect(() => {
    if (initialData) {
      logger.info('Dados iniciais recebidos:', initialData);
    }
  }, [initialData]);
  
  // Carregar subtipos automaticamente quando há dados iniciais com tipo
  useEffect(() => {
    if (initialData?.tipo && !subtipos.length) {
      logger.info(`Carregando subtipos automaticamente para tipo: ${initialData.tipo}`);
      loadSubtipos(initialData.tipo as string);
    }
  }, [initialData?.tipo, subtipos.length]);

  // Dados iniciais do formulário
  const initialFormData: InformacoesForm = {
    codigo_referencia: initialData?.codigo_referencia as string || '',
    isCondominio: initialData?.isCondominio as string || 'nao',
    condominio: initialData?.condominio as string || '',
    proprietario: initialData?.proprietario as string || '',
    tipo: initialData?.tipo as string || '',
    subtipo: initialData?.subtipo as string || '',
    perfil: initialData?.perfil as string || '',
    situacao: initialData?.situacao as string || '',
    ano_construcao: initialData?.ano_construcao as string || '',
    incorporacao: initialData?.incorporacao as string || '',
    posicaoSolar: initialData?.posicaoSolar as string || '',
    terreno: initialData?.terreno as string || 'plano',
    averbado: initialData?.averbado as string || 'nao',
    escriturado: initialData?.escriturado as string || 'nao',
    esquina: initialData?.esquina as string || 'nao',
    mobiliado: initialData?.mobiliado as string || 'nao',
  };

  // Lista de proprietários (simulação)
  const proprietarios = [
    { value: '', label: 'Selecione' },
    { value: 'joao', label: 'João Silva' },
    { value: 'maria', label: 'Maria Souza' },
    { value: 'carlos', label: 'Carlos Oliveira' },
  ];

  // Lista de perfis
  const perfis = [
    { value: '', label: 'Selecione' },
    { value: 'residencial', label: 'Residencial' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'residencial-comercial', label: 'Residencial/Comercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'rural', label: 'Rural' },
    { value: 'temporada', label: 'Temporada' },
  ];

  // Lista de situações
  const situacoes = [
    { value: '', label: 'Selecione' },
    { value: 'pronto', label: 'Pronto para morar' },
    { value: 'construcao', label: 'Em construção' },
    { value: 'planta', label: 'Na planta' },
    { value: 'reforma', label: 'Em reforma' },
  ];

  // Lista de posições solares
  const posicoesSolares = [
    { value: '', label: 'Selecione' },
    { value: 'leste', label: 'Leste' },
    { value: 'oeste', label: 'Oeste' },
    { value: 'norte', label: 'Norte' },
    { value: 'sul', label: 'Sul' },
    { value: 'nordeste', label: 'Nordeste' },
    { value: 'sudeste', label: 'Sudeste' },
    { value: 'sudoeste', label: 'Sudoeste' },
    { value: 'noroeste', label: 'Noroeste' },
    { value: 'sol-manha', label: 'Sol da manhã' },
    { value: 'sol-tarde', label: 'Sol da tarde' },
    { value: 'sol-manha-tarde', label: 'Sol da manhã e tarde' },
  ];

  // Ref para controlar se as opções já foram carregadas
  const optionsLoadedRef = useRef(false);

  // Carregar opções da API
  useEffect(() => {
    // Evitar chamadas duplicadas no React Strict Mode
    if (optionsLoadedRef.current) return;
    
    const loadOptions = async () => {
      // Verificação adicional para evitar chamadas simultâneas
      if (optionsLoadedRef.current) return;
      
      optionsLoadedRef.current = true;
      setLoadingOptions(true);
      
      try {
        logger.info('Carregando tipos de imóveis da API');
        const tiposResponse = await ImovelService.getTipos();
        setTipos(tiposResponse.data);
        logger.info('Tipos de imóveis carregados com sucesso');
      } catch (error) {
        logger.error('Erro ao carregar tipos:', error);
        // Reset do ref em caso de erro para permitir nova tentativa
        optionsLoadedRef.current = false;
      } finally {
        setLoadingOptions(false);
      }
    };
    
    loadOptions();
  }, []);

  // Carregar subtipos quando o tipo mudar
  const loadSubtipos = useCallback(async (tipo: string) => {
    if (!tipo) {
      setSubtipos([]);
      return;
    }
    
    try {
      logger.info(`Carregando subtipos para tipo: ${tipo}`);
      const subtiposResponse = await ImovelService.getSubtipos(tipo);
      setSubtipos(subtiposResponse.data);
      logger.info(`Subtipos carregados: ${subtiposResponse.data.join(', ')}`);
    } catch (error) {
      logger.error('Erro ao carregar subtipos:', error);
    }
  }, []);

  return (
    <WizardStep<InformacoesForm>
      id="informacoes"
      title="Informações iniciais"
      description="Defina as informações com precisão para os seus clientes."
      onUpdate={onUpdate}
      submitCallback={submitCallback}
      initialData={initialFormData}
    >
      {({ formData, handleChange }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Código de referência *"
              placeholder="Digite o código de referência"
              value={formData.codigo_referencia}
              onChange={(e) => handleChange('codigo_referencia', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Condomínio/empreendimento?
            </label>
            <div className="flex space-x-4">
              <RadioGroup
                name="isCondominio"
                options={[
                  { label: 'Sim', value: 'sim' },
                  { label: 'Não', value: 'nao' }
                ]}
                value={formData.isCondominio}
                onChange={(value) => handleChange('isCondominio', value)}
              />
            </div>
          </div>

          {formData.isCondominio === 'sim' && (
            <div>
              <Input
                label="Nome do Condomínio/empreendimento *"
                placeholder="Digite o nome do condomínio"
                value={formData.condominio}
                onChange={(e) => handleChange('condominio', e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <Select
              label="Proprietário * (privado)"
              options={proprietarios}
              value={formData.proprietario}
              onChange={(e) => handleChange('proprietario', e.target.value)}
              required
            />
          </div>

          <div>
            <Select
              label="Tipo *"
              options={[
                { value: '', label: 'Selecione' },
                ...tipos.map(tipo => ({ value: tipo, label: tipo }))
              ]}
              value={formData.tipo}
              onChange={(e) => {
                const tipoValue = e.target.value;
                handleChange('tipo', tipoValue);
                // Limpar subtipo quando tipo mudar
                handleChange('subtipo', '');
                // Carregar novos subtipos
                loadSubtipos(tipoValue);
              }}
              required
              disabled={loadingOptions}
            />
          </div>

          <div>
            <Select
              label="Subtipo *"
              options={[
                { value: '', label: 'Selecione' },
                ...subtipos.map(subtipo => ({ value: subtipo, label: subtipo }))
              ]}
              value={formData.subtipo}
              onChange={(e) => handleChange('subtipo', e.target.value)}
              required
              disabled={!formData.tipo}
            />
          </div>

          <div>
            <Select
              label="Perfil do imóvel *"
              options={perfis}
              value={formData.perfil}
              onChange={(e) => handleChange('perfil', e.target.value)}
              required
            />
          </div>

          <div>
            <Select
              label="Situação *"
              options={situacoes}
              value={formData.situacao}
              onChange={(e) => handleChange('situacao', e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              label="Ano da construção"
              placeholder="Ex.: 2015"
              type="number"
              value={formData.ano_construcao}
              onChange={(e) => handleChange('ano_construcao', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Incorporação"
              placeholder="Digite o número"
              value={formData.incorporacao}
              onChange={(e) => handleChange('incorporacao', e.target.value)}
            />
          </div>

          <div>
            <Select
              label="Posição solar"
              options={posicoesSolares}
              value={formData.posicaoSolar}
              onChange={(e) => handleChange('posicaoSolar', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Terreno
            </label>
            <div className="flex space-x-4">
              <RadioGroup
                name="terreno"
                options={[
                  { label: 'Plano', value: 'plano' },
                  { label: 'Aclive', value: 'aclive' },
                  { label: 'Declive', value: 'declive' }
                ]}
                value={formData.terreno}
                onChange={(value) => handleChange('terreno', value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Escriturado
            </label>
            <div className="flex space-x-4">
              <RadioGroup
                name="escriturado"
                options={[
                  { label: 'Sim', value: 'sim' },
                  { label: 'Não', value: 'nao' }
                ]}
                value={formData.escriturado}
                onChange={(value) => handleChange('escriturado', value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Esquina
            </label>
            <div className="flex space-x-4">
              <RadioGroup
                name="esquina"
                options={[
                  { label: 'Sim', value: 'sim' },
                  { label: 'Não', value: 'nao' }
                ]}
                value={formData.esquina}
                onChange={(value) => handleChange('esquina', value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Tem mobília
            </label>
            <div className="flex space-x-4">
              <RadioGroup
                name="mobiliado"
                options={[
                  { label: 'Sim', value: 'sim' },
                  { label: 'Não', value: 'nao' }
                ]}
                value={formData.mobiliado}
                onChange={(value) => handleChange('mobiliado', value)}
            />
            </div>
          </div>
        </div>
      )}
    </WizardStep>
  );
};

export default InformacoesIniciais;
