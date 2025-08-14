import React, { useRef } from 'react';
import { Input } from '../ui/Input';
import { RadioGroup } from '../ui/RadioGroup';
import WizardStep from '../wizard/WizardStep';
import { ImovelService } from '../../services/ImovelService';
import logger from '../../utils/logger';

interface ComodosProps {
  onUpdate: (data: Record<string, unknown>, hasChanges?: boolean) => void;
  submitCallback?: (callback: () => void) => void;
  onFieldChange?: () => void;
  imovelId?: number;
  initialData?: Record<string, unknown>;
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

const Comodos: React.FC<ComodosProps> = ({ onUpdate, submitCallback, onFieldChange, imovelId, initialData }) => {
  // Dados iniciais do formulário
  const initialFormData: ComodosForm = {
    dormitorio: initialData?.dormitorios !== undefined && initialData?.dormitorios !== null ? String(initialData.dormitorios) : '0',
    suite: initialData?.suites !== undefined && initialData?.suites !== null ? String(initialData.suites) : '0',
    banheiro: initialData?.banheiros !== undefined && initialData?.banheiros !== null ? String(initialData.banheiros) : '0',
    garagem: initialData?.garagens !== undefined && initialData?.garagens !== null ? String(initialData.garagens) : '0',
    garagemCoberta: initialData?.garagem_coberta === true ? 'sim' : 'nao',
    possuiBoxGaragem: initialData?.box_garagem === true ? 'sim' : 'nao',
    salaTV: initialData?.sala_tv !== undefined && initialData?.sala_tv !== null ? String(initialData.sala_tv) : '0',
    salaJantar: initialData?.sala_jantar !== undefined && initialData?.sala_jantar !== null ? String(initialData.sala_jantar) : '0',
    salaEstar: initialData?.sala_estar !== undefined && initialData?.sala_estar !== null ? String(initialData.sala_estar) : '0',
    lavabo: initialData?.lavabo !== undefined && initialData?.lavabo !== null ? String(initialData.lavabo) : '0',
    areaServico: initialData?.area_servico !== undefined && initialData?.area_servico !== null ? String(initialData.area_servico) : '0',
    cozinha: initialData?.cozinha !== undefined && initialData?.cozinha !== null ? String(initialData.cozinha) : '0',
    closet: initialData?.closet !== undefined && initialData?.closet !== null ? String(initialData.closet) : '0',
    escritorio: initialData?.escritorio !== undefined && initialData?.escritorio !== null ? String(initialData.escritorio) : '0',
    dependenciaServico: initialData?.dependencia_servico !== undefined && initialData?.dependencia_servico !== null ? String(initialData.dependencia_servico) : '0',
    copa: initialData?.copa !== undefined && initialData?.copa !== null ? String(initialData.copa) : '0',
  };

  // Ref para temporizadores de debounce por campo
  const saveTimeoutsRef = useRef<Record<string, NodeJS.Timeout | number>>({});

  // Função utilitária para converter valores
  const toNumberOrNull = (value: unknown): number | null => {
    if (value === '' || value === undefined || value === null) return null;
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? null : parsed;
  };

  const toBoolean = (value: unknown): boolean => String(value) === 'sim';

  return (
    <WizardStep<ComodosForm>
      id="comodos"
      title="Cômodos"
      description="Defina as quantidades de cada cômodo deste imóvel."
      onUpdate={onUpdate}
      submitCallback={submitCallback}
      initialData={initialFormData}
    >
      {({ formData, handleChange }) => {
        // Função wrapper para handleChange que também chama onFieldChange
        const handleFieldChange = (field: string, value: unknown) => {
          handleChange(field, value);
          onFieldChange?.();

          if (!imovelId) return;

          // Cancelar debounce anterior para o campo
          const prevTimeout = saveTimeoutsRef.current[field];
          if (prevTimeout) {
            clearTimeout(prevTimeout as number);
          }

          // Agendar salvamento com debounce (300ms)
          saveTimeoutsRef.current[field] = setTimeout(async () => {
            try {
              const payload: Record<string, any> = {};
              switch (field) {
                case 'dormitorio':
                  payload.dormitorios = toNumberOrNull(value);
                  break;
                case 'suite':
                  payload.suites = toNumberOrNull(value);
                  break;
                case 'banheiro':
                  payload.banheiros = toNumberOrNull(value);
                  break;
                case 'garagem':
                  payload.garagens = toNumberOrNull(value);
                  break;
                case 'garagemCoberta':
                  payload.garagem_coberta = toBoolean(value);
                  break;
                case 'possuiBoxGaragem':
                  payload.box_garagem = toBoolean(value);
                  break;
                case 'salaTV':
                  payload.sala_tv = toNumberOrNull(value);
                  break;
                case 'salaJantar':
                  payload.sala_jantar = toNumberOrNull(value);
                  break;
                case 'salaEstar':
                  payload.sala_estar = toNumberOrNull(value);
                  break;
                case 'lavabo':
                  payload.lavabo = toNumberOrNull(value);
                  break;
                case 'areaServico':
                  payload.area_servico = toNumberOrNull(value);
                  break;
                case 'cozinha':
                  payload.cozinha = toNumberOrNull(value);
                  break;
                case 'closet':
                  payload.closet = toNumberOrNull(value);
                  break;
                case 'escritorio':
                  payload.escritorio = toNumberOrNull(value);
                  break;
                case 'dependenciaServico':
                  payload.dependencia_servico = toNumberOrNull(value);
                  break;
                case 'copa':
                  payload.copa = toNumberOrNull(value);
                  break;
                default:
                  return; // campo não suportado
              }

              await ImovelService.updateEtapaComodos(imovelId, payload);
              logger.info(`[CÔMODOS] Campo ${field} atualizado com sucesso.`);
            } catch (error) {
              logger.error(`[CÔMODOS] Erro ao atualizar campo ${field}:`, error);
            }
          }, 300);
        };

        return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Dormitório (quantidade)"
              placeholder="Digite..."
              type="number"
              min="0"
              value={formData.dormitorio}
              onChange={(e) => handleFieldChange('dormitorio', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Sendo suíte (quantidade)"
              placeholder="Digite..."
              type="number"
              min="0"
              value={formData.suite}
              onChange={(e) => handleFieldChange('suite', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Banheiro (quantidade)"
              placeholder="Digite..."
              type="number"
              min="0"
              value={formData.banheiro}
              onChange={(e) => handleFieldChange('banheiro', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Garagem (quantidade)"
              placeholder="Digite..."
              type="number"
              min="0"
              value={formData.garagem}
              onChange={(e) => handleFieldChange('garagem', e.target.value)}
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
                onChange={(value) => handleFieldChange('garagemCoberta', value)}
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
                onChange={(value) => handleFieldChange('possuiBoxGaragem', value)}
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
              onChange={(e) => handleFieldChange('salaTV', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Sala de jantar (quantidade)"
              placeholder="Digite..."
              type="number"
              min="0"
              value={formData.salaJantar}
              onChange={(e) => handleFieldChange('salaJantar', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Sala de estar (quantidade)"
              placeholder="Digite..."
              type="number"
              min="0"
              value={formData.salaEstar}
              onChange={(e) => handleFieldChange('salaEstar', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Lavabo (quantidade)"
              placeholder="Digite..."
              type="number"
              min="0"
              value={formData.lavabo}
              onChange={(e) => handleFieldChange('lavabo', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Área de serviço (quantidade)"
              placeholder="Digite..."
              type="number"
              min="0"
              value={formData.areaServico}
              onChange={(e) => handleFieldChange('areaServico', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Cozinha (quantidade)"
              placeholder="Digite..."
              type="number"
              min="0"
              value={formData.cozinha}
              onChange={(e) => handleFieldChange('cozinha', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Closet (quantidade)"
              placeholder="Digite..."
              type="number"
              min="0"
              value={formData.closet}
              onChange={(e) => handleFieldChange('closet', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Escritório (quantidade)"
              placeholder="Digite..."
              type="number"
              min="0"
              value={formData.escritorio}
              onChange={(e) => handleFieldChange('escritorio', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Dependência de serviço (quantidade)"
              placeholder="Digite..."
              type="number"
              min="0"
              value={formData.dependenciaServico}
              onChange={(e) => handleFieldChange('dependenciaServico', e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Copa (quantidade)"
              placeholder="Digite..."
              type="number"
              min="0"
              value={formData.copa}
              onChange={(e) => handleFieldChange('copa', e.target.value)}
            />
          </div>
        </div>
        );
      }}
    </WizardStep>
  );
};

export default Comodos;
