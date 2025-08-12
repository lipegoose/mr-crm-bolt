import { useState, useEffect, useCallback } from 'react';

interface UseFormWithChangesOptions<T> {
  initialData: T;
  onUpdate: (data: T, hasChanges: boolean) => void;
}

export function useFormWithChanges<T extends Record<string, unknown>>({
  initialData,
  onUpdate
}: UseFormWithChangesOptions<T>) {
  const [formData, setFormData] = useState<T>(initialData);
  const [formChanged, setFormChanged] = useState(false);
  const [initialDataState, setInitialDataState] = useState<T>(initialData);

  // Armazena dados iniciais apenas na montagem do componente
  useEffect(() => {
    setInitialDataState(initialData);
    setFormData(initialData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array de dependências vazio para evitar loop infinito

  // Removido useEffect problemático que causava loop infinito
  // O onUpdate será chamado explicitamente através de submitChanges

  // Função para atualizar um campo específico
  const handleChange = (field: keyof T, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Marca o formulário como modificado
    setFormChanged(true);
  };

  // Função para atualizar múltiplos campos
  const handleMultipleChanges = (changes: Partial<T>) => {
    setFormData(prev => ({
      ...prev,
      ...changes
    }));
    
    // Marca o formulário como modificado
    setFormChanged(true);
  };

  // Função para submeter alterações explicitamente
  const submitChanges = useCallback(() => {
    if (formChanged) {
      onUpdate(formData, true);
      setFormChanged(false); // Reset do estado de mudança após envio
    }
  }, [formChanged, formData, onUpdate]);

  // Função para resetar o formulário
  const resetForm = () => {
    setFormData(initialDataState);
    setFormChanged(false);
  };

  // Função para verificar se houve alterações
  const hasChanges = () => formChanged;

  // Função para atualizar dados iniciais explicitamente
  const updateInitialData = (newData: T) => {
    setInitialDataState(newData);
    setFormData(newData);
    setFormChanged(false);
  };

  return {
    formData,
    formChanged,
    handleChange,
    handleMultipleChanges,
    submitChanges,
    resetForm,
    hasChanges,
    setFormData,
    updateInitialData
  };
}
