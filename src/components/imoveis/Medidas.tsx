import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface MedidasProps {
  onUpdate: (data: any) => void;
}

const Medidas: React.FC<MedidasProps> = ({ onUpdate }) => {
  const [formData, setFormData] = useState({
    areaConstruida: '',
    unidadeAreaConstruida: 'm²',
    areaPrivativa: '',
    unidadeAreaPrivativa: 'm²',
    areaTotal: '',
    unidadeAreaTotal: 'm²',
  });

  // Unidades de medida
  const unidadesMedida = [
    { value: 'm²', label: 'm²' },
    { value: 'ha', label: 'ha' },
  ];

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
