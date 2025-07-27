import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RadioGroup } from '../ui/RadioGroup';

interface InformacoesIniciaisProps {
  onUpdate: (data: any) => void;
}

const InformacoesIniciais: React.FC<InformacoesIniciaisProps> = ({ onUpdate }) => {
  const [formData, setFormData] = useState({
    codigoReferencia: '',
    isCondominio: 'nao',
    condominio: '',
    proprietario: '',
    tipo: '',
    perfil: '',
    situacao: '',
    anoConstrucao: '',
    incorporacao: '',
    posicaoSolar: '',
    terreno: 'plano',
    averbado: 'nao',
    escriturado: 'nao',
    esquina: 'nao',
    temMobilia: 'nao',
  });

  // Lista de proprietários (simulação)
  const proprietarios = [
    { value: '', label: 'Selecione' },
    { value: 'joao', label: 'João Silva' },
    { value: 'maria', label: 'Maria Souza' },
    { value: 'carlos', label: 'Carlos Oliveira' },
  ];

  // Lista de tipos/subtipos
  const tipos = [
    { value: '', label: 'Selecione' },
    { value: 'apartamento', label: 'Apartamento' },
    { value: 'apartamento-cobertura', label: 'Apartamento - Cobertura' },
    { value: 'apartamento-duplex', label: 'Apartamento - Duplex' },
    { value: 'casa', label: 'Casa' },
    { value: 'casa-condominio', label: 'Casa em Condomínio' },
    { value: 'chacara', label: 'Chácara' },
    { value: 'comercial-loja', label: 'Comercial - Loja' },
    { value: 'comercial-sala', label: 'Comercial - Sala' },
    { value: 'comercial-galpao', label: 'Comercial - Galpão' },
    { value: 'terreno', label: 'Terreno' },
    { value: 'fazenda', label: 'Fazenda' },
    { value: 'sitio', label: 'Sítio' },
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
      <h2 className="text-xl font-title font-semibold mb-4">Informações iniciais</h2>
      <p className="text-neutral-gray-medium mb-6">
        Defina as informações com precisão para os seus clientes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Código de referência *"
            placeholder="Digite o código de referência"
            value={formData.codigoReferencia}
            onChange={(e) => handleChange('codigoReferencia', e.target.value)}
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
            label="Tipo/Subtipo *"
            options={tipos}
            value={formData.tipo}
            onChange={(e) => handleChange('tipo', e.target.value)}
            required
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
            value={formData.anoConstrucao}
            onChange={(e) => handleChange('anoConstrucao', e.target.value)}
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
              name="temMobilia"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.temMobilia}
              onChange={(value) => handleChange('temMobilia', value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformacoesIniciais;
