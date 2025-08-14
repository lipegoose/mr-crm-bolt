import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { ImovelService } from '../../services/ImovelService';
import logger from '../../utils/logger';

interface MedidasProps {
  onUpdate: (data: any) => void;
  onFieldChange?: () => void;
  imovelId?: number;
  initialData?: Record<string, unknown>;
}

const Medidas: React.FC<MedidasProps> = ({ onUpdate, onFieldChange, imovelId, initialData }) => {
  const [formData, setFormData] = useState({
    areaConstruida: initialData?.area_construida != null ? String(initialData.area_construida) : '',
    unidadeAreaConstruida: (initialData?.unidade_medida_area_construida as string) || 'm²',
    areaPrivativa: initialData?.area_privativa != null ? String(initialData.area_privativa) : '',
    unidadeAreaPrivativa: (initialData?.unidade_medida_area_privativa as string) || 'm²',
    areaTotal: initialData?.area_total != null ? String(initialData.area_total) : '',
    unidadeAreaTotal: (initialData?.unidade_medida_area_total as string) || 'm²',
  });

  // Unidades de medida
  const unidadesMedida = [
    { value: 'm²', label: 'm²' },
    { value: 'ha', label: 'ha' },
  ];

  // Timeouts para debounce do salvamento automático
  const savingTimeouts = useRef<Record<string, NodeJS.Timeout | number>>({});

  // Utils de conversão
  const toNumberOrNull = (value: string): number | null => {
    if (!value || value.trim() === '') return null;
    const normalized = value.replace(/\./g, '').replace(',', '.');
    const num = Number(normalized);
    return isNaN(num) ? null : num;
  };

  // Salvar campo com debounce (300ms)
  const saveFieldWithDebounce = (field: string, value: string) => {
    if (!imovelId) return;

    // limpar timeout anterior
    if (savingTimeouts.current[field]) {
      clearTimeout(savingTimeouts.current[field] as number);
    }

    savingTimeouts.current[field] = setTimeout(async () => {
      try {
        const payload: Record<string, unknown> = {};

        switch (field) {
          case 'areaConstruida':
            payload.area_construida = toNumberOrNull(value);
            payload.unidade_medida_area_construida = formData.unidadeAreaConstruida;
            break;
          case 'unidadeAreaConstruida':
            payload.unidade_medida_area_construida = value;
            break;
          case 'areaPrivativa':
            payload.area_privativa = toNumberOrNull(value);
            payload.unidade_medida_area_privativa = formData.unidadeAreaPrivativa;
            break;
          case 'unidadeAreaPrivativa':
            payload.unidade_medida_area_privativa = value;
            break;
          case 'areaTotal':
            payload.area_total = toNumberOrNull(value);
            payload.unidade_medida_area_total = formData.unidadeAreaTotal;
            break;
          case 'unidadeAreaTotal':
            payload.unidade_medida_area_total = value;
            break;
          default:
            return;
        }

        await ImovelService.updateEtapaMedidas(imovelId, payload);
        logger.info(`[MEDIDAS] Campo ${field} atualizado com sucesso.`);
      } catch (error) {
        logger.error(`[MEDIDAS] Erro ao atualizar campo ${field}:`, error);
      }
    }, 300);
  };

  // Atualiza os dados do formulário quando há mudanças
  // Removemos onUpdate da lista de dependências para evitar o loop infinito
  useEffect(() => {
    // Chamamos onUpdate apenas quando formData mudar
    onUpdate(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Função para atualizar os dados do formulário
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Notificar que houve mudança no campo
    onFieldChange?.();
    // Salvar campo com debounce
    saveFieldWithDebounce(field, value);
  };

  return (
    <div>
      <h2 className="text-xl font-title font-semibold mb-4">Medidas</h2>
      <p className="text-neutral-gray-medium mb-6">
        Defina as medidas deste imóvel.
      </p>

      <div className="grid grid-cols-1 gap-6">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Input
              label="Área Construída"
              placeholder="Digite..."
              type="number"
              min="0"
              step="0.01"
              value={formData.areaConstruida}
              onChange={(e) => handleChange('areaConstruida', e.target.value)}
            />
          </div>
          <div className="w-20">
            <Select
              options={unidadesMedida}
              value={formData.unidadeAreaConstruida}
              onChange={(e) => handleChange('unidadeAreaConstruida', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Input
              label="Área Privativa"
              placeholder="Digite..."
              type="number"
              min="0"
              step="0.01"
              value={formData.areaPrivativa}
              onChange={(e) => handleChange('areaPrivativa', e.target.value)}
            />
          </div>
          <div className="w-20">
            <Select
              options={unidadesMedida}
              value={formData.unidadeAreaPrivativa}
              onChange={(e) => handleChange('unidadeAreaPrivativa', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Input
              label="Área Total"
              placeholder="Digite..."
              type="number"
              min="0"
              step="0.01"
              value={formData.areaTotal}
              onChange={(e) => handleChange('areaTotal', e.target.value)}
            />
          </div>
          <div className="w-20">
            <Select
              options={unidadesMedida}
              value={formData.unidadeAreaTotal}
              onChange={(e) => handleChange('unidadeAreaTotal', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Medidas;
