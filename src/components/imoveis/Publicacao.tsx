import React, { useState, useEffect } from 'react';
import { RadioGroup } from '../ui/RadioGroup';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

interface PublicacaoProps {
  onUpdate: (data: any) => void;
  onFieldChange?: () => void;
}

const Publicacao: React.FC<PublicacaoProps> = ({ onUpdate, onFieldChange }) => {
  const [formData, setFormData] = useState({
    publicarNoSite: 'sim',
    publicarPortais: 'sim',
    destaque: 'nao',
    status: 'ativo',
    dataPublicacao: '',
    dataExpiracao: '',
  });

  // Lista de status
  const statusOptions = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' },
    { value: 'vendido', label: 'Vendido' },
    { value: 'alugado', label: 'Alugado' },
    { value: 'reservado', label: 'Reservado' },
    { value: 'em-negociacao', label: 'Em negociação' },
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
    // Notificar que houve mudança no campo
    onFieldChange?.();
  };

  return (
    <div>
      <h2 className="text-xl font-title font-semibold mb-4">Publicação</h2>
      <p className="text-neutral-gray-medium mb-6">
        Configure as opções de publicação do imóvel.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-1">
            Publicar no site?
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="publicarNoSite"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.publicarNoSite}
              onChange={(value) => handleChange('publicarNoSite', value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Publicar nos portais parceiros?
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="publicarPortais"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.publicarPortais}
              onChange={(value) => handleChange('publicarPortais', value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Destaque no site?
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="destaque"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.destaque}
              onChange={(value) => handleChange('destaque', value)}
            />
          </div>
        </div>

        <div>
          <Select
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Data de publicação"
            type="date"
            value={formData.dataPublicacao}
            onChange={(e) => handleChange('dataPublicacao', e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Data de expiração"
            type="date"
            value={formData.dataExpiracao}
            onChange={(e) => handleChange('dataExpiracao', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Publicacao;
