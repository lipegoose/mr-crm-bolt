import { useRef, useCallback } from 'react';
import logger from '../utils/logger';

type CallbackFunction = () => void | Promise<void>;

/**
 * Hook para gerenciar callbacks de etapas em um wizard
 * Usa useRef para evitar re-renderizações desnecessárias
 */
export function useStepCallbacks() {
  // Ref para armazenar callbacks sem causar re-renderizações
  const stepCallbacks = useRef<Record<string, CallbackFunction | null>>({});
  // Ref para controlar se o callback já foi registrado
  const registeredSteps = useRef<Set<string>>(new Set());
  
  // Função estável para registrar um callback para uma etapa
  const registerCallback = useCallback((stepId: string, callback: CallbackFunction) => {
    logger.info(`🔧 [DEBUG] useStepCallbacks.registerCallback chamado para etapa: ${stepId}`);
    logger.info(`🔧 [DEBUG] Callback fornecido:`, typeof callback);
    logger.info(`🔧 [DEBUG] Etapa já registrada?`, registeredSteps.current.has(stepId));
    
    // Evitar registro duplicado
    if (registeredSteps.current.has(stepId)) {
      logger.warn(`⚠️ [DEBUG] Etapa ${stepId} já registrada, ignorando registro duplicado`);
      return;
    }
    
    logger.info(`📝 [DEBUG] Registrando callback para etapa: ${stepId}`);
    stepCallbacks.current = {
      ...stepCallbacks.current,
      [stepId]: callback
    };
    registeredSteps.current.add(stepId);
    
    logger.info(`✅ [DEBUG] Callback registrado com sucesso para etapa: ${stepId}`);
    logger.info(`📊 [DEBUG] Total de etapas registradas:`, registeredSteps.current.size);
    logger.info(`📊 [DEBUG] Etapas registradas:`, Array.from(registeredSteps.current));
    logger.info(`📊 [DEBUG] Callbacks atuais:`, Object.keys(stepCallbacks.current));
  }, []);
  
  // Função estável para executar o callback de uma etapa
  const executeCallback = useCallback((stepId: string) => {
    logger.info(`🎯 [DEBUG] useStepCallbacks.executeCallback chamado para etapa: ${stepId}`);
    logger.info(`🎯 [DEBUG] Etapa registrada?`, registeredSteps.current.has(stepId));
    logger.info(`🎯 [DEBUG] Callback existe?`, !!stepCallbacks.current[stepId]);
    logger.info(`🎯 [DEBUG] Callback armazenado:`, stepCallbacks.current[stepId]);
    
    const callback = stepCallbacks.current[stepId];
    if (callback) {
      logger.info(`🚀 [DEBUG] Executando callback da etapa: ${stepId}`);
      logger.info(`🚀 [DEBUG] Tipo do callback:`, typeof callback);
      logger.info(`🚀 [DEBUG] Callback é função?`, typeof callback === 'function');
      
      try {
        const result = callback();
        logger.info(`✅ [DEBUG] Callback da etapa ${stepId} executado com sucesso`);
        logger.info(`✅ [DEBUG] Resultado do callback:`, result);
      } catch (error) {
        logger.error(`❌ [DEBUG] Erro ao executar callback da etapa ${stepId}:`, error);
      }
    } else {
      logger.warn(`⚠️ [DEBUG] Nenhum callback encontrado para etapa: ${stepId}`);
      logger.warn(`⚠️ [DEBUG] Etapas registradas:`, Array.from(registeredSteps.current));
      logger.warn(`⚠️ [DEBUG] Callbacks disponíveis:`, Object.keys(stepCallbacks.current));
    }
  }, []);
  
  // Função para verificar se uma etapa tem callback registrado
  const hasCallback = useCallback((stepId: string): boolean => {
    return !!stepCallbacks.current[stepId];
  }, []);
  
  // Função para limpar todos os callbacks
  const clearCallbacks = useCallback(() => {
    stepCallbacks.current = {};
    registeredSteps.current.clear();
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
