import React, { useCallback, useRef, useEffect } from 'react';
import { useFormWithChanges } from '../../hooks/useFormWithChanges';
import logger from '../../utils/logger';

interface WizardStepProps<T extends Record<string, unknown>> {
  id: string;
  title: string;
  description?: string;
  onUpdate: (data: Record<string, unknown>, hasChanges?: boolean) => void;
  submitCallback?: (callback: () => void) => void;
  initialData: T;
  children: (props: {
    formData: T;
    handleChange: (field: string, value: unknown) => void;
    hasDataSaved: boolean;
    registerCustomSubmitCallback?: (customCallback: () => void) => void;
  }) => React.ReactNode;
}

/**
 * Componente base para etapas do wizard
 * Encapsula a lógica de formulário, submissão e memoização de callbacks
 */
function WizardStep<T extends Record<string, unknown>>({
  id,
  title,
  description,
  onUpdate,
  submitCallback,
  initialData,
  children
}: WizardStepProps<T>) {
  // Contador de renderizações para debug
  const renderCount = useRef(0);
  
  // Estado e lógica do formulário
  const {
    formData,
    handleChange: handleFormChange,
    submitChanges
  } = useFormWithChanges({
    initialData,
    onUpdate
  });
  
  // Ref para armazenar callback personalizado
  const customSubmitCallbackRef = useRef<(() => void) | null>(null);
  
  // Log de renderização
  logger.debug(`Renderizando etapa: ${id} (${++renderCount.current})`);
  
  // Memoização da função submitChanges
  const memoizedSubmitChanges = useCallback(() => {
    logger.debug(`Submetendo alterações da etapa: ${id}`);
    submitChanges();
  }, [submitChanges, id]);
  
  // Função para registrar callback personalizado
  const registerCustomSubmitCallback = useCallback((customCallback: () => void) => {
    logger.debug(`Registrando callback personalizado para etapa: ${id}`);
    customSubmitCallbackRef.current = customCallback;
  }, [id]);
  
  // Registrar callback no componente pai
  useEffect(() => {
    if (submitCallback) {
      logger.debug(`Registrando submitCallback para etapa: ${id}`);
      
      // Registrar uma função que verifica se há callback personalizado
      submitCallback(() => {
        if (customSubmitCallbackRef.current) {
          logger.debug(`Executando callback personalizado para etapa: ${id}`);
          return customSubmitCallbackRef.current();
        } else {
          logger.debug(`Executando callback padrão para etapa: ${id}`);
          return memoizedSubmitChanges();
        }
      });
    }
  }, [submitCallback, memoizedSubmitChanges, id]);
  
  // Memoizar a função handleChange para evitar re-renderizações desnecessárias
  const memoizedHandleChange = useCallback((field: string, value: unknown) => {
    logger.debug(`Campo alterado na etapa ${id}: ${field} = ${String(value)}`);
    handleFormChange(field as keyof T, value);
  }, [handleFormChange, id]);
  

  
  // Verificar se o formulário tem dados salvos
  // Considera que há dados salvos se pelo menos um campo não estiver vazio
  const hasDataSaved = Object.values(formData).some(value => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value !== '' && value !== '0' && value !== 'nao';
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'boolean') return value === true;
    return true; // Para outros tipos, considera que há dados
  });
  
  // Renderizar estrutura básica com header e indicador de dados salvos
  return (
    <div className="wizard-step">
      <h2 className="text-xl font-title font-semibold mb-4">{title}</h2>
      {description && (
        <p className="text-neutral-gray-medium mb-6">{description}</p>
      )}
      
      {children({
        formData: formData as T,
        handleChange: memoizedHandleChange,
        hasDataSaved,
        registerCustomSubmitCallback
      })}
    </div>
  );
}

export default WizardStep;
