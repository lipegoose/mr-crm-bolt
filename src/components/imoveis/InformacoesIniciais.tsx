import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RadioGroup } from '../ui/RadioGroup';
import { ImovelService, InformacoesIniciais as InformacoesIniciaisInterface } from '../../services/ImovelService';
import { ClienteService, ProprietarioOption } from '../../services/ClienteService';
import api from '../../services/api';
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

// Formato dos dados de condomínio da API:
// { id: number; nome: string; }
// 
// Formato esperado pelo componente Select:
// { value: string; label: string; }

// Interface para as opções de condomínio no componente
type CondominioOption = {
  value: string;
  label: string;
}

interface InformacoesForm extends Record<string, unknown> {
  codigo_referencia: string;
  isCondominio: string;
  condominio: number | null; // Alterado para number (ID do condomínio)
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
  const [condominios, setCondominios] = useState<CondominioOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingProprietarios, setLoadingProprietarios] = useState(true);
  const [loadingCondominios, setLoadingCondominios] = useState(true);
  
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
  
  // Removido ref de controle de logs
  
  // Ref para controlar se os subtipos já foram carregados automaticamente
  const subtiposAutoLoadedRef = useRef(false);
  
  // Ref para controlar o timeout de validação
  const validacaoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Dados iniciais do formulário
  const initialFormData: InformacoesForm = {
    codigo_referencia: initialData?.codigo_referencia as string || '',
    // Verificar se o imóvel está em condomínio baseado no campo condominio_id ou condominio
    isCondominio: initialData?.condominio_id || initialData?.condominio ? 'sim' : 'nao',
    // Usar o ID do condomínio se existir, garantindo que seja um número válido
    condominio: (() => {
      const id = initialData?.condominio_id;
      
      // Se não houver ID ou for 0, retornar null
      if (!id || id === 0) return null;
      
      // Converter para número e verificar se é válido
      const numericId = typeof id === 'number' ? id : Number(id);
      return isNaN(numericId) || numericId <= 0 ? null : numericId;
    })(),
    // Mapear o proprietario_id para o campo proprietario
    proprietario: initialData?.proprietario_id as number | null || null,
    tipo: initialData?.tipo as string || '',
    subtipo: initialData?.subtipo as string || '',
    perfil: initialData?.perfil as string || '',
    situacao: initialData?.situacao as string || '',
    // Converter ano_construcao de number para string
    ano_construcao: initialData?.ano_construcao ? String(initialData.ano_construcao) : '',
    incorporacao: initialData?.incorporacao as string || '',
    // Mapear posicao_solar (snake_case da API) para posicaoSolar (camelCase do formulário)
    posicaoSolar: initialData?.posicao_solar as string || '',
    // Mapear o campo terreno (converter para minúsculas pois a API retorna em maiúsculas)
    terreno: initialData?.terreno ? (initialData.terreno as string).toLowerCase() : 'plano',
    // Converter valores booleanos para strings 'sim'/'nao'
    averbado: initialData?.averbado === true ? 'sim' : 'nao',
    escriturado: initialData?.escriturado === true ? 'sim' : 'nao',
    esquina: initialData?.esquina === true ? 'sim' : 'nao',
    mobiliado: initialData?.mobiliado === true ? 'sim' : 'nao',
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

  // Removido log de dados iniciais para reduzir ruído

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
      setLoadingCondominios(true);
      
      try {
        // Carregamento de tipos de imóveis
        const tiposResponse = await ImovelService.getTipos();
        setTipos(tiposResponse.data);
        
        // Carregamento de proprietários
        const proprietariosResponse = await ClienteService.getProprietarios();
        setProprietarios(proprietariosResponse);
        
        // Carregamento de condomínios - manter log para depuração do campo condominio
        const condominiosResponse = await api.get('/condominios/select');
        
        // Log para debug da resposta original da API
        logger.info('[CONDOMINIO] Resposta original da API:', JSON.stringify(condominiosResponse.data));
        
        // Mapear os dados para o formato esperado pelo componente Select
        const condominiosMapeados = condominiosResponse.data.map((item: any) => {
          // Verificar o formato dos dados recebidos
          if ('value' in item && 'label' in item) {
            // Já está no formato correto, apenas garantir que value seja string
            const mappedItem = {
              value: String(item.value),
              label: item.label
            };
            logger.info('[CONDOMINIO] Item já mapeado:', JSON.stringify(mappedItem));
            return mappedItem;
          } else if ('id' in item && 'nome' in item) {
            // Está no formato CondominioAPI, converter para o formato esperado
            const mappedItem = {
              value: String(item.id),
              label: item.nome
            };
            logger.info('[CONDOMINIO] Item convertido de CondominioAPI:', JSON.stringify(mappedItem));
            return mappedItem;
          } else {
            // Formato desconhecido, log para debug
            logger.info('[CONDOMINIO] Formato de item desconhecido:', item);
            return { value: '', label: 'Erro ao carregar' };
          }
        });
        
        // Adicionar uma opção vazia no início da lista
        const condominiosComOpcaoVazia = [
          { value: '', label: 'Selecione um condomínio' },
          ...condominiosMapeados
        ];
        
        setCondominios(condominiosComOpcaoVazia);
        
        // Log essencial para nossa investigação
        logger.info('[CONDOMINIO] Condomínios carregados:', condominiosComOpcaoVazia.length);
        logger.info('[CONDOMINIO] Dados dos condomínios formatados:', JSON.stringify(condominiosComOpcaoVazia));
      } catch (error) {
        // Tratar erro sem log detalhado
        // Reset do ref em caso de erro para permitir nova tentativa
        optionsLoadedRef.current = false;
      } finally {
        setLoadingOptions(false);
        setLoadingProprietarios(false);
        setLoadingCondominios(false);
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
      // Carregar subtipos sem logs
      const subtiposResponse = await ImovelService.getSubtipos(tipo);
      setSubtipos(subtiposResponse.data);
    } catch (error) {
      // Erro ao carregar subtipos sem log detalhado
    }
  }, []);

  // Carregar subtipos automaticamente quando há dados iniciais com tipo
  useEffect(() => {
    if (initialData?.tipo && !subtipos.length && !subtiposAutoLoadedRef.current) {
      // Carregar subtipos sem log
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
      // Validar código de referência sem logs
      const validacao = await ImovelService.validarCodigoReferencia(codigo, imovelId);
      
      const disponivel = validacao.disponivel;
      setCodigoDisponivel(disponivel);
      
      if (!disponivel) {
        setErroValidacao('Este código de referência já está em uso por outro imóvel');
      }
      
      return disponivel;
    } catch (error) {
      // Tratar erro sem log detalhado
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
      // Salvar código de referência sem logs
      await ImovelService.updateCodigoReferencia(imovelId, codigo, editadoManualmente);
      
      // A API retorna sucesso diretamente, sem propriedade 'success'
      // Se chegou aqui sem erro, significa que foi bem-sucedido
      setCodigoSalvo(true);
      
      // Reset do estado de sucesso após 3 segundos
      setTimeout(() => {
        setCodigoSalvo(false);
      }, 3000);
      
      return true;
    } catch (error) {
      // Erro ao salvar código de referência sem log detalhado
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
        // Formato de código inválido, não atualizar
        return;
      }

      const id = partes[0];
      const novaSigla = gerarSiglaTipo(tipo);
      const novoCodigo = `${id}-${novaSigla}`;

      // Verificar se o novo código está disponível
      const validacao = await ImovelService.validarCodigoReferencia(novoCodigo, imovelId);
      
      if (validacao.disponivel) {
        // Salvar automaticamente o novo código (editado_manualmente: false)
        const salvou = await salvarCodigoReferencia(novoCodigo, false);
        if (salvou) {
          return novoCodigo;
        }
      } else if (validacao.sugestao) {
        // Salvar automaticamente a sugestão da API (editado_manualmente: false)
        const salvou = await salvarCodigoReferencia(validacao.sugestao, false);
        if (salvou) {
          return validacao.sugestao;
        }
      } else {
        // Não foi possível gerar um código válido
        return codigoAtual;
      }
    } catch (error) {
      // Tratar erro sem log detalhado
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
      }
    }
  }, [loadSubtipos, atualizarCodigoReferencia, codigoEditadoManualmente]);

  // Handler para mudança do código de referência
  const handleCodigoReferenciaChange = useCallback((value: string, handleChange: (field: string, value: unknown) => void) => {
    handleChange('codigo_referencia', value);
    
    // Marcar como editado manualmente se o usuário alterar o código
    if (!codigoEditadoManualmente) {
      setCodigoEditadoManualmente(true);
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
    // Log para debug dos dados recebidos na função submitForm
    logger.info('[CONDOMINIO] submitForm recebeu - isCondominio:', formData.isCondominio, '/ condominio:', formData.condominio);
    
    // Garantir que condominio seja null quando isCondominio for 'nao'
    const dadosCorrigidos = {
      ...formData,
      condominio: formData.isCondominio === 'nao' ? null : formData.condominio
    };
    
    if (formData.isCondominio === 'nao' && formData.condominio !== null) {
      logger.info('[CONDOMINIO] Corrigindo inconsistência: isCondominio = nao mas condominio não é null');
    }
    
    // Usar os dados corrigidos para o restante da função
    formData = dadosCorrigidos;
    
    if (!imovelId) {
      return false;
    }

    setSalvandoEtapa(true);
    setErroSalvamentoEtapa(null);
    setEtapaSalva(false);
    
    try {
      
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
        // Nova abordagem: Não enviar condominio_id no payload de mudança de aba
        // O condominio_id agora é atualizado imediatamente quando o usuário seleciona um valor
        // ou quando muda isCondominio para "nao"
        // condominio_id: removido do payload,
        incorporacao: formData.incorporacao as string || null,
        posicao_solar: formData.posicaoSolar as string || null,
        terreno: formData.terreno as string || null,
        averbado: formData.averbado === 'sim', // Converter string para boolean
        escriturado: formData.escriturado === 'sim', // Converter string para boolean
        esquina: formData.esquina === 'sim', // Converter string para boolean
        mobiliado: formData.mobiliado === 'sim', // Converter string para boolean
        // Campos que não existem na interface da API serão ignorados
        // mas mantemos os campos principais para compatibilidade
      };

      // Nova abordagem: Não enviar is_condominio no payload de mudança de aba
      // O is_condominio agora é atualizado implicitamente quando o usuário seleciona um condomínio
      // ou quando muda isCondominio para "nao"
      
      // Log para confirmar que não estamos enviando dados de condomínio
      logger.info('[CONDOMINIO] Payload final - Não enviando is_condominio e condominio_id na mudança de aba');
      
      // Remover campos undefined/null do payload
      Object.keys(dadosParaAPI).forEach(key => {
        // Remover campos undefined/null
        if (dadosParaAPI[key as keyof typeof dadosParaAPI] === undefined || dadosParaAPI[key as keyof typeof dadosParaAPI] === null) {
          delete dadosParaAPI[key as keyof typeof dadosParaAPI];
        }
      });
      
      // Não chamar a API diretamente aqui para evitar chamada duplicada
      // Apenas notificar o componente pai com os dados já formatados corretamente
      onUpdate(dadosParaAPI, true);
      
      setEtapaSalva(true);
      
      // Reset do estado de sucesso após 3 segundos
      setTimeout(() => {
        setEtapaSalva(false);
      }, 3000);
      
      return true;
    } catch (error) {
      // Tratar erro sem log detalhado
      setErroSalvamentoEtapa('Erro ao preparar dados. Tente novamente.');
      return false;
    } finally {
      setSalvandoEtapa(false);
    }
  }, [imovelId, onUpdate]);

  // Ref para armazenar os dados atuais do formulário
  const formDataRef = useRef<InformacoesForm>(initialFormData);

  // Removidos logs de renderização do componente para focar apenas nos campos relevantes

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
        // Garantir que formDataRef.current sempre tenha os dados mais recentes
        useEffect(() => {
          formDataRef.current = { ...formData };
          // Apenas log quando os campos relevantes mudarem
          if (formData.isCondominio !== undefined || formData.condominio !== undefined) {
            // Log essencial para nossa investigação
            logger.info('[CONDOMINIO] formDataRef atualizado - isCondominio:', formData.isCondominio, '/ condominio:', formData.condominio);
          }
        }, [formData]);
        
        // Efeito para limpar o campo condominio quando isCondominio for 'nao'
        useEffect(() => {
          // Log simplificado apenas quando relevante
          if (formData.isCondominio === 'nao' && formData.condominio !== null) {
            // Log essencial para nossa investigação
            logger.info('[CONDOMINIO] Limpando valor do condomínio porque isCondominio = nao');
            handleChange('condominio', null);
          }
        }, [formData.isCondominio, formData.condominio, handleChange]);

        // Registrar o callback personalizado diretamente no WizardStep
        useEffect(() => {
          if (registerCustomSubmitCallback) {
            // Criamos uma função que vai capturar os dados mais recentes no momento da execução
            const customCallback = async () => {
              try {
                // Obter os dados mais recentes do formulário diretamente do DOM
                const radioSim = document.querySelector('input[name="isCondominio"][value="sim"]') as HTMLInputElement;
                const radioNao = document.querySelector('input[name="isCondominio"][value="nao"]') as HTMLInputElement;
                
                // Determinar o valor atual do isCondominio baseado no estado do DOM
                const isCondominioAtual = radioSim?.checked ? 'sim' : (radioNao?.checked ? 'nao' : formData.isCondominio);
                
                // Criar uma cópia atualizada dos dados do formulário
                const currentFormData = {
                  ...formData,
                  isCondominio: isCondominioAtual
                };
                
                // Forçar o valor correto de condominio baseado no isCondominio atual
                if (isCondominioAtual === 'nao') {
                  currentFormData.condominio = null;
                  logger.info('[CONDOMINIO] Forçando condominio = null porque isCondominio = nao');
                }
                
                // Log essencial para nossa investigação
                logger.info('[CONDOMINIO] Estado REAL antes do envio - isCondominio:', currentFormData.isCondominio, '/ condominio:', currentFormData.condominio);
                
                // Atualizar formDataRef com os dados mais recentes
                formDataRef.current = { ...currentFormData };
                
                // Usar os dados atualizados para garantir que temos os valores mais recentes
                const result = await submitForm(currentFormData);
                return result;
              } catch (error) {
                logger.error('[CONDOMINIO] Erro ao capturar estado atual:', error);
                // Em caso de erro, usar os dados do formData normalmente
                return await submitForm(formData);
              }
            };
            
            registerCustomSubmitCallback(customCallback);
            logger.info('[CONDOMINIO] Callback de envio registrado com captura de estado atual');
          }
        }, [registerCustomSubmitCallback, submitForm, formData]);

        // Função wrapper para handleChange que apenas chama onFieldChange (SEM salvamento automático)
        const handleFieldChangeSimple = (field: string, value: unknown) => {
          // Se estiver alterando o campo isCondominio para 'nao', limpar o campo condominio
          if (field === 'isCondominio') {
            // Log essencial para nossa investigação
            logger.info(`[CONDOMINIO] Campo isCondominio alterado para: ${value}`);
            
            if (value === 'nao') {
              // Log essencial para nossa investigação
              logger.info('[CONDOMINIO] Limpando valor do condomínio porque isCondominio = nao');
              // Limpar o campo condominio diretamente
              handleChange('condominio', null);
            }
          }
          
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
                onChange={(value) => {
                  // Atualizar o valor de isCondominio
                  handleFieldChangeSimple('isCondominio', value);
                  
                  // Nova abordagem: Enviar imediatamente uma requisição PUT quando mudar isCondominio para "nao"
                  if (value === 'nao') {
                    logger.info('[CONDOMINIO] Enviando requisição PUT para definir condominio_id como null');
                    
                    // Enviar requisição PUT para atualizar o imóvel com condominio_id: null
                    api.put(`/imoveis/${imovelId}`, {
                      condominio_id: null
                    })
                    .then(() => {
                      logger.info('[CONDOMINIO] Condominio_id definido como null com sucesso');
                    })
                    .catch((error) => {
                      logger.error('[CONDOMINIO] Erro ao definir condominio_id como null:', error);
                    });
                  }
                }}
              />
            </div>
          </div>

          {formData.isCondominio === 'sim' && (
            <div>
              <Select
                label="Condomínio/empreendimento *"
                options={condominios}
                value={formData.condominio?.toString() || ''}
                onChange={(e) => {
                  try {
                    // Extrair o valor diretamente sem tentar serializar o objeto DOM
                    const value = e.target.value;
                    
                    // Log seguro apenas do valor selecionado
                    logger.info('[CONDOMINIO] Valor selecionado do condomínio:', value, typeof value);
                    logger.info('[CONDOMINIO] Estado atual do formData.condominio:', formData.condominio);
                    
                    // Se o valor for vazio, definir como null
                    if (value === '') {
                      logger.info('[CONDOMINIO] Valor vazio selecionado, definindo condomínio como null');
                      handleFieldChangeSimple('condominio', null);
                      
                      // Enviar requisição PUT para atualizar o imóvel com condominio_id: null
                      logger.info('[CONDOMINIO] Enviando requisição PUT para definir condominio_id como null');
                      api.put(`/imoveis/${imovelId}`, {
                        condominio_id: null
                      })
                      .then(() => {
                        logger.info('[CONDOMINIO] Condominio_id definido como null com sucesso');
                      })
                      .catch((error) => {
                        logger.error('[CONDOMINIO] Erro ao definir condominio_id como null:', error);
                      });
                      
                      return;
                    }
                    
                    // Converter para número e verificar se é válido
                    const numericValue = parseInt(value, 10);
                    logger.info('[CONDOMINIO] Valor convertido para número:', numericValue);
                    
                    // Verificar se é um número válido
                    if (isNaN(numericValue) || numericValue <= 0) {
                      logger.info('[CONDOMINIO] Valor inválido para condomínio:', value);
                      handleFieldChangeSimple('condominio', null);
                      
                      // Enviar requisição PUT para atualizar o imóvel com condominio_id: null
                      logger.info('[CONDOMINIO] Enviando requisição PUT para definir condominio_id como null');
                      api.put(`/imoveis/${imovelId}`, {
                        condominio_id: null
                      })
                      .then(() => {
                        logger.info('[CONDOMINIO] Condominio_id definido como null com sucesso');
                      })
                      .catch((error) => {
                        logger.error('[CONDOMINIO] Erro ao definir condominio_id como null:', error);
                      });
                    } else {
                      logger.info('[CONDOMINIO] Atualizando condomínio para:', numericValue);
                      handleFieldChangeSimple('condominio', numericValue);
                      
                      // Nova abordagem: Enviar imediatamente uma requisição PUT quando selecionar um condomínio
                      logger.info('[CONDOMINIO] Enviando requisição PUT para definir condominio_id como', numericValue);
                      api.put(`/imoveis/${imovelId}`, {
                        condominio_id: numericValue
                      })
                      .then(() => {
                        logger.info('[CONDOMINIO] Condominio_id atualizado com sucesso');
                      })
                      .catch((error) => {
                        logger.error('[CONDOMINIO] Erro ao atualizar condominio_id:', error);
                      });
                    }
                  } catch (error) {
                    // Capturar qualquer erro e logar para debug
                    logger.info('[CONDOMINIO] Erro ao processar seleção de condomínio:', error instanceof Error ? error.message : String(error));
                  }
                }}
                required
                disabled={loadingCondominios}
              />
              {loadingCondominios && (
                <p className="text-xs text-blue-600 mt-1 flex items-center">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Carregando condomínios...
                </p>
              )}
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
