import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Info, Home, Ruler, DollarSign, CheckSquare, Building, MapPin, 
  Store, FileText, Plus, Image, Eye, Lock, Save, ArrowLeft, Loader2 
} from 'lucide-react';
import { Button } from '../ui/Button';
// import { Card } from '../ui/Card'; // Removido pois não está sendo usado
import { Step, StepNavigation } from '../ui/StepNavigation';
import { ImovelService } from '../../services/ImovelService';
import { useStepCallbacks } from '../../hooks/useStepCallbacks';
import logger from '../../utils/logger';

// Importando os componentes de passos que serão criados
import InformacoesIniciais from '../imoveis/InformacoesIniciais';
import Comodos from '../imoveis/Comodos';
import Medidas from '../imoveis/Medidas';
import Preco from '../imoveis/Preco';
import CaracteristicasImovel from '../imoveis/CaracteristicasImovel';
import CaracteristicasCondominio from '../imoveis/CaracteristicasCondominio';
import Localizacao from '../imoveis/Localizacao';
import Proximidades from '../imoveis/Proximidades';
import Descricao from '../imoveis/Descricao';
import Complementos from '../imoveis/Complementos';
import DadosPrivativos from '../imoveis/DadosPrivativos';
import ImagensImovel from '../imoveis/ImagensImovel';
import Publicacao from '../imoveis/Publicacao';

const ImovelCadastro: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeStep, setActiveStep] = useState('informacoes');
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [stepsCompleted, setStepsCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estado para controlar mudanças não salvas em cada etapa
  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());
  
  // Hook para gerenciar callbacks de etapas
  const { registerCallback, executeCallback } = useStepCallbacks();

  // Define os passos do cadastro
  const steps: Step[] = [
    { id: 'informacoes', label: 'Informações', icon: <Info size={16} />, completed: stepsCompleted.includes('informacoes') },
    { id: 'comodos', label: 'Cômodos', icon: <Home size={16} />, completed: stepsCompleted.includes('comodos') },
    { id: 'medidas', label: 'Medidas', icon: <Ruler size={16} />, completed: stepsCompleted.includes('medidas') },
    { id: 'preco', label: 'Preço', icon: <DollarSign size={16} />, completed: stepsCompleted.includes('preco') },
    { id: 'caracteristicas-imovel', label: 'Características do Imóvel', icon: <CheckSquare size={16} />, completed: stepsCompleted.includes('caracteristicas-imovel') },
    { id: 'caracteristicas-condominio', label: 'Características do Condomínio', icon: <Building size={16} />, completed: stepsCompleted.includes('caracteristicas-condominio') },
    { id: 'localizacao', label: 'Localização', icon: <MapPin size={16} />, completed: stepsCompleted.includes('localizacao') },
    { id: 'proximidades', label: 'Proximidades', icon: <Store size={16} />, completed: stepsCompleted.includes('proximidades') },
    { id: 'descricao', label: 'Descrição', icon: <FileText size={16} />, completed: stepsCompleted.includes('descricao') },
    { id: 'complementos', label: 'Complementos', icon: <Plus size={16} />, completed: stepsCompleted.includes('complementos') },
    { id: 'dados-privativos', label: 'Dados privativos', icon: <Lock size={16} />, completed: stepsCompleted.includes('dados-privativos') },
    { id: 'imagens', label: 'Imagens do imóvel', icon: <Image size={16} />, completed: stepsCompleted.includes('imagens') },
    { id: 'publicacao', label: 'Publicação', icon: <Eye size={16} />, completed: stepsCompleted.includes('publicacao') },
  ];

  // Estado para controlar etapas já carregadas
  const [loadedSteps, setLoadedSteps] = useState<Set<string>>(new Set());
  const [stepLoading, setStepLoading] = useState<string | null>(null);
  
  // Ref para controlar se já foi carregado
  const hasLoadedRef = useRef(false);

  // Mapeamento entre IDs de etapas e métodos do ImovelService
  const stepServiceMap: Record<string, (id: number) => Promise<any>> = {
    'informacoes': ImovelService.getEtapaInformacoes,
    'comodos': ImovelService.getEtapaComodos,
    'medidas': ImovelService.getEtapaMedidas,
    'preco': ImovelService.getEtapaPreco,
    'caracteristicas-imovel': ImovelService.getEtapaCaracteristicas,
    'caracteristicas-condominio': ImovelService.getEtapaCaracteristicasCondominio,
    'localizacao': ImovelService.getEtapaLocalizacao,
    'proximidades': ImovelService.getEtapaProximidades,
    'descricao': ImovelService.getEtapaDescricao,
    'complementos': ImovelService.getEtapaComplementos,
    'dados-privativos': ImovelService.getEtapaDadosPrivativos,
    'publicacao': ImovelService.getEtapaPublicacao,
  };

  // Função para carregar uma etapa específica
  const loadStepData = useCallback(async (stepId: string) => {
    if (!id || loadedSteps.has(stepId)) return;
    
    logger.info(`Carregando dados da etapa: ${stepId}`);
    
    const serviceMethod = stepServiceMap[stepId];
    if (!serviceMethod) {
      logger.warn(`Método não encontrado para etapa: ${stepId}`);
      return;
    }

    setStepLoading(stepId);
    try {
      const response = await serviceMethod(Number(id));
      if (response?.data) {
        logger.info(`Dados recebidos para etapa ${stepId}:`, response.data);
        setFormData(prev => ({
          ...prev,
          [stepId]: response.data
        }));
        
        // Marcar como concluída se tiver dados
        if (Object.keys(response.data).length > 0) {
          setStepsCompleted(prev => 
            prev.includes(stepId) ? prev : [...prev, stepId]
          );
        }
      }
      setLoadedSteps(prev => new Set([...prev, stepId]));
      logger.info(`Etapa ${stepId} carregada com sucesso`);
    } catch (error) {
      logger.info(`Etapa ${stepId} não encontrada, será criada`);
      setLoadedSteps(prev => new Set([...prev, stepId]));
    } finally {
      setStepLoading(null);
    }
  }, [id]); // Removidas dependências que podem causar re-execução

  // Carregar dados do imóvel quando o ID estiver disponível
  useEffect(() => {
    if (!id || hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    
    logger.info(`Iniciando carregamento do imóvel ${id}`);
    setLoading(true);
    
    const loadImovelBasico = async () => {
      try {
        // Carregar estado de completude das etapas
        try {
          logger.info(`Verificando completude das etapas do imóvel ${id}`);
          const completude = await ImovelService.getCompletude(Number(id));
          if (completude?.data && typeof completude.data === 'object') {
            const etapasCompletas = Object.entries(completude.data)
              .filter(([_, completa]) => completa === true)
              .map(([etapa]) => etapa);
            setStepsCompleted(etapasCompletas);
            logger.info(`Etapas completas: ${etapasCompletas.join(', ')}`);
          }
        } catch (error) {
          logger.error('Erro ao verificar completude das etapas:', error);
        }
        
        // Carregar dados da primeira etapa automaticamente
        // Esta chamada já retorna todos os dados necessários para a primeira etapa
        logger.info(`Carregando dados da primeira etapa (informacoes)`);
        await loadStepData('informacoes');
        
      } catch (error) {
        logger.error('Erro ao carregar imóvel:', error);
        alert('Erro ao carregar dados do imóvel. Tente novamente.');
      } finally {
        setLoading(false);
        logger.info(`Carregamento do imóvel ${id} finalizado`);
      }
    };
    
    loadImovelBasico();
  }, [id, loadStepData]); // Adicionado loadStepData como dependência

  // Função para atualizar os dados do formulário
  const handleUpdateFormData = useCallback(async (stepId: string, data: Record<string, unknown>, hasChanges = false) => {
    if (!id) return;
    
    // Se não houve alterações, não faz chamada à API
    if (!hasChanges) {
      logger.info(`Etapa ${stepId}: Nenhuma alteração detectada, pulando atualização`);
      return;
    }
    
    logger.info(`Salvando dados da etapa ${stepId} na API`);
    setSaving(true);
    try {
      // Salvar dados na API de acordo com a etapa
      switch (stepId) {
        case 'informacoes':
          await ImovelService.updateEtapaInformacoes(Number(id), data);
          break;
        case 'comodos':
          await ImovelService.updateEtapaComodos(Number(id), data);
          break;
        case 'medidas':
          await ImovelService.updateEtapaMedidas(Number(id), data);
          break;
        case 'preco':
          await ImovelService.updateEtapaPreco(Number(id), data);
          break;
        case 'caracteristicas-imovel':
          await ImovelService.updateEtapaCaracteristicas(Number(id), data);
          break;
        case 'caracteristicas-condominio':
          await ImovelService.updateEtapaCaracteristicasCondominio(Number(id), data);
          break;
        case 'localizacao':
          await ImovelService.updateEtapaLocalizacao(Number(id), data);
          break;
        case 'proximidades':
          await ImovelService.updateEtapaProximidades(Number(id), data);
          break;
        case 'descricao':
          await ImovelService.updateEtapaDescricao(Number(id), data);
          break;
        case 'complementos':
          await ImovelService.updateEtapaComplementos(Number(id), data);
          break;
        case 'dados-privativos':
          await ImovelService.updateEtapaDadosPrivativos(Number(id), data);
          break;
        case 'publicacao':
          await ImovelService.updateEtapaPublicacao(Number(id), data);
          break;
        default:
          logger.warn('Etapa não reconhecida:', stepId);
      }
      
      logger.info(`Etapa ${stepId} salva com sucesso na API`);
      
      // Atualizar estado local
      setFormData(prev => ({
        ...prev,
        [stepId]: data
      }));
      
      // Marca o passo como concluído
      if (!stepsCompleted.includes(stepId)) {
        setStepsCompleted(prev => [...prev, stepId]);
      }
      
      // Remove a etapa da lista de mudanças não salvas
      setUnsavedChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(stepId);
        return newSet;
      });
      
    } catch (error) {
      logger.error(`Erro ao salvar etapa ${stepId}:`, error);
      alert(`Erro ao salvar dados da etapa ${stepId}. Tente novamente.`);
    } finally {
      setSaving(false);
    }
  }, [id, stepsCompleted]);

  // Função para avançar para o próximo passo
  const handleNextStep = async () => {
    logger.info('🔄 [DEBUG] handleNextStep chamado');
    logger.info('🔄 [DEBUG] Etapa atual:', activeStep);
    logger.info('🔄 [DEBUG] Executando callback da etapa atual antes de avançar...');
    
    // Se houver um callback de submit para a etapa atual, executá-lo antes de avançar
    executeCallback(activeStep);
    
    logger.info('🔄 [DEBUG] Callback executado, avançando para próxima etapa...');
    
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex < steps.length - 1) {
      const nextStepId = steps[currentIndex + 1].id;
      logger.info('🔄 [DEBUG] Mudando de etapa:', activeStep, '→', nextStepId);
      setActiveStep(nextStepId);
      // Carregar dados da próxima etapa se necessário
      loadStepData(nextStepId);
    } else {
      logger.info('🔄 [DEBUG] Já na última etapa, não é possível avançar');
    }
  };

  // Função para voltar ao passo anterior
  const handlePreviousStep = () => {
    logger.info('🔄 [DEBUG] handlePreviousStep chamado');
    logger.info('🔄 [DEBUG] Etapa atual:', activeStep);
    
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex > 0) {
      const prevStepId = steps[currentIndex - 1].id;
      logger.info('🔄 [DEBUG] Mudando de etapa:', activeStep, '→', prevStepId);
      setActiveStep(prevStepId);
      // Carregar dados da etapa anterior se necessário
      loadStepData(prevStepId);
    } else {
      logger.info('🔄 [DEBUG] Já na primeira etapa, não é possível voltar');
    }
  };

  // Função para mudar de etapa diretamente
  const handleStepChange = async (stepId: string) => {
    logger.info('🔄 [DEBUG] handleStepChange chamado');
    logger.info('🔄 [DEBUG] Etapa atual:', activeStep);
    logger.info('🔄 [DEBUG] Nova etapa solicitada:', stepId);
    logger.info('🔄 [DEBUG] Executando callback da etapa atual antes de mudar...');
    
    // Se houver um callback de submit para a etapa atual, executá-lo antes de mudar
    executeCallback(activeStep);
    
    logger.info('🔄 [DEBUG] Callback executado, mudando para nova etapa...');
    setActiveStep(stepId);
    // Carregar dados da etapa se necessário
    loadStepData(stepId);
  };

  // Função para salvar o formulário
  const handleSave = async () => {
    if (!id) return;
    
    setSaving(true);
    try {
      // Finalizar cadastro (ativar imóvel)
      await ImovelService.finalizarCadastro(Number(id));
      alert('Imóvel cadastrado com sucesso!');
      navigate('/imoveis');
    } catch (error) {
      logger.error('Erro ao finalizar cadastro:', error);
      alert('Erro ao finalizar cadastro. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  // Função auxiliar para verificar se há dados salvos para uma etapa
  const hasStepData = useCallback((stepId: string): boolean => {
    const stepData = formData[stepId];
    if (!stepData || typeof stepData !== 'object' || stepData === null) {
      return false;
    }
    return Object.keys(stepData as Record<string, unknown>).length > 0;
  }, [formData]);

  // Função para marcar uma etapa como tendo mudanças não salvas
  const markStepAsChanged = useCallback((stepId: string) => {
    setUnsavedChanges(prev => new Set([...prev, stepId]));
  }, []);

  // Função para verificar se deve mostrar a mensagem "Dados já salvos"
  const shouldShowSavedMessage = useCallback((stepId: string): boolean => {
    // Só mostra a mensagem se há dados salvos E não há mudanças não salvas
    return hasStepData(stepId) && !unsavedChanges.has(stepId);
  }, [hasStepData, unsavedChanges]);

  // Renderiza o componente de acordo com o passo ativo
  const renderStepContent = () => {
    // Mostrar loading específico da etapa se estiver carregando
    if (stepLoading === activeStep) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-primary-orange" />
            <p className="text-neutral-gray-medium">Carregando dados da etapa...</p>
          </div>
        </div>
      );
    }

    switch (activeStep) {
      case 'informacoes':
        return (
          <div>
            {shouldShowSavedMessage('informacoes') && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">✓ Dados já salvos para esta etapa</p>
              </div>
            )}
            <InformacoesIniciais 
              onUpdate={(data, hasChanges) => handleUpdateFormData('informacoes', data, hasChanges)}
              submitCallback={(callback) => registerCallback('informacoes', callback)}
              initialData={formData['informacoes'] as Record<string, unknown>}
              onFieldChange={() => markStepAsChanged('informacoes')}
              imovelId={id ? Number(id) : undefined}
            />
          </div>
        );
      case 'comodos':
        return (
          <Comodos 
            onUpdate={(data, hasChanges) => handleUpdateFormData('comodos', data, hasChanges)}
            submitCallback={(callback) => registerCallback('comodos', callback)}
            onFieldChange={() => markStepAsChanged('comodos')}
            imovelId={id ? Number(id) : undefined}
            initialData={formData['comodos'] as Record<string, unknown>}
          />
        );
      case 'medidas':
        return (
          <div>
            {shouldShowSavedMessage('medidas') && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">✓ Dados já salvos para esta etapa</p>
              </div>
            )}
            <Medidas 
              onUpdate={(data) => handleUpdateFormData('medidas', data)} 
              onFieldChange={() => markStepAsChanged('medidas')}
              imovelId={id ? Number(id) : undefined}
              initialData={formData['medidas'] as Record<string, unknown>}
            />
          </div>
        );
      case 'preco':
        return (
          <div>
            {shouldShowSavedMessage('preco') && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">✓ Dados já salvos para esta etapa</p>
              </div>
            )}
            <Preco 
              onUpdate={(data) => handleUpdateFormData('preco', data)} 
              onFieldChange={() => markStepAsChanged('preco')}
              imovelId={id ? Number(id) : undefined}
              initialData={formData['preco'] as Record<string, unknown>}
            />
          </div>
        );
      case 'caracteristicas-imovel':
        return (
          <div>
            {shouldShowSavedMessage('caracteristicas-imovel') && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">✓ Dados já salvos para esta etapa</p>
              </div>
            )}
            <CaracteristicasImovel 
              onUpdate={(data) => handleUpdateFormData('caracteristicas-imovel', data)} 
              onFieldChange={() => markStepAsChanged('caracteristicas-imovel')}
              imovelId={id ? Number(id) : undefined}
              initialData={formData['caracteristicas-imovel'] as Record<string, unknown>}
            />
          </div>
        );
      case 'caracteristicas-condominio':
        return (
          <div>
            {shouldShowSavedMessage('caracteristicas-condominio') && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">✓ Dados já salvos para esta etapa</p>
              </div>
            )}
            <CaracteristicasCondominio 
              onUpdate={(data) => handleUpdateFormData('caracteristicas-condominio', data)} 
              onFieldChange={() => markStepAsChanged('caracteristicas-condominio')}
              imovelId={id ? Number(id) : undefined}
              initialData={formData['caracteristicas-condominio'] as Record<string, unknown>}
            />
          </div>
        );
      case 'localizacao':
        return (
          <div>
            {shouldShowSavedMessage('localizacao') && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">✓ Dados já salvos para esta etapa</p>
              </div>
            )}
            <Localizacao 
              onUpdate={(data) => handleUpdateFormData('localizacao', data)} 
              onFieldChange={() => markStepAsChanged('localizacao')}
              imovelId={id ? Number(id) : undefined}
              initialData={formData['localizacao'] as Record<string, unknown>}
            />
          </div>
        );
      case 'proximidades':
        return (
          <div>
            {shouldShowSavedMessage('proximidades') && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">✓ Dados já salvos para esta etapa</p>
              </div>
            )}
            <Proximidades 
              onUpdate={(data) => handleUpdateFormData('proximidades', data)} 
              onFieldChange={() => markStepAsChanged('proximidades')}
            />
          </div>
        );
      case 'descricao':
        return (
          <div>
            {shouldShowSavedMessage('descricao') && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">✓ Dados já salvos para esta etapa</p>
              </div>
            )}
            <Descricao 
              onUpdate={(data) => handleUpdateFormData('descricao', data)} 
              onFieldChange={() => markStepAsChanged('descricao')}
            />
          </div>
        );
      case 'complementos':
        return (
          <div>
            {shouldShowSavedMessage('complementos') && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">✓ Dados já salvos para esta etapa</p>
              </div>
            )}
            <Complementos 
              onUpdate={(data) => handleUpdateFormData('complementos', data)} 
              onFieldChange={() => markStepAsChanged('complementos')}
            />
          </div>
        );
      case 'dados-privativos':
        return (
          <div>
            {shouldShowSavedMessage('dados-privativos') && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">✓ Dados já salvos para esta etapa</p>
              </div>
            )}
            <DadosPrivativos 
              onUpdate={(data, hasChanges) => handleUpdateFormData('dados-privativos', { ...data }, hasChanges)} 
              onFieldChange={() => markStepAsChanged('dados-privativos')}
            />
          </div>
        );
      case 'imagens':
        return (
          <div>
            {shouldShowSavedMessage('imagens') && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">✓ Dados já salvos para esta etapa</p>
              </div>
            )}
            <ImagensImovel 
              onUpdate={(data) => handleUpdateFormData('imagens', data)} 
              onFieldChange={() => markStepAsChanged('imagens')}
            />
          </div>
        );
      case 'publicacao':
        return (
          <div>
            {shouldShowSavedMessage('publicacao') && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">✓ Dados já salvos para esta etapa</p>
              </div>
            )}
            <Publicacao 
              onUpdate={(data) => handleUpdateFormData('publicacao', data)} 
              onFieldChange={() => markStepAsChanged('publicacao')}
            />
          </div>
        );
      default:
        return <div>Passo não encontrado</div>;
    }
  };

  // Mostrar loading enquanto carrega
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-orange" />
          <p className="text-neutral-gray-medium">Carregando dados do imóvel...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-title font-bold text-neutral-black">Cadastro de Imóvel</h1>
          <p className="text-neutral-gray-medium">Preencha os dados do imóvel em cada etapa</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/imoveis')}
            className="flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center"
          >
            {saving ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            {saving ? 'Salvando...' : 'Salvar Imóvel'}
          </Button>
        </div>
      </div>

      <div className="flex bg-white border border-neutral-gray rounded-default shadow-sm">
        <StepNavigation 
          steps={steps} 
          activeStep={activeStep} 
          onStepChange={handleStepChange} 
        />
        
        <div className="flex-1 p-6">
          {renderStepContent()}
          
          <div className="flex justify-between mt-8 pt-4 border-t border-neutral-gray">
            <Button 
              variant="secondary" 
              onClick={handlePreviousStep}
              disabled={activeStep === steps[0].id || saving}
            >
              Anterior
            </Button>
            
            <div className="flex space-x-3">
              {activeStep !== steps[steps.length - 1].id ? (
                <Button onClick={() => handleNextStep()} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Próximo'
                  )}
                </Button>
              ) : (
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Finalizar'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImovelCadastro;
