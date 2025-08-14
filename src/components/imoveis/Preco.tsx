import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RadioGroup } from '../ui/RadioGroup';
import { TextArea } from '../ui/TextArea';
import { ImovelService } from '../../services/ImovelService';
import logger from '../../utils/logger';

interface PrecoProps {
  onUpdate: (data: any) => void;
  onFieldChange?: () => void;
  imovelId?: number;
  initialData?: Record<string, unknown>;
}

const Preco: React.FC<PrecoProps> = ({ onUpdate, onFieldChange, imovelId, initialData }) => {
  const [formData, setFormData] = useState({
    // tipo_negocio backend: 'VENDA' | 'ALUGUEL' | 'VENDA_ALUGUEL' | 'TEMPORADA'
    tipoNegocio: (() => {
      const tn = (initialData?.tipo_negocio as string) || '';
      switch (tn) {
        case 'VENDA': return 'venda';
        case 'ALUGUEL': return 'aluguel';
        case 'VENDA_ALUGUEL': return 'venda-aluguel';
        case 'TEMPORADA': return 'temporada';
        default: return 'venda';
      }
    })(),
    // preços separados dependendo do tipo de negócio
    precoVenda: (initialData as any)?.preco_venda != null ? String((initialData as any).preco_venda) : '',
    precoLocacao: (initialData as any)?.preco_aluguel != null ? String((initialData as any).preco_aluguel) : '',
    precoTemporada: (initialData as any)?.preco_temporada != null ? String((initialData as any).preco_temporada) : '',
    mostrarPrecoSite: (initialData as any)?.mostrar_preco === false ? 'nao' : 'sim',
    mostrarLugarPreco: (initialData as any)?.preco_alternativo ? String((initialData as any).preco_alternativo) : '',
    mostrarAlteracaoPreco: (initialData as any)?.mostrar_preco_anterior ? 'sim' : 'nao',
    precoAnterior: (initialData as any)?.preco_anterior != null ? String((initialData as any).preco_anterior) : '',
    precoIPTU: (initialData as any)?.preco_iptu != null ? String((initialData as any).preco_iptu) : '',
    periodoIPTU: (() => {
      const p = (initialData?.periodo_iptu as string) || '';
      return p === 'MENSAL' ? 'mensal' : 'anual';
    })(),
    precoCondominio: (initialData as any)?.preco_condominio != null ? String((initialData as any).preco_condominio) : '',
    estaFinanciado: (initialData as any)?.financiado ? 'sim' : 'nao',
    aceitaFinanciamento: initialData?.aceita_financiamento ? 'sim' : 'nao',
    minhaCasaMinhaVida: (initialData as any)?.minha_casa_minha_vida ? 'sim' : 'nao',
    totalMensalTaxas: (initialData as any)?.total_taxas != null ? String((initialData as any).total_taxas) : '',
    descricaoTaxas: (initialData as any)?.descricao_taxas ? String((initialData as any).descricao_taxas) : '',
    aceitaPermuta: (initialData as any)?.aceita_permuta ? 'sim' : 'nao',
  });

  // Tipos de negócio
  const tiposNegocio = [
    { value: 'venda', label: 'Venda' },
    { value: 'aluguel', label: 'Aluguel' },
    { value: 'venda-aluguel', label: 'Venda e Aluguel' },
    { value: 'temporada', label: 'Temporada' },
  ];

  // Removido: tiposImoveisPermuta (não utilizado na UI atual)

  // Atualiza os dados do formulário quando há mudanças (apenas para parent awareness)
  useEffect(() => {
    onUpdate(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Debounce timeouts
  const savingTimeouts = useRef<Record<string, NodeJS.Timeout | number>>({});

  // Utils
  const toNumberOrNull = (value: string): number | null => {
    if (!value || value.trim() === '') return null;
    const normalized = value.replace(/\./g, '').replace(',', '.');
    const num = Number(normalized);
    return isNaN(num) ? null : num;
  };

  const toBoolean = (value: string): boolean => value === 'sim';

  const mapTipoNegocioToBackend = (v: string): string => {
    switch (v) {
      case 'venda': return 'VENDA';
      case 'aluguel': return 'ALUGUEL';
      case 'venda-aluguel': return 'VENDA_ALUGUEL';
      case 'temporada': return 'TEMPORADA';
      default: return 'VENDA';
    }
  };

  const mapPeriodoIptuToBackend = (v: string): string => (v === 'mensal' ? 'MENSAL' : 'ANUAL');

  const saveFieldWithDebounce = (field: string, value: string) => {
    if (!imovelId) return;
    if (savingTimeouts.current[field]) clearTimeout(savingTimeouts.current[field] as number);

    savingTimeouts.current[field] = setTimeout(async () => {
      try {
        const payload: Record<string, unknown> = {};

        switch (field) {
          case 'tipoNegocio':
            payload.tipo_negocio = mapTipoNegocioToBackend(value);
            break;
          case 'precoVenda':
            payload.preco_venda = toNumberOrNull(value);
            break;
          case 'precoLocacao':
            payload.preco_aluguel = toNumberOrNull(value);
            break;
          case 'precoTemporada':
            payload.preco_temporada = toNumberOrNull(value);
            break;
          case 'mostrarPrecoSite':
            payload.mostrar_preco = toBoolean(value);
            break;
          case 'mostrarLugarPreco':
            payload.preco_alternativo = value || null;
            break;
          case 'mostrarAlteracaoPreco':
            payload.mostrar_preco_anterior = toBoolean(value);
            break;
          case 'precoAnterior':
            payload.preco_anterior = toNumberOrNull(value);
            break;
          case 'precoIPTU':
            payload.preco_iptu = toNumberOrNull(value);
            break;
          case 'periodoIPTU':
            payload.periodo_iptu = mapPeriodoIptuToBackend(value);
            break;
          case 'precoCondominio':
            payload.preco_condominio = toNumberOrNull(value);
            break;
          case 'estaFinanciado':
            payload.financiado = toBoolean(value);
            break;
          case 'aceitaFinanciamento':
            payload.aceita_financiamento = toBoolean(value);
            break;
          case 'minhaCasaMinhaVida':
            payload.minha_casa_minha_vida = toBoolean(value);
            break;
          case 'totalMensalTaxas':
            payload.total_taxas = toNumberOrNull(value);
            break;
          case 'descricaoTaxas':
            payload.descricao_taxas = value || null;
            break;
          case 'aceitaPermuta':
            payload.aceita_permuta = toBoolean(value);
            break;
          default:
            return;
        }

        await ImovelService.updateEtapaPreco(imovelId, payload);
        logger.info(`[PREÇO] Campo ${field} atualizado com sucesso.`);
      } catch (error) {
        logger.error(`[PREÇO] Erro ao atualizar campo ${field}:`, error);
      }
    }, 300);
  };

  // Função para atualizar os dados do formulário
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Notificar que houve mudança no campo
    onFieldChange?.();
    // Salvar com debounce
    saveFieldWithDebounce(field, value);
  };

  return (
    <div>
      <h2 className="text-xl font-title font-semibold mb-4">Preço</h2>
      <p className="text-neutral-gray-medium mb-6">
        Defina o preço deste imóvel e outras informações importantes para o seu cliente.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Select
            label="Tipo do negócio"
            options={tiposNegocio}
            value={formData.tipoNegocio}
            onChange={(e) => handleChange('tipoNegocio', e.target.value)}
            required
          />
        </div>

        {formData.tipoNegocio === 'venda' && (
          <div>
            <Input
              label="Preço de Venda (R$)"
              placeholder="0,00"
              type="number"
              min="0"
              step="0.01"
              value={formData.precoVenda}
              onChange={(e) => handleChange('precoVenda', e.target.value)}
              required
            />
          </div>
        )}

        {formData.tipoNegocio === 'aluguel' && (
          <div>
            <Input
              label="Preço de Locação (R$)"
              placeholder="0,00"
              type="number"
              min="0"
              step="0.01"
              value={formData.precoLocacao}
              onChange={(e) => handleChange('precoLocacao', e.target.value)}
              required
            />
          </div>
        )}

        {formData.tipoNegocio === 'venda-aluguel' && (
          <>
            <div>
              <Input
                label="Preço de Venda (R$)"
                placeholder="0,00"
                type="number"
                min="0"
                step="0.01"
                value={formData.precoVenda}
                onChange={(e) => handleChange('precoVenda', e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Preço de Locação (R$)"
                placeholder="0,00"
                type="number"
                min="0"
                step="0.01"
                value={formData.precoLocacao}
                onChange={(e) => handleChange('precoLocacao', e.target.value)}
              />
            </div>
          </>
        )}

        {formData.tipoNegocio === 'temporada' && (
          <div>
            <Input
              label="Preço de Temporada (R$)"
              placeholder="0,00"
              type="number"
              min="0"
              step="0.01"
              value={formData.precoTemporada}
              onChange={(e) => handleChange('precoTemporada', e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold mb-1">
            Mostrar preço no site?
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="mostrarPrecoSite"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.mostrarPrecoSite}
              onChange={(value) => handleChange('mostrarPrecoSite', value)}
            />
          </div>
        </div>

        {formData.mostrarPrecoSite === 'nao' && (
          <div>
            <Input
              label="Mostrar no lugar do preço"
              placeholder="Ex: Consulte"
              value={formData.mostrarLugarPreco}
              onChange={(e) => handleChange('mostrarLugarPreco', e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold mb-1">
            Mostrar alteração de preço no site?
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="mostrarAlteracaoPreco"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.mostrarAlteracaoPreco}
              onChange={(value) => handleChange('mostrarAlteracaoPreco', value)}
            />
          </div>
        </div>

        {formData.mostrarAlteracaoPreco === 'sim' && (
          <div>
            <Input
              label="Preço anterior (riscado) (R$)"
              placeholder="0,00"
              type="number"
              min="0"
              step="0.01"
              value={formData.precoAnterior}
              onChange={(e) => handleChange('precoAnterior', e.target.value)}
            />
          </div>
        )}

        <div>
          <Input
            label="Preço do IPTU (R$)"
            placeholder="0,00"
            type="number"
            min="0"
            step="0.01"
            value={formData.precoIPTU}
            onChange={(e) => handleChange('precoIPTU', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Período
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="periodoIPTU"
              options={[
                { label: 'Anual', value: 'anual' },
                { label: 'Mensal', value: 'mensal' }
              ]}
              value={formData.periodoIPTU}
              onChange={(value) => handleChange('periodoIPTU', value)}
            />
          </div>
        </div>

        <div>
          <Input
            label="Preço Condomínio (R$)"
            placeholder="0,00"
            type="number"
            min="0"
            step="0.01"
            value={formData.precoCondominio}
            onChange={(e) => handleChange('precoCondominio', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Está financiado?
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="estaFinanciado"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.estaFinanciado}
              onChange={(value) => handleChange('estaFinanciado', value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Aceita financiamento?
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="aceitaFinanciamento"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.aceitaFinanciamento}
              onChange={(value) => handleChange('aceitaFinanciamento', value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Minha Casa Minha Vida
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="minhaCasaMinhaVida"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.minhaCasaMinhaVida}
              onChange={(value) => handleChange('minhaCasaMinhaVida', value)}
            />
          </div>
        </div>

        <div>
          <Input
            label="Total mensal em taxas (se houver) (R$)"
            placeholder="0,00"
            type="number"
            min="0"
            step="0.01"
            value={formData.totalMensalTaxas}
            onChange={(e) => handleChange('totalMensalTaxas', e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <TextArea
            label="Descrição das Taxas"
            placeholder="Descreva as taxas..."
            value={formData.descricaoTaxas}
            onChange={(e) => handleChange('descricaoTaxas', e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Aceita permuta?
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="aceitaPermuta"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.aceitaPermuta}
              onChange={(value) => handleChange('aceitaPermuta', value)}
            />
          </div>
        </div>

        {/* Campos detalhados de permuta removidos conforme mapeamento atual; mantemos apenas a flag */}
      </div>
    </div>
  );
};

export default Preco;
