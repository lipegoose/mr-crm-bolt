import { useRef, useCallback } from 'react';
import logger from '../utils/logger';

type CallbackFunction = () => void;

/**
 * Hook para gerenciar callbacks de etapas em um wizard
 * Usa useRef para evitar re-renderizações desnecessárias
 */
export function useStepCallbacks() {
  // Ref para armazenar callbacks sem causar re-renderizações
  const stepCallbacks = useRef<Record<string, CallbackFunction | null>>({});
  
  // Função estável para registrar um callback para uma etapa
  const registerCallback = useCallback((stepId: string, callback: CallbackFunction) => {
    logger.info(`Registrando callback para etapa: ${stepId}`);
    stepCallbacks.current = {
      ...stepCallbacks.current,
      [stepId]: callback
    };
  }, []);
  
  // Função estável para executar o callback de uma etapa
  const executeCallback = useCallback((stepId: string) => {
    const callback = stepCallbacks.current[stepId];
    if (callback) {
      logger.info(`Executando callback da etapa: ${stepId}`);
      callback();
    }
  }, []);
  
  // Função para verificar se uma etapa tem callback registrado
  const hasCallback = useCallback((stepId: string): boolean => {
    return !!stepCallbacks.current[stepId];
  }, []);
  
  // Função para limpar todos os callbacks
  const clearCallbacks = useCallback(() => {
    stepCallbacks.current = {};
  }, []);
  
  // Retorna as funções e o ref (caso seja necessário acesso direto)
  return {
    registerCallback,
    executeCallback,
    hasCallback,
    clearCallbacks,
    stepCallbacks
  };
}
