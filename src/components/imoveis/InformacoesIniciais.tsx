import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RadioGroup } from '../ui/RadioGroup';
import { ImovelService, InformacoesIniciais as InformacoesIniciaisInterface } from '../../services/ImovelService';
import { ClienteService, ProprietarioOption } from '../../services/ClienteService';
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
  proprietario: number | null;
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
  const [proprietarios, setProprietarios] = useState<ProprietarioOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingProprietarios, setLoadingProprietarios] = useState(true);
  
  // Estado para rastrear se o código foi editado manualmente
  const [codigoEditadoManualmente, setCodigoEditadoManualmente] = useState(false);
  
  // Estados para validação do código de referência
  const [validandoCodigo, setValidandoCodigo] = useState(false);
  const [codigoDisponivel, setCodigoDisponivel] = useState<boolean | null>(null);
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);
  
  // Estados para salvamento automático do código de referência
  const [salvandoCodigo, setSalvandoCodigo] = useState(false);
  const [codigoSalvo, setCodigoSalvo] = useState(false);
  const [erroSalvamento, setErroSalvamento] = useState<string | null>(null);
  
  // Estados para salvamento da etapa na mudança de aba
  const [salvandoEtapa, setSalvandoEtapa] = useState(false);
  const [etapaSalva, setEtapaSalva] = useState(false);
  const [erroSalvamentoEtapa, setErroSalvamentoEtapa] = useState<string | null>(null);
  
  // Ref para controlar se os logs já foram exibidos
  const logsExibidosRef = useRef(false);
  
  // Ref para controlar se os subtipos já foram carregados automaticamente
  const subtiposAutoLoadedRef = useRef(false);
  
  // Ref para controlar o timeout de validação
  const validacaoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Dados iniciais do formulário
  const initialFormData: InformacoesForm = {
    codigo_referencia: initialData?.codigo_referencia as string || '',
    isCondominio: initialData?.isCondominio as string || 'nao',
    condominio: initialData?.condominio as string || '',
    proprietario: initialData?.proprietario as number | null || null,
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



  // Lista de perfis
  const perfis = [
    { value: '', label: 'Selecione' },
    { value: 'RESIDENCIAL', label: 'Residencial' },
    { value: 'COMERCIAL', label: 'Comercial' },
    { value: 'RESIDENCIAL-COMERCIAL', label: 'Residencial/Comercial' },
    { value: 'INDUSTRIAL', label: 'Industrial' },
    { value: 'RURAL', label: 'Rural' },
    { value: 'TEMPORADA', label: 'Temporada' },
  ];

  // Lista de situações
  const situacoes = [
    { value: '', label: 'Selecione' },
    { value: 'PRONTO', label: 'Pronto para morar' },
    { value: 'CONSTRUCAO', label: 'Em construção' },
    { value: 'PLANTA', label: 'Na planta' },
    { value: 'REFORMA', label: 'Em reforma' },
  ];

  // Lista de posições solares
  const posicoesSolares = [
    { value: '', label: 'Selecione' },
    { value: 'LESTE', label: 'Leste' },
    { value: 'OESTE', label: 'Oeste' },
    { value: 'NORTE', label: 'Norte' },
    { value: 'SUL', label: 'Sul' },
    { value: 'NORDESTE', label: 'Nordeste' },
    { value: 'SUDESTE', label: 'Sudeste' },
    { value: 'SUDOESTE', label: 'Sudoeste' },
    { value: 'NOROESTE', label: 'Noroeste' },
    { value: 'SOL-MANHA', label: 'Sol da manhã' },
    { value: 'SOL-TARDE', label: 'Sol da tarde' },
    { value: 'SOL-MANHA-TARDE', label: 'Sol da manhã e tarde' },
  ];

  // Ref para controlar se as opções já foram carregadas
  const optionsLoadedRef = useRef(false);

  // Log dos dados iniciais para debug
  useEffect(() => {
    if (initialData && !logsExibidosRef.current) {
      logger.info('Dados iniciais recebidos:', initialData);
      logsExibidosRef.current = true;
    }
  }, [initialData]);

  // Carregar opções da API
  useEffect(() => {
    // Evitar chamadas duplicadas no React Strict Mode
    if (optionsLoadedRef.current) return;
    
    const loadOptions = async () => {
      // Verificação adicional para evitar chamadas simultâneas
      if (optionsLoadedRef.current) return;
      
      optionsLoadedRef.current = true;
      setLoadingOptions(true);
      setLoadingProprietarios(true);
      
      try {
        logger.info('Carregando tipos de imóveis da API');
        const tiposResponse = await ImovelService.getTipos();
        setTipos(tiposResponse.data);
        logger.info('Tipos de imóveis carregados com sucesso');
        
        logger.info('Carregando proprietários da API');
        const proprietariosResponse = await ClienteService.getProprietarios();
        setProprietarios(proprietariosResponse);
        logger.info('Proprietários carregados com sucesso');
      } catch (error) {
        logger.error('Erro ao carregar opções:', error);
        // Reset do ref em caso de erro para permitir nova tentativa
        optionsLoadedRef.current = false;
      } finally {
        setLoadingOptions(false);
        setLoadingProprietarios(false);
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

  // Função para submeter os dados quando mudar de etapa
  const submitForm = useCallback(async (formData: InformacoesForm) => {
    logger.info('🚀 [DEBUG] submitForm chamada com dados:', formData);
    logger.info('🚀 [DEBUG] imovelId:', imovelId);
    
    if (!imovelId) {
      logger.warn('❌ [DEBUG] Não é possível salvar etapa: imovelId não fornecido');
      return false;
    }

    logger.info('✅ [DEBUG] Iniciando salvamento da etapa "Informações Iniciais"');
    setSalvandoEtapa(true);
    setErroSalvamentoEtapa(null);
    setEtapaSalva(false);
    
    try {
      logger.info('🔄 [DEBUG] Preparando dados para API...');
      
      // Mapear dados do formulário para formato da API
      const dadosParaAPI: Partial<InformacoesIniciaisInterface> = {
        codigo_referencia: formData.codigo_referencia as string,
        tipo: formData.tipo as string,
        subtipo: formData.subtipo as string,
        perfil: formData.perfil as string,
        situacao: formData.situacao as string,
        ano_construcao: formData.ano_construcao ? Number(formData.ano_construcao) : null,
        proprietario_id: formData.proprietario as number | null,
        // Mapear campos adicionais do formulário para campos da API
        condominio: formData.isCondominio === 'sim' ? { nome: formData.condominio as string } : null,
        incorporacao: formData.incorporacao as string || null,
        posicaoSolar: formData.posicaoSolar as string || null,
        terreno: formData.terreno as string || null,
        averbado: formData.averbado === 'sim', // Converter string para boolean
        escriturado: formData.escriturado === 'sim', // Converter string para boolean
        esquina: formData.esquina === 'sim', // Converter string para boolean
        mobiliado: formData.mobiliado === 'sim', // Converter string para boolean
        // Campos que não existem na interface da API serão ignorados
        // mas mantemos os campos principais para compatibilidade
      };

      logger.info('📊 [DEBUG] Dados mapeados para API:', dadosParaAPI);

      // Remover campos undefined/null
      Object.keys(dadosParaAPI).forEach(key => {
        if (dadosParaAPI[key as keyof typeof dadosParaAPI] === undefined || 
            dadosParaAPI[key as keyof typeof dadosParaAPI] === null) {
          delete dadosParaAPI[key as keyof typeof dadosParaAPI];
        }
      });

      logger.info('🧹 [DEBUG] Dados limpos para API:', dadosParaAPI);
      
      // Não chamar a API diretamente aqui para evitar chamada duplicada
      // Apenas notificar o componente pai com os dados já formatados corretamente
      logger.info('📤 [DEBUG] Notificando componente pai via onUpdate com dados formatados...');
      onUpdate(dadosParaAPI, true);
      
      logger.info('🎉 [DEBUG] submitForm concluída com sucesso!');
      setEtapaSalva(true);
      
      // Reset do estado de sucesso após 3 segundos
      setTimeout(() => {
        setEtapaSalva(false);
      }, 3000);
      
      return true;
    } catch (error) {
      logger.error('❌ [DEBUG] Erro ao preparar dados para salvamento:', error);
      setErroSalvamentoEtapa('Erro ao preparar dados. Tente novamente.');
      return false;
    } finally {
      logger.info('🏁 [DEBUG] Finalizando submitForm, setSalvandoEtapa(false)');
      setSalvandoEtapa(false);
    }
  }, [imovelId, onUpdate]);

  // Ref para armazenar os dados atuais do formulário
  const formDataRef = useRef<InformacoesForm>(initialFormData);

  logger.info('🏗️ [DEBUG] Componente InformacoesIniciais renderizando');
  logger.info('🏗️ [DEBUG] Props recebidas:', { 
    hasOnUpdate: !!onUpdate, 
    hasSubmitCallback: !!submitCallback, 
    hasInitialData: !!initialData, 
    hasOnFieldChange: !!onFieldChange, 
    imovelId 
  });

  return (
    <WizardStep<InformacoesForm>
      id="informacoes"
      title="Informações iniciais"
      description="Defina as informações com precisão para os seus clientes."
      onUpdate={onUpdate}
      submitCallback={submitCallback}
      initialData={initialFormData}
    >
      {({ formData, handleChange, registerCustomSubmitCallback }) => {
        // Atualizar a ref com os dados atuais do formulário
        formDataRef.current = formData;
        
        logger.info('🔄 [DEBUG] WizardStep renderizando com formData:', formData);
        logger.info('🔄 [DEBUG] registerCustomSubmitCallback disponível?', !!registerCustomSubmitCallback);

        // Registrar o callback personalizado diretamente no WizardStep
        useEffect(() => {
          if (registerCustomSubmitCallback) {
            logger.info('📝 [DEBUG] Registrando callback personalizado via registerCustomSubmitCallback');
            
            const customCallback = async () => {
              logger.info('🎯 [DEBUG] CALLBACK PERSONALIZADO EXECUTADO! Chamando submitForm...');
              logger.info('🎯 [DEBUG] formDataRef.current:', formDataRef.current);
              const result = await submitForm(formDataRef.current);
              logger.info('🎯 [DEBUG] Resultado do submitForm:', result);
              return result;
            };
            
            registerCustomSubmitCallback(customCallback);
            logger.info('✅ [DEBUG] Callback personalizado registrado com sucesso!');
          } else {
            logger.warn('⚠️ [DEBUG] registerCustomSubmitCallback não disponível!');
          }
        }, [registerCustomSubmitCallback, submitForm]);

        // Função wrapper para handleChange que apenas chama onFieldChange (SEM salvamento automático)
        const handleFieldChangeSimple = (field: string, value: unknown) => {
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
              onChange={(e) => handleCodigoReferenciaChange(e.target.value, handleFieldChangeSimple)}
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
                onChange={(value) => handleFieldChangeSimple('isCondominio', value)}
              />
            </div>
          </div>

          {formData.isCondominio === 'sim' && (
            <div>
              <Input
                label="Nome do Condomínio/empreendimento *"
                placeholder="Digite o nome do condomínio"
                value={formData.condominio}
                onChange={(e) => handleFieldChangeSimple('condominio', e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <Select
              label="Proprietário * (privado)"
              options={proprietarios}
              value={formData.proprietario?.toString() || ''}
              onChange={(e) => handleFieldChangeSimple('proprietario', e.target.value ? Number(e.target.value) : null)}
              required
              disabled={loadingProprietarios}
            />
            {loadingProprietarios && (
              <p className="text-xs text-blue-600 mt-1 flex items-center">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Carregando proprietários...
              </p>
            )}
          </div>

          <div>
            <Select
              label="Tipo *"
              options={[
                { value: '', label: 'Selecione' },
                ...tipos.map(tipo => ({ value: tipo, label: tipo }))
              ]}
              value={formData.tipo}
              onChange={(e) => handleTipoChange(e.target.value, formData, handleFieldChangeSimple)}
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
              onChange={(e) => handleFieldChangeSimple('subtipo', e.target.value)}
              required
              disabled={!formData.tipo}
            />
          </div>

          <div>
            <Select
              label="Perfil do imóvel *"
              options={perfis}
              value={formData.perfil}
              onChange={(e) => handleFieldChangeSimple('perfil', e.target.value)}
              required
            />
          </div>

          <div>
            <Select
              label="Situação *"
              options={situacoes}
              value={formData.situacao}
              onChange={(e) => handleFieldChangeSimple('situacao', e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              label="Ano da construção"
              placeholder="Ex.: 2015"
              type="number"
              value={formData.ano_construcao}
              onChange={(e) => handleFieldChangeSimple('ano_construcao', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Incorporação"
              placeholder="Digite o número"
              value={formData.incorporacao}
              onChange={(e) => handleFieldChangeSimple('incorporacao', e.target.value)}
            />
          </div>

          <div>
            <Select
              label="Posição solar"
              options={posicoesSolares}
              value={formData.posicaoSolar}
              onChange={(e) => handleFieldChangeSimple('posicaoSolar', e.target.value)}
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
                onChange={(value) => handleFieldChangeSimple('terreno', value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Averbado
            </label>
            <div className="flex space-x-4">
              <RadioGroup
                name="averbado"
                options={[
                  { label: 'Sim', value: 'sim' },
                  { label: 'Não', value: 'nao' }
                ]}
                value={formData.averbado}
                onChange={(value) => handleFieldChangeSimple('averbado', value)}
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
                onChange={(value) => handleFieldChangeSimple('escriturado', value)}
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
                onChange={(value) => handleFieldChangeSimple('esquina', value)}
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
                onChange={(value) => handleFieldChangeSimple('mobiliado', value)}
              />
            </div>
          </div>

          {/* Indicadores de salvamento da etapa na mudança de aba */}
          {salvandoEtapa && (
            <div className="col-span-2 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-700 text-sm flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando dados na mudança de etapa...
              </p>
            </div>
          )}
          
          {etapaSalva && !salvandoEtapa && (
            <div className="col-span-2 mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700 text-sm flex items-center">
                ✓ Dados salvos com sucesso na mudança de etapa
              </p>
            </div>
          )}
          
          {erroSalvamentoEtapa && !salvandoEtapa && (
            <div className="col-span-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm flex items-center">
                ⚠ {erroSalvamentoEtapa}
              </p>
            </div>
          )}
        </div>
        );
      }}
    </WizardStep>
  );
};

export default InformacoesIniciais;
