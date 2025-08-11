import React from 'react';
import { Input } from '../ui/Input';
import { RadioGroup } from '../ui/RadioGroup';
import WizardStep from '../wizard/WizardStep';

interface ComodosProps {
  onUpdate: (data: Record<string, unknown>, hasChanges?: boolean) => void;
  submitCallback?: (callback: () => void) => void;
}

interface ComodosForm extends Record<string, unknown> {
  dormitorio: string;
  suite: string;
  banheiro: string;
  garagem: string;
  garagemCoberta: string;
  possuiBoxGaragem: string;
  salaTV: string;
  salaJantar: string;
  salaEstar: string;
  lavabo: string;
  areaServico: string;
  cozinha: string;
  closet: string;
  escritorio: string;
  dependenciaServico: string;
  copa: string;
}

const Comodos: React.FC<ComodosProps> = ({ onUpdate, submitCallback }) => {
  // Dados iniciais do formulário
  const initialFormData: ComodosForm = {
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
  };

  return (
    <WizardStep<ComodosForm>
      id="comodos"
      title="Cômodos"
      description="Defina as quantidades de cada cômodo deste imóvel."
      onUpdate={onUpdate}
      submitCallback={submitCallback}
      initialData={initialFormData}
    >
      {({ formData, handleChange }) => (
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
      )}
    </WizardStep>
  );
};

export default Comodos;
