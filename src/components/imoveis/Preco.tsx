import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RadioGroup } from '../ui/RadioGroup';
import { TextArea } from '../ui/TextArea';

interface PrecoProps {
  onUpdate: (data: any) => void;
}

const Preco: React.FC<PrecoProps> = ({ onUpdate }) => {
  const [formData, setFormData] = useState({
    tipoNegocio: 'venda',
    precoImovel: '',
    mostrarPrecoSite: 'sim',
    mostrarLugarPreco: '',
    mostrarAlteracaoPreco: 'nao',
    precoAnterior: '',
    precoIPTU: '',
    periodoIPTU: 'anual',
    precoCondominio: '',
    estaFinanciado: 'nao',
    aceitaFinanciamento: 'nao',
    minhaCasaMinhaVida: 'nao',
    totalMensalTaxas: '',
    descricaoTaxas: '',
    aceitaPermuta: 'nao',
    tipoImovelAceito: '',
    valorMaximoPermuta: '',
    descricaoPermutas: '',
  });

  // Tipos de negócio
  const tiposNegocio = [
    { value: 'venda', label: 'Venda' },
    { value: 'aluguel', label: 'Aluguel' },
    { value: 'venda-aluguel', label: 'Venda e Aluguel' },
    { value: 'temporada', label: 'Temporada' },
  ];

  // Tipos de imóveis aceitos para permuta
  const tiposImoveisPermuta = [
    { value: '', label: 'Selecione' },
    { value: 'apartamento', label: 'Apartamento' },
    { value: 'casa', label: 'Casa' },
    { value: 'terreno', label: 'Terreno' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'rural', label: 'Rural' },
    { value: 'qualquer', label: 'Qualquer tipo' },
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

        <div>
          <Input
            label="Preço do Imóvel (R$)"
            placeholder="0,00"
            type="number"
            min="0"
            step="0.01"
            value={formData.precoImovel}
            onChange={(e) => handleChange('precoImovel', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-black mb-1">
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
          <label className="block text-sm font-medium text-neutral-black mb-1">
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
          <label className="block text-sm font-medium text-neutral-black mb-1">
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
          <label className="block text-sm font-medium text-neutral-black mb-1">
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
          <label className="block text-sm font-medium text-neutral-black mb-1">
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
          <label className="block text-sm font-medium text-neutral-black mb-1">
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
          <label className="block text-sm font-medium text-neutral-black mb-1">
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

        {formData.aceitaPermuta === 'sim' && (
          <>
            <div>
              <Select
                label="Tipo de imóvel aceito"
                options={tiposImoveisPermuta}
                value={formData.tipoImovelAceito}
                onChange={(e) => handleChange('tipoImovelAceito', e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Valor máximo da permuta (R$)"
                placeholder="0,00"
                type="number"
                min="0"
                step="0.01"
                value={formData.valorMaximoPermuta}
                onChange={(e) => handleChange('valorMaximoPermuta', e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <TextArea
                label="Descrição das Permutas"
                placeholder="Descreva as permutas..."
                value={formData.descricaoPermutas}
                onChange={(e) => handleChange('descricaoPermutas', e.target.value)}
                rows={3}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Preco;
