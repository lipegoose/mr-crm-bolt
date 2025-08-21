import React, { useEffect, useRef, useState } from 'react';
import { RadioGroup } from '../ui/RadioGroup';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { ImovelService } from '../../services/ImovelService';

interface PublicacaoProps {
  onUpdate: (data: Record<string, unknown>, hasChanges?: boolean) => void;
  onFieldChange?: () => void;
  imovelId?: number;
  initialData?: Record<string, unknown>;
}

const Publicacao: React.FC<PublicacaoProps> = ({ onUpdate: _onUpdate, onFieldChange, imovelId, initialData }) => {
  // Preparar valores iniciais a partir de initialData (da API)
  const initialPublicarSite = (initialData?.publicar_site as boolean | undefined) === true ? 'sim' : 'nao';
  const initialPublicarPortais = (initialData?.publicar_portais as boolean | undefined) === true ? 'sim' : 'nao';
  const initialDestaque = (initialData?.destaque_site as boolean | undefined) === true ? 'sim' : 'nao';
  const initialStatus = (initialData?.status as string | undefined) || 'ATIVO';
  const initialDataPublicacao = (initialData?.data_publicacao as string | null | undefined) || '';
  const initialDataExpiracao = (initialData?.data_expiracao as string | null | undefined) || '';

  const [formData, setFormData] = useState({
    publicarNoSite: initialPublicarSite,
    publicarPortais: initialPublicarPortais,
    destaque: initialDestaque,
    status: initialStatus,
    dataPublicacao: initialDataPublicacao,
    dataExpiracao: initialDataExpiracao,
  });

  // Referência para timeouts de debounce por campo
  const savingTimeoutsRef = useRef<Record<string, NodeJS.Timeout | number>>({});

  // Lista de status (valores conforme backend)
  const statusOptions = [
    { value: 'ATIVO', label: 'Ativo' },
    { value: 'INATIVO', label: 'Inativo' },
    { value: 'VENDIDO', label: 'Vendido' },
    { value: 'ALUGADO', label: 'Alugado' },
    { value: 'RESERVADO', label: 'Reservado' },
    { value: 'EM_NEGOCIACAO', label: 'Em negociação' },
    { value: 'RASCUNHO', label: 'Rascunho' },
  ];

  // Caso initialData mude (troca de imóvel), atualizar estado local
  useEffect(() => {
    setFormData({
      publicarNoSite: (initialData?.publicar_site as boolean | undefined) === true ? 'sim' : 'nao',
      publicarPortais: (initialData?.publicar_portais as boolean | undefined) === true ? 'sim' : 'nao',
      destaque: (initialData?.destaque_site as boolean | undefined) === true ? 'sim' : 'nao',
      status: (initialData?.status as string | undefined) || 'ATIVO',
      dataPublicacao: (initialData?.data_publicacao as string | null | undefined) || '',
      dataExpiracao: (initialData?.data_expiracao as string | null | undefined) || '',
    });
  }, [initialData]);

  // Função para salvar na API um único campo
  const salvarNaAPI = async (field: string, value: string) => {
    if (!imovelId) return;

    // Mapeamento de campos do formulário -> API
    const fieldMapping: Record<string, string> = {
      publicarNoSite: 'publicar_site',
      publicarPortais: 'publicar_portais',
      destaque: 'destaque_site',
      status: 'status',
      dataPublicacao: 'data_publicacao',
      dataExpiracao: 'data_expiracao',
    };

    const apiField = fieldMapping[field];
    if (!apiField) return;

    const payload: Record<string, unknown> = {};
    if (field === 'publicarNoSite' || field === 'publicarPortais' || field === 'destaque') {
      payload[apiField] = value === 'sim';
    } else if (field === 'dataPublicacao' || field === 'dataExpiracao') {
      payload[apiField] = value || null; // enviar null quando vazio
    } else if (field === 'status') {
      payload[apiField] = value; // já está em maiúsculas conforme options
    }

    try {
      await ImovelService.updateEtapaPublicacao(imovelId, payload);
      // Notificar parent que os dados foram salvos (sem solicitar full save)
      _onUpdate?.(payload, false);
    } catch (err) {
      // Falha silenciosa para não quebrar UX
    }
  };

  // Debounce por campo
  const debounceSave = (field: string, value: string) => {
    if (savingTimeoutsRef.current[field]) {
      clearTimeout(savingTimeoutsRef.current[field] as NodeJS.Timeout);
    }
    savingTimeoutsRef.current[field] = setTimeout(() => {
      void salvarNaAPI(field, value);
      delete savingTimeoutsRef.current[field];
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

    // Salvar na API campo a campo com debounce
    if (imovelId) {
      debounceSave(field, value);
    }
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
