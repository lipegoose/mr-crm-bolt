import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { RadioGroup } from '../ui/RadioGroup';

interface ComodosProps {
  onUpdate: (data: any) => void;
}

const Comodos: React.FC<ComodosProps> = ({ onUpdate }) => {
  const [formData, setFormData] = useState({
    dormitorio: '0',
    suite: '0',
    banheiro: '0',
    garagem: '0',
    garagemCoberta: 'nao',
    possuiBoxGaragem: 'nao',
    salaTV: '0',
    salaJantar: '0',
    salaEstar: '0',
    lavabo: '0',
    areaServico: '0',
    cozinha: '0',
    closet: '0',
    escritorio: '0',
    dependenciaServico: '0',
    copa: '0',
  });

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
      <h2 className="text-xl font-title font-semibold mb-4">Cômodos</h2>
      <p className="text-neutral-gray-medium mb-6">
        Defina as quantidades de cada cômodo deste imóvel.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Dormitório (quantidade)"
            placeholder="Digite..."
            type="number"
            min="0"
            value={formData.dormitorio}
            onChange={(e) => handleChange('dormitorio', e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Sendo suíte (quantidade)"
            placeholder="Digite..."
            type="number"
            min="0"
            value={formData.suite}
            onChange={(e) => handleChange('suite', e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Banheiro (quantidade)"
            placeholder="Digite..."
            type="number"
            min="0"
            value={formData.banheiro}
            onChange={(e) => handleChange('banheiro', e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Garagem (quantidade)"
            placeholder="Digite..."
            type="number"
            min="0"
            value={formData.garagem}
            onChange={(e) => handleChange('garagem', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Garagem coberta
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="garagemCoberta"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.garagemCoberta}
              onChange={(value) => handleChange('garagemCoberta', value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Possui box na garagem
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="possuiBoxGaragem"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.possuiBoxGaragem}
              onChange={(value) => handleChange('possuiBoxGaragem', value)}
            />
          </div>
        </div>

        <div>
          <Input
            label="Sala de TV (quantidade)"
            placeholder="Digite..."
            type="number"
            min="0"
            value={formData.salaTV}
            onChange={(e) => handleChange('salaTV', e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Sala de jantar (quantidade)"
            placeholder="Digite..."
            type="number"
            min="0"
            value={formData.salaJantar}
            onChange={(e) => handleChange('salaJantar', e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Sala de estar (quantidade)"
            placeholder="Digite..."
            type="number"
            min="0"
            value={formData.salaEstar}
            onChange={(e) => handleChange('salaEstar', e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Lavabo (quantidade)"
            placeholder="Digite..."
            type="number"
            min="0"
            value={formData.lavabo}
            onChange={(e) => handleChange('lavabo', e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Área de serviço (quantidade)"
            placeholder="Digite..."
            type="number"
            min="0"
            value={formData.areaServico}
            onChange={(e) => handleChange('areaServico', e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Cozinha (quantidade)"
            placeholder="Digite..."
            type="number"
            min="0"
            value={formData.cozinha}
            onChange={(e) => handleChange('cozinha', e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Closet (quantidade)"
            placeholder="Digite..."
            type="number"
            min="0"
            value={formData.closet}
            onChange={(e) => handleChange('closet', e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Escritório (quantidade)"
            placeholder="Digite..."
            type="number"
            min="0"
            value={formData.escritorio}
            onChange={(e) => handleChange('escritorio', e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Dependência de serviço (quantidade)"
            placeholder="Digite..."
            type="number"
            min="0"
            value={formData.dependenciaServico}
            onChange={(e) => handleChange('dependenciaServico', e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Copa (quantidade)"
            placeholder="Digite..."
            type="number"
            min="0"
            value={formData.copa}
            onChange={(e) => handleChange('copa', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Comodos;
