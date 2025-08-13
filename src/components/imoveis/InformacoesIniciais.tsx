import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RadioGroup } from '../ui/RadioGroup';
import { ImovelService } from '../../services/ImovelService';
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
  
  // Removidos estados de salvamento da etapa que não são mais necessários
  // já que cada campo é salvo individualmente
  
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
        
        // Mapear os dados para o formato esperado pelo componente Select
        const condominiosMapeados = condominiosResponse.data.map((item: any) => {
          // Verificar o formato dos dados recebidos
          if ('value' in item && 'label' in item) {
            // Já está no formato correto, apenas garantir que value seja string
            return {
              value: String(item.value),
              label: item.label
            };
          } else if ('id' in item && 'nome' in item) {
            // Está no formato CondominioAPI, converter para o formato esperado
            return {
              value: String(item.id),
              label: item.nome
            };
          } else {
            // Formato desconhecido
            return { value: '', label: 'Erro ao carregar' };
          }
        });
        
        // Adicionar uma opção vazia no início da lista
        const condominiosComOpcaoVazia = [
          { value: '', label: 'Selecione um condomínio' },
          ...condominiosMapeados
        ];
        
        setCondominios(condominiosComOpcaoVazia);
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
  }, [codigoEditadoManualmente, validarCodigoReferencia, salvarCodigoReferencia, imovelId]);

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
          // Atualizar a referência com os dados mais recentes do formulário
          // Isso garante que sempre tenhamos os dados mais atualizados
          formDataRef.current = { ...formData };
        }, [formData]);
        
        // Efeito para limpar o campo condominio quando isCondominio for 'nao'
        useEffect(() => {
          if (formData.isCondominio === 'nao' && formData.condominio !== null) {
            handleChange('condominio', null);
          }
        }, [formData.isCondominio, formData.condominio, handleChange]);



        // Registrar o callback personalizado simplificado no WizardStep
        useEffect(() => {
          if (registerCustomSubmitCallback) {
            // Callback simplificado - não precisa mais salvar os dados, apenas garantir
            // que os dados estão atualizados para o componente pai
            const customCallback = async () => {
              try {
                // Verificar o estado atual do radio isCondominio diretamente do DOM
                // para garantir que temos o valor mais recente
                const radioSim = document.querySelector('input[name="isCondominio"][value="sim"]') as HTMLInputElement;
                const radioNao = document.querySelector('input[name="isCondominio"][value="nao"]') as HTMLInputElement;
                
                // Determinar o valor atual do isCondominio baseado no estado do DOM
                const isCondominioAtual = radioSim?.checked ? 'sim' : (radioNao?.checked ? 'nao' : formDataRef.current.isCondominio);
                
                // Atualizar apenas o valor de isCondominio se necessário
                if (formDataRef.current.isCondominio !== isCondominioAtual) {
                  formDataRef.current = {
                    ...formDataRef.current,
                    isCondominio: isCondominioAtual
                  };
                  
                  // Forçar o valor correto de condominio baseado no isCondominio atual
                  if (isCondominioAtual === 'nao') {
                    formDataRef.current.condominio = null;
                  }
                }
                
                // Como todos os campos já são salvos individualmente,
                // apenas notificar o componente pai que estamos prontos para avançar
                // sem enviar dados para a API novamente
                return true;
              } catch (error) {
                logger.error('[CALLBACK] Erro ao processar callback:', error);
                return false;
              }
            };
            
            registerCustomSubmitCallback(customCallback);
          }
        }, [registerCustomSubmitCallback]);

        // Função wrapper para handleChange que salva automaticamente cada campo alterado
        const handleFieldChangeSimple = (field: string, value: unknown) => {
          // Se estiver alterando o campo isCondominio para 'nao', limpar o campo condominio
          if (field === 'isCondominio') {
            if (value === 'nao') {
              // Limpar o campo condominio diretamente
              handleChange('condominio', null);
            }
          }
          
          // Atualizar o campo no estado local do formulário
          handleChange(field, value);
          
          // Notificar sobre a mudança de campo (comportamento original)
          onFieldChange?.();
          
          // Não salvar automaticamente os campos que já têm salvamento específico
          // (isCondominio, condominio e codigo_referencia já têm lógica própria)
          if (field === 'isCondominio' || field === 'condominio' || field === 'codigo_referencia') {
            return;
          }
          
          // Para todos os outros campos, salvar imediatamente no backend
          if (imovelId) {
            // Criar payload com apenas o campo alterado
            const payload: Record<string, any> = {};
            
            // Mapear o nome do campo do formulário para o nome do campo na API
            switch (field) {
              case 'tipo':
                payload.tipo = value as string;
                break;
              case 'subtipo':
                payload.subtipo = value as string;
                break;
              case 'perfil':
                payload.perfil = value as string;
                break;
              case 'situacao':
                payload.situacao = value as string;
                break;
              case 'ano_construcao':
                payload.ano_construcao = value ? Number(value) : null;
                break;
              case 'proprietario':
                payload.proprietario_id = value as number | null;
                break;
              case 'incorporacao':
                payload.incorporacao = value as string || null;
                break;
              case 'posicaoSolar':
                payload.posicao_solar = value as string || null;
                break;
              case 'terreno':
                payload.terreno = value as string || null;
                break;
              case 'averbado':
                payload.averbado = value === 'sim';
                break;
              case 'escriturado':
                payload.escriturado = value === 'sim';
                break;
              case 'esquina':
                payload.esquina = value === 'sim';
                break;
              case 'mobiliado':
                payload.mobiliado = value === 'sim';
                break;
              default:
                // Campo não mapeado, não enviar para a API
                return;
            }
            
            // Enviar requisição PUT para atualizar apenas o campo alterado
            api.put(`/imoveis/${imovelId}`, payload)
              .then(() => {
                // Campo atualizado com sucesso
                // Atualizar formDataRef para garantir que temos os dados mais recentes
                formDataRef.current = { ...formDataRef.current, [field]: value };
              })
              .catch((error) => {
                logger.error(`[CAMPO] Erro ao atualizar campo ${field}:`, error);
              });
          }
        };

        return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Código de referência"
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
                    // Enviar requisição PUT para atualizar o imóvel com condominio_id: null
                    api.put(`/imoveis/${imovelId}`, {
                      condominio_id: null
                    })
                    .then(() => {
                      // Condominio_id definido como null com sucesso
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
                label="Condomínio/empreendimento"
                options={condominios}
                value={formData.condominio?.toString() || ''}
                onChange={(e) => {
                  try {
                    // Extrair o valor diretamente sem tentar serializar o objeto DOM
                    const value = e.target.value;
                    

                    
                    // Se o valor for vazio, definir como null
                    if (value === '') {

                      handleFieldChangeSimple('condominio', null);
                      
                      // Enviar requisição PUT para atualizar o imóvel com condominio_id: null
                      // Enviar requisição PUT para definir condominio_id como null
                      api.put(`/imoveis/${imovelId}`, {
                        condominio_id: null
                      })
                      .then(() => {
                        // Condominio_id definido como null com sucesso
                      })
                      .catch((error) => {
                        logger.error('[CONDOMINIO] Erro ao definir condominio_id como null:', error);
                      });
                      
                      return;
                    }
                    
                    // Converter para número e verificar se é válido
                    const numericValue = parseInt(value, 10);

                    
                    // Verificar se é um número válido
                    if (isNaN(numericValue) || numericValue <= 0) {

                      handleFieldChangeSimple('condominio', null);
                      
                      // Enviar requisição PUT para atualizar o imóvel com condominio_id: null
                      // Enviar requisição PUT para definir condominio_id como null
                      api.put(`/imoveis/${imovelId}`, {
                        condominio_id: null
                      })
                      .then(() => {
                        // Condominio_id definido como null com sucesso
                      })
                      .catch((error) => {
                        logger.error('[CONDOMINIO] Erro ao definir condominio_id como null:', error);
                      });
                    } else {

                      handleFieldChangeSimple('condominio', numericValue);
                      
                      // Nova abordagem: Enviar imediatamente uma requisição PUT quando selecionar um condomínio

                      api.put(`/imoveis/${imovelId}`, {
                        condominio_id: numericValue
                      })
                      .then(() => {

                      })
                      .catch((error) => {
                        logger.error('[CONDOMINIO] Erro ao atualizar condominio_id:', error);
                      });
                    }
                  } catch (error) {
                    // Capturar qualquer erro e logar para debug

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
              label="Proprietário (privado)"
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
              label="Tipo"
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
              label="Subtipo"
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
              label="Perfil do imóvel"
              options={perfis}
              value={formData.perfil}
              onChange={(e) => handleFieldChangeSimple('perfil', e.target.value)}
              required
            />
          </div>

          <div>
            <Select
              label="Situação"
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

          {/* Indicadores de salvamento por campo são exibidos individualmente em cada campo */}
        </div>
        );
      }}
    </WizardStep>
  );
};

export default InformacoesIniciais;
