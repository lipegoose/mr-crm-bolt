import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RadioGroup } from '../ui/RadioGroup';
import { ImovelService, TipoImovel, SubtipoImovel } from '../../services/ImovelService';
import { useFormWithChanges } from '../../hooks/useFormWithChanges';

interface InformacoesIniciaisProps {
  onUpdate: (data: Record<string, unknown>, hasChanges?: boolean) => void;
  submitCallback?: (callback: () => void) => void; // Nova prop para expor submitChanges
}

const InformacoesIniciais: React.FC<InformacoesIniciaisProps> = ({ onUpdate, submitCallback }) => {
  console.log("Renderizando InformacoesIniciais");
  const renderCount = React.useRef(0);
  renderCount.current++;
  console.log("Contagem de renderizações:", renderCount.current);
  
  const initialFormData = {
    codigo_referencia: '',
    isCondominio: 'nao',
    condominio: '',
    proprietario: '',
    tipo: '',
    subtipo: '',
    perfil: '',
    situacao: '',
    ano_construcao: '',
    incorporacao: '',
    posicaoSolar: '',
    terreno: 'plano',
    averbado: 'nao',
    escriturado: 'nao',
    esquina: 'nao',
    mobiliado: 'nao',
  };

  const {
    formData,
    handleChange: handleFormChange,
    submitChanges
  } = useFormWithChanges({
    initialData: initialFormData,
    onUpdate
  });

  // Memoizar submitChanges para evitar mudanças de referência
  const memoizedSubmitChanges = useCallback(() => {
    submitChanges();
  }, [submitChanges]);

  // Estados para opções da API
  const [tipos, setTipos] = useState<TipoImovel[]>([]);
  const [subtipos, setSubtipos] = useState<SubtipoImovel[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Lista de proprietários (simulação)
  const proprietarios = [
    { value: '', label: 'Selecione' },
    { value: 'joao', label: 'João Silva' },
    { value: 'maria', label: 'Maria Souza' },
    { value: 'carlos', label: 'Carlos Oliveira' },
  ];

  // Lista de perfis
  const perfis = [
    { value: '', label: 'Selecione' },
    { value: 'residencial', label: 'Residencial' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'residencial-comercial', label: 'Residencial/Comercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'rural', label: 'Rural' },
    { value: 'temporada', label: 'Temporada' },
  ];

  // Lista de situações
  const situacoes = [
    { value: '', label: 'Selecione' },
    { value: 'pronto', label: 'Pronto para morar' },
    { value: 'construcao', label: 'Em construção' },
    { value: 'planta', label: 'Na planta' },
    { value: 'reforma', label: 'Em reforma' },
  ];

  // Lista de posições solares
  const posicoesSolares = [
    { value: '', label: 'Selecione' },
    { value: 'leste', label: 'Leste' },
    { value: 'oeste', label: 'Oeste' },
    { value: 'norte', label: 'Norte' },
    { value: 'sul', label: 'Sul' },
    { value: 'nordeste', label: 'Nordeste' },
    { value: 'sudeste', label: 'Sudeste' },
    { value: 'sudoeste', label: 'Sudoeste' },
    { value: 'noroeste', label: 'Noroeste' },
    { value: 'sol-manha', label: 'Sol da manhã' },
    { value: 'sol-tarde', label: 'Sol da tarde' },
    { value: 'sol-manha-tarde', label: 'Sol da manhã e tarde' },
  ];

  // Carregar opções da API
  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const tiposResponse = await ImovelService.getTipos();
        setTipos(tiposResponse.data);
      } catch (error) {
        console.error('Erro ao carregar tipos:', error);
      } finally {
        setLoadingOptions(false);
      }
    };
    
    loadOptions();
  }, []);

  // Carregar subtipos quando o tipo mudar
  useEffect(() => {
    if (formData.tipo) {
      const loadSubtipos = async () => {
        try {
          const subtiposResponse = await ImovelService.getSubtipos(formData.tipo);
          setSubtipos(subtiposResponse.data);
        } catch (error) {
          console.error('Erro ao carregar subtipos:', error);
        }
      };
      
      loadSubtipos();
    } else {
      setSubtipos([]);
    }
  }, [formData.tipo]);

  // Expor submitChanges para o componente pai
  useEffect(() => {
    console.log("useEffect do submitCallback executando");
    if (submitCallback) {
      console.log("Registrando submitChanges no componente pai");
      submitCallback(memoizedSubmitChanges);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitCallback, memoizedSubmitChanges]);

  // Removido useEffect problemático que causava loop infinito
  // initialFormData é constante dentro do componente, não precisa de useEffect

  // Função para atualizar os dados do formulário
  const handleChange = (field: string, value: string) => {
    console.log(`handleChange chamado: ${field} = ${value}`);
    handleFormChange(field as keyof typeof initialFormData, value);
  };

  return (
    <div>
      <h2 className="text-xl font-title font-semibold mb-4">Informações iniciais</h2>
      <p className="text-neutral-gray-medium mb-6">
        Defina as informações com precisão para os seus clientes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Código de referência *"
            placeholder="Digite o código de referência"
            value={formData.codigo_referencia}
            onChange={(e) => handleChange('codigo_referencia', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Condomínio/empreendimento?
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="isCondominio"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.isCondominio}
              onChange={(value) => handleChange('isCondominio', value)}
            />
          </div>
        </div>

        {formData.isCondominio === 'sim' && (
          <div>
            <Input
              label="Nome do Condomínio/empreendimento *"
              placeholder="Digite o nome do condomínio"
              value={formData.condominio}
              onChange={(e) => handleChange('condominio', e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <Select
            label="Proprietário * (privado)"
            options={proprietarios}
            value={formData.proprietario}
            onChange={(e) => handleChange('proprietario', e.target.value)}
            required
          />
        </div>

        <div>
          <Select
            label="Tipo *"
            options={[
              { value: '', label: 'Selecione' },
              ...tipos.map(tipo => ({ value: tipo.nome, label: tipo.nome }))
            ]}
            value={formData.tipo}
            onChange={(e) => handleChange('tipo', e.target.value)}
            required
            disabled={loadingOptions}
          />
        </div>

        <div>
          <Select
            label="Subtipo *"
            options={[
              { value: '', label: 'Selecione' },
              ...subtipos.map(subtipo => ({ value: subtipo.nome, label: subtipo.nome }))
            ]}
            value={formData.subtipo}
            onChange={(e) => handleChange('subtipo', e.target.value)}
            required
            disabled={!formData.tipo || subtipos.length === 0}
          />
        </div>

        <div>
          <Select
            label="Perfil do imóvel *"
            options={perfis}
            value={formData.perfil}
            onChange={(e) => handleChange('perfil', e.target.value)}
            required
          />
        </div>

        <div>
          <Select
            label="Situação *"
            options={situacoes}
            value={formData.situacao}
            onChange={(e) => handleChange('situacao', e.target.value)}
            required
          />
        </div>

        <div>
          <Input
            label="Ano da construção"
            placeholder="Ex.: 2015"
            type="number"
            value={formData.ano_construcao}
            onChange={(e) => handleChange('ano_construcao', e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Incorporação"
            placeholder="Digite o número"
            value={formData.incorporacao}
            onChange={(e) => handleChange('incorporacao', e.target.value)}
          />
        </div>

        <div>
          <Select
            label="Posição solar"
            options={posicoesSolares}
            value={formData.posicaoSolar}
            onChange={(e) => handleChange('posicaoSolar', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Terreno
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="terreno"
              options={[
                { label: 'Plano', value: 'plano' },
                { label: 'Aclive', value: 'aclive' },
                { label: 'Declive', value: 'declive' }
              ]}
              value={formData.terreno}
              onChange={(value) => handleChange('terreno', value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Escriturado
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="escriturado"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.escriturado}
              onChange={(value) => handleChange('escriturado', value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Esquina
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="esquina"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.esquina}
              onChange={(value) => handleChange('esquina', value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Tem mobília
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="mobiliado"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.mobiliado}
              onChange={(value) => handleChange('mobiliado', value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformacoesIniciais;
