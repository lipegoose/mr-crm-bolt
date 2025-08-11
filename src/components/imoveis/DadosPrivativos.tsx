import React, { useState, useEffect, useCallback } from 'react';
import { TextArea } from '../ui/TextArea';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RadioGroup } from '../ui/RadioGroup';
import { Button } from '../ui/Button';

interface DadosPrivativosFormData {
  matricula: string;
  inscricaoMunicipal: string;
  inscricaoEstadual: string;
  valorComissao: string;
  tipoComissao: string;
  corretorResponsavel: string;
  exclusividade: string;
  dataInicioExclusividade: string;
  dataFimExclusividade: string;
  observacoesPrivadas: string;
}

interface DadosPrivativosProps {
  onUpdate: (data: DadosPrivativosFormData, hasChanges?: boolean) => void;
}

const DadosPrivativos: React.FC<DadosPrivativosProps> = ({ onUpdate }) => {
  const [formData, setFormData] = useState<DadosPrivativosFormData>({
    matricula: '',
    inscricaoMunicipal: '',
    inscricaoEstadual: '',
    valorComissao: '',
    tipoComissao: 'porcentagem',
    corretorResponsavel: '',
    exclusividade: 'nao',
    dataInicioExclusividade: '',
    dataFimExclusividade: '',
    observacoesPrivadas: '',
  });

  // Estado para controlar se o formulário foi modificado pelo usuário
  const [formChanged, setFormChanged] = useState(false);
  const [initialData, setInitialData] = useState<DadosPrivativosFormData>(formData);

  // Lista de corretores (simulação)
  const corretores = [
    { value: '', label: 'Selecione' },
    { value: 'joao', label: 'João Silva' },
    { value: 'maria', label: 'Maria Souza' },
    { value: 'carlos', label: 'Carlos Oliveira' },
    { value: 'ana', label: 'Ana Beatriz' },
    { value: 'pedro', label: 'Pedro Henrique' },
  ];

  // Armazena dados iniciais quando o componente é montado
  useEffect(() => {
    setInitialData(formData);
  }, [formData]);

  // Verifica se há mudanças reais comparando com os dados iniciais
  const hasRealChanges = useCallback(() => {
    return Object.keys(formData).some(key => 
      formData[key as keyof DadosPrivativosFormData] !== initialData[key as keyof DadosPrivativosFormData]
    );
  }, [formData, initialData]);

  // Atualiza os dados do formulário quando há mudanças reais
  useEffect(() => {
    // Só chama onUpdate se o formulário foi modificado pelo usuário e há mudanças reais
    if (formChanged && hasRealChanges()) {
      onUpdate(formData, true);
    }
  }, [formData, formChanged, onUpdate, hasRealChanges]);

  // Função para atualizar os dados do formulário
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Marca o formulário como modificado
    setFormChanged(true);
  };

  // Função para resetar o formulário aos dados iniciais
  const resetForm = () => {
    setFormData(initialData);
    setFormChanged(false);
  };

  return (
    <div>
      <h2 className="text-xl font-title font-semibold mb-4">Dados Privativos</h2>
      <p className="text-neutral-gray-medium mb-6">
        Estas informações são para uso interno e não serão exibidas no site.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Matrícula"
            placeholder="Digite o número da matrícula"
            value={formData.matricula}
            onChange={(e) => handleChange('matricula', e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Inscrição Municipal"
            placeholder="Digite a inscrição municipal"
            value={formData.inscricaoMunicipal}
            onChange={(e) => handleChange('inscricaoMunicipal', e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Inscrição Estadual"
            placeholder="Digite a inscrição estadual"
            value={formData.inscricaoEstadual}
            onChange={(e) => handleChange('inscricaoEstadual', e.target.value)}
          />
        </div>

        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Input
              label="Valor da comissão"
              placeholder="Digite o valor"
              type="number"
              min="0"
              step="0.01"
              value={formData.valorComissao}
              onChange={(e) => handleChange('valorComissao', e.target.value)}
            />
          </div>
          <div className="w-40 pb-1">
            <Select
              options={[
                { value: 'porcentagem', label: 'Porcentagem (%)' },
                { value: 'valor', label: 'Valor (R$)' }
              ]}
              value={formData.tipoComissao}
              onChange={(e) => handleChange('tipoComissao', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Select
            label="Corretor responsável"
            options={corretores}
            value={formData.corretorResponsavel}
            onChange={(e) => handleChange('corretorResponsavel', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Exclusividade
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="exclusividade"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.exclusividade}
              onChange={(value) => handleChange('exclusividade', value)}
            />
          </div>
        </div>

        {formData.exclusividade === 'sim' && (
          <>
            <div>
              <Input
                label="Data início da exclusividade"
                type="date"
                value={formData.dataInicioExclusividade}
                onChange={(e) => handleChange('dataInicioExclusividade', e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Data fim da exclusividade"
                type="date"
                value={formData.dataFimExclusividade}
                onChange={(e) => handleChange('dataFimExclusividade', e.target.value)}
              />
            </div>
          </>
        )}

        <div className="md:col-span-2">
          <TextArea
            label="Observações privadas"
            placeholder="Adicione observações internas sobre o imóvel..."
            value={formData.observacoesPrivadas}
            onChange={(e) => handleChange('observacoesPrivadas', e.target.value)}
            rows={4}
          />
          <p className="text-xs text-neutral-gray-medium mt-1">
            Estas observações são apenas para uso interno e não serão exibidas no site.
          </p>
        </div>

        <div className="md:col-span-2 flex justify-end space-x-3 pt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={resetForm}
            disabled={!hasRealChanges()}
          >
            Resetar Formulário
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DadosPrivativos;
