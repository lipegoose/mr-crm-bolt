import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RadioGroup } from '../ui/RadioGroup';
import { ImovelService } from '../../services/ImovelService';
import WizardStep from '../wizard/WizardStep';
import logger from '../../utils/logger';
import { Loader2 } from 'lucide-react';

interface InformacoesIniciaisProps {
  onUpdate: (data: Record<string, unknown>, hasChanges?: boolean) => void;
  submitCallback?: (callback: () => void) => void;
  initialData?: Record<string, unknown>;
  onFieldChange?: () => void;
  imovelId?: number; // ID do imóvel para validação do código de referência
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

const InformacoesIniciais: React.FC<InformacoesIniciaisProps> = ({ onUpdate, submitCallback, initialData, onFieldChange, imovelId }) => {
  // Estado para opções da API
  const [tipos, setTipos] = useState<string[]>([]);
  const [subtipos, setSubtipos] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  // Estado para rastrear se o código foi editado manualmente
  const [codigoEditadoManualmente, setCodigoEditadoManualmente] = useState(false);
  
  // Estados para validação do código de referência
  const [validandoCodigo, setValidandoCodigo] = useState(false);
  const [codigoDisponivel, setCodigoDisponivel] = useState<boolean | null>(null);
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);
  
  // Estados para salvamento automático
  const [salvandoCodigo, setSalvandoCodigo] = useState(false);
  const [codigoSalvo, setCodigoSalvo] = useState(false);
  const [erroSalvamento, setErroSalvamento] = useState<string | null>(null);
  
  // Ref para controlar se os logs já foram exibidos
  const logsExibidosRef = useRef(false);
  
  // Log dos dados iniciais para debug
  useEffect(() => {
    if (initialData && !logsExibidosRef.current) {
      logger.info('Dados iniciais recebidos:', initialData);
      logsExibidosRef.current = true;
    }
  }, [initialData]);
  
    // Ref para controlar se os subtipos já foram carregados automaticamente
  const subtiposAutoLoadedRef = useRef(false);
  
  // Ref para controlar o timeout de validação
  const validacaoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Carregar subtipos automaticamente quando há dados iniciais com tipo
  useEffect(() => {
    if (initialData?.tipo && !subtipos.length && !subtiposAutoLoadedRef.current) {
      logger.info(`Carregando subtipos automaticamente para tipo: ${initialData.tipo}`);
      subtiposAutoLoadedRef.current = true;
      loadSubtipos(initialData.tipo as string);
    }
  }, [initialData?.tipo, subtipos.length, loadSubtipos]);

  // Cleanup do timeout de validação quando componente for desmontado
  useEffect(() => {
    return () => {
      if (validacaoTimeoutRef.current) {
        clearTimeout(validacaoTimeoutRef.current);
      }
    };
  }, []);

  // Função para gerar sigla do tipo de imóvel
  const gerarSiglaTipo = useCallback((tipo: string): string => {
    const siglas: Record<string, string> = {
      'Apartamento': 'AP',
      'Casa': 'CA',
      'Cobertura': 'CO',
      'Flat': 'FL',
      'Kitnet': 'KI',
      'Loft': 'LO',
      'Sobrado': 'SO',
      'Studio': 'ST',
      'Terreno': 'TE',
      'Sala Comercial': 'SC',
      'Loja': 'LJ',
      'Galpão': 'GA',
      'Sítio': 'SI',
      'Chácara': 'CH',
      'Fazenda': 'FA',
      'Casa de Temporada': 'CT',
      'Pousada': 'PO',
      'Hotel': 'HO'
    };
    
    return siglas[tipo] || tipo.substring(0, 2).toUpperCase();
  }, []);

  // Função para validar código de referência
  const validarCodigoReferencia = useCallback(async (codigo: string): Promise<boolean> => {
    if (!codigo || !imovelId) {
      return true; // Não validar se não há código ou imovelId
    }

    setValidandoCodigo(true);
    setErroValidacao(null);
    
    try {
      logger.info(`Validando código de referência: ${codigo} para imóvel ID: ${imovelId}`);
      const validacao = await ImovelService.validarCodigoReferencia(codigo, imovelId);
      
      const disponivel = validacao.disponivel;
      setCodigoDisponivel(disponivel);
      
      if (disponivel) {
        logger.info(`Código de referência ${codigo} está disponível`);
      } else {
        logger.warn(`Código de referência ${codigo} já está em uso por outro imóvel`);
        setErroValidacao('Este código de referência já está em uso por outro imóvel');
      }
      
      return disponivel;
    } catch (error) {
      logger.error('Erro ao validar código de referência:', error);
      setErroValidacao('Erro ao validar código de referência. Tente novamente.');
      setCodigoDisponivel(null);
      return false;
    } finally {
      setValidandoCodigo(false);
    }
  }, [imovelId]);

  // Função para salvar código de referência automaticamente
  const salvarCodigoReferencia = useCallback(async (codigo: string, editadoManualmente: boolean): Promise<boolean> => {
    if (!codigo || !imovelId) {
      return false;
    }

    setSalvandoCodigo(true);
    setErroSalvamento(null);
    setCodigoSalvo(false);
    
    try {
      logger.info(`Salvando código de referência: ${codigo} (editado_manualmente: ${editadoManualmente}) para imóvel ID: ${imovelId}`);
      
      await ImovelService.updateCodigoReferencia(imovelId, codigo, editadoManualmente);
      
      // A API retorna sucesso diretamente, sem propriedade 'success'
      // Se chegou aqui sem erro, significa que foi bem-sucedido
      logger.info('Código de referência salvo com sucesso');
      setCodigoSalvo(true);
      
      // Reset do estado de sucesso após 3 segundos
      setTimeout(() => {
        setCodigoSalvo(false);
      }, 3000);
      
      return true;
    } catch (error) {
      logger.error('Erro ao salvar código de referência:', error);
      setErroSalvamento('Erro ao salvar código de referência. Tente novamente.');
      return false;
    } finally {
      setSalvandoCodigo(false);
    }
  }, [imovelId]);

  // Função para atualizar código de referência automaticamente
  const atualizarCodigoReferencia = useCallback(async (tipo: string, codigoAtual: string) => {
    if (!tipo || codigoEditadoManualmente) {
      return;
    }

    try {
      // Extrair ID do código atual (formato: "ID-SIGLA")
      const partes = codigoAtual.split('-');
      if (partes.length !== 2) {
        logger.warn('Formato de código de referência inválido, não será atualizado automaticamente');
        return;
      }

      const id = partes[0];
      const novaSigla = gerarSiglaTipo(tipo);
      const novoCodigo = `${id}-${novaSigla}`;

      // Verificar se o novo código está disponível
      const validacao = await ImovelService.validarCodigoReferencia(novoCodigo, imovelId);
      
      if (validacao.disponivel) {
        logger.info(`Código de referência atualizado automaticamente: ${codigoAtual} → ${novoCodigo}`);
        
        // Salvar automaticamente o novo código (editado_manualmente: false)
        const salvou = await salvarCodigoReferencia(novoCodigo, false);
        if (salvou) {
          return novoCodigo;
        }
      } else if (validacao.sugestao) {
        logger.info(`Usando sugestão da API para código: ${validacao.sugestao}`);
        
        // Salvar automaticamente a sugestão da API (editado_manualmente: false)
        const salvou = await salvarCodigoReferencia(validacao.sugestao, false);
        if (salvou) {
          return validacao.sugestao;
        }
      } else {
        logger.warn('Não foi possível gerar um código de referência válido automaticamente');
        return codigoAtual;
      }
    } catch (error) {
      logger.error('Erro ao atualizar código de referência automaticamente:', error);
      return codigoAtual;
    }
  }, [codigoEditadoManualmente, gerarSiglaTipo, imovelId, salvarCodigoReferencia]);

  // Handler para mudança do tipo de imóvel
  const handleTipoChange = useCallback(async (tipoValue: string, formData: InformacoesForm, handleChange: (field: string, value: unknown) => void) => {
    // Atualizar tipo
    handleChange('tipo', tipoValue);
    
    // Limpar subtipo quando tipo mudar
    handleChange('subtipo', '');
    
    // Carregar novos subtipos
    loadSubtipos(tipoValue);
    
    // Atualizar código de referência automaticamente se não foi editado manualmente
    if (tipoValue && formData.codigo_referencia && !codigoEditadoManualmente) {
      const novoCodigo = await atualizarCodigoReferencia(tipoValue, formData.codigo_referencia as string);
      if (novoCodigo && novoCodigo !== formData.codigo_referencia) {
        handleChange('codigo_referencia', novoCodigo);
        logger.info('Código de referência atualizado automaticamente após mudança de tipo');
      }
    }
  }, [loadSubtipos, atualizarCodigoReferencia, codigoEditadoManualmente]);

  // Handler para mudança do código de referência
  const handleCodigoReferenciaChange = useCallback((value: string, handleChange: (field: string, value: unknown) => void) => {
    handleChange('codigo_referencia', value);
    
    // Marcar como editado manualmente se o usuário alterar o código
    if (!codigoEditadoManualmente) {
      setCodigoEditadoManualmente(true);
      logger.info('Código de referência marcado como editado manualmente pelo usuário');
    }
    
    // Limpar estados de validação e salvamento anteriores
    setCodigoDisponivel(null);
    setErroValidacao(null);
    setCodigoSalvo(false);
    setErroSalvamento(null);
    
    // Limpar timeout anterior se existir
    if (validacaoTimeoutRef.current) {
      clearTimeout(validacaoTimeoutRef.current);
    }
    
    // Validar código se houver valor e imovelId
    if (value && imovelId) {
      // Debounce para evitar muitas chamadas à API
      validacaoTimeoutRef.current = setTimeout(async () => {
        const disponivel = await validarCodigoReferencia(value);
        
        // Se o código estiver disponível, salvar automaticamente (editado_manualmente: true)
        if (disponivel) {
          await salvarCodigoReferencia(value, true);
        }
      }, 500);
    }
  }, [codigoEditadoManualmente, imovelId, validarCodigoReferencia, salvarCodigoReferencia]);

  return (
    <WizardStep<InformacoesForm>
      id="informacoes"
      title="Informações iniciais"
      description="Defina as informações com precisão para os seus clientes."
      onUpdate={onUpdate}
      submitCallback={submitCallback}
      initialData={initialFormData}
    >
      {({ formData, handleChange }) => {
        // Função wrapper para handleChange que também chama onFieldChange
        const handleFieldChange = (field: string, value: unknown) => {
          handleChange(field, value);
          onFieldChange?.();
        };

        return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Código de referência *"
              placeholder="Digite o código de referência"
              value={formData.codigo_referencia}
              onChange={(e) => handleCodigoReferenciaChange(e.target.value, handleFieldChange)}
              required
            />
            
            {/* Indicadores de validação */}
            {validandoCodigo && (
              <p className="text-xs text-blue-600 mt-1 flex items-center">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Validando código...
              </p>
            )}
            
            {codigoDisponivel === true && !validandoCodigo && (
              <p className="text-xs text-green-600 mt-1 flex items-center">
                ✓ Código disponível
              </p>
            )}
            
            {codigoDisponivel === false && !validandoCodigo && (
              <p className="text-xs text-red-600 mt-1 flex items-center">
                ✗ Código já está em uso
              </p>
            )}
            
            {erroValidacao && !validandoCodigo && (
              <p className="text-xs text-red-600 mt-1">
                ⚠ {erroValidacao}
              </p>
            )}
            
            {/* Indicadores de salvamento */}
            {salvandoCodigo && (
              <p className="text-xs text-blue-600 mt-1 flex items-center">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Salvando código...
              </p>
            )}
            
            {codigoSalvo && !salvandoCodigo && (
              <p className="text-xs text-green-600 mt-1 flex items-center">
                ✓ Código salvo com sucesso
              </p>
            )}
            
            {erroSalvamento && !salvandoCodigo && (
              <p className="text-xs text-red-600 mt-1">
                ⚠ {erroSalvamento}
              </p>
            )}
            
            {/* Indicadores de comportamento automático */}
            {!codigoEditadoManualmente && formData.tipo && !validandoCodigo && codigoDisponivel !== false && (
              <p className="text-xs text-blue-600 mt-1">
                ⓘ O código será atualizado automaticamente quando o tipo for alterado
              </p>
            )}
            
            {codigoEditadoManualmente && !validandoCodigo && codigoDisponivel !== false && (
              <p className="text-xs text-orange-600 mt-1">
                ⚠ O código foi editado manualmente e não será alterado automaticamente
              </p>
            )}
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
              onChange={(value) => handleFieldChange('isCondominio', value)}
            />
            </div>
          </div>

          {formData.isCondominio === 'sim' && (
            <div>
              <Input
                label="Nome do Condomínio/empreendimento *"
                placeholder="Digite o nome do condomínio"
                value={formData.condominio}
                onChange={(e) => handleFieldChange('condominio', e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <Select
              label="Proprietário * (privado)"
              options={proprietarios}
              value={formData.proprietario}
              onChange={(e) => handleFieldChange('proprietario', e.target.value)}
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
              onChange={(e) => handleTipoChange(e.target.value, formData, handleFieldChange)}
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
              onChange={(e) => handleFieldChange('subtipo', e.target.value)}
              required
              disabled={!formData.tipo}
            />
          </div>

          <div>
            <Select
              label="Perfil do imóvel *"
              options={perfis}
              value={formData.perfil}
              onChange={(e) => handleFieldChange('perfil', e.target.value)}
              required
            />
          </div>

          <div>
            <Select
              label="Situação *"
              options={situacoes}
              value={formData.situacao}
              onChange={(e) => handleFieldChange('situacao', e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              label="Ano da construção"
              placeholder="Ex.: 2015"
              type="number"
              value={formData.ano_construcao}
              onChange={(e) => handleFieldChange('ano_construcao', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Incorporação"
              placeholder="Digite o número"
              value={formData.incorporacao}
              onChange={(e) => handleFieldChange('incorporacao', e.target.value)}
            />
          </div>

          <div>
            <Select
              label="Posição solar"
              options={posicoesSolares}
              value={formData.posicaoSolar}
              onChange={(e) => handleFieldChange('posicaoSolar', e.target.value)}
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
                onChange={(value) => handleFieldChange('terreno', value)}
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
                onChange={(value) => handleFieldChange('escriturado', value)}
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
                onChange={(value) => handleFieldChange('esquina', value)}
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
                onChange={(value) => handleFieldChange('mobiliado', value)}
              />
            </div>
          </div>
        </div>
        );
      }}
    </WizardStep>
  );
};

export default InformacoesIniciais;
