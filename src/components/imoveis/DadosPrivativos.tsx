import React, { useState, useEffect, useRef } from 'react';
import { TextArea } from '../ui/TextArea';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RadioGroup } from '../ui/RadioGroup';
import { ImovelService } from '../../services/ImovelService';
import { UsuarioService, SelectOption } from '../../services/UsuarioService';
import type { Option } from '../ui/Select';
 

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
  onFieldChange?: () => void;
  imovelId?: number;
  initialData?: Record<string, unknown>;
}

const DadosPrivativos: React.FC<DadosPrivativosProps> = ({ onUpdate: _onUpdate, onFieldChange, imovelId, initialData }) => {
  // Processamento dos dados iniciais
  const initialMatricula = initialData?.matricula as string || '';
  const initialInscricaoMunicipal = initialData?.inscricao_municipal as string || '';
  const initialInscricaoEstadual = initialData?.inscricao_estadual as string || '';
  const initialValorComissao = initialData?.valor_comissao as string || '';
  const initialTipoComissao = initialData?.tipo_comissao as string || 'PORCENTAGEM';
  const initialCorretorResponsavel = initialData?.corretor_id ? String(initialData.corretor_id) : '';
  const initialExclusividade = initialData?.exclusividade === true ? 'sim' : 'nao';
  const initialDataInicioExclusividade = initialData?.data_inicio_exclusividade as string || '';
  const initialDataFimExclusividade = initialData?.data_fim_exclusividade as string || '';
  const initialObservacoesPrivadas = initialData?.observacoes_privadas as string || '';

  const [formData, setFormData] = useState<DadosPrivativosFormData>({
    matricula: initialMatricula,
    inscricaoMunicipal: initialInscricaoMunicipal,
    inscricaoEstadual: initialInscricaoEstadual,
    valorComissao: initialValorComissao,
    tipoComissao: initialTipoComissao,
    corretorResponsavel: initialCorretorResponsavel,
    exclusividade: initialExclusividade,
    dataInicioExclusividade: initialDataInicioExclusividade,
    dataFimExclusividade: initialDataFimExclusividade,
    observacoesPrivadas: initialObservacoesPrivadas,
  });

  // Estado para armazenar a lista de corretores da API
  const [corretores, setCorretores] = useState<Option[]>([
    { value: '', label: 'Selecione' },
  ]);
  
  // Referência para controlar o timeout de salvamento por campo
  const savingTimeoutsRef = useRef<Record<string, NodeJS.Timeout | number>>({});
  
  // Buscar corretores da API
  useEffect(() => {
    const fetchCorretores = async () => {
      try {
        const response = await UsuarioService.getUsuariosSelect();
        if (response.success && response.data) {
          // Converter os valores numéricos para string para compatibilidade com o componente Select
          const optionsFormatadas = Array.isArray(response.data) 
            ? response.data.map((item: SelectOption) => ({
                value: String(item.value),
                label: item.label
              }))
            : [];
          
          // Adicionar a opção 'Selecione' no início da lista
          setCorretores([{ value: '', label: 'Selecione' }, ...optionsFormatadas]);
        } else {
          // Silencioso: manter UX mesmo sem dados
        }
      } catch (error) {
        // Falha silenciosa para não interromper a UX
      }
    };
    
    fetchCorretores();
  }, []);



  // Função para salvar dados na API com o formato correto
  const salvarNaAPI = async (field: string, value: string) => {
    if (!imovelId) {
      return;
    }
    
    try {
      // Mapear o nome do campo do formulário para o nome do campo na API
      const fieldMapping: Record<string, string> = {
        matricula: 'matricula',
        inscricaoMunicipal: 'inscricao_municipal',
        inscricaoEstadual: 'inscricao_estadual',
        valorComissao: 'valor_comissao',
        tipoComissao: 'tipo_comissao',
        corretorResponsavel: 'corretor_id',
        exclusividade: 'exclusividade',
        dataInicioExclusividade: 'data_inicio_exclusividade',
        dataFimExclusividade: 'data_fim_exclusividade',
        observacoesPrivadas: 'observacoes_privadas'
      };
      
      const apiField = fieldMapping[field];
      if (!apiField) {
        return;
      }
      
      // Criar payload com apenas o campo alterado
      const payload: Record<string, any> = {};
      
      // Tratamento especial para cada tipo de campo
      if (field === 'corretorResponsavel') {
        // Converter para número para o campo corretor_id; enviar null quando vazio
        payload[apiField] = value ? Number(value) : null;
      } 
      else if (field === 'exclusividade') {
        // Converter exclusividade para booleano
        payload[apiField] = value === 'sim';
      }
      else {
        // Para os demais campos, usar o valor como está
        payload[apiField] = value;
      }
      
      await ImovelService.updateEtapaDadosPrivativos(imovelId, payload);
    } catch (error) {
      // Falha silenciosa; o usuário pode tentar novamente
    }
  };
  
  // Função de debounce para evitar chamadas excessivas à API
  const debounceSave = (field: string, value: string) => {
    // Cancelar timeout anterior se existir
    if (savingTimeoutsRef.current[field]) {
      clearTimeout(savingTimeoutsRef.current[field] as NodeJS.Timeout);
    }
    
    // Configurar novo timeout
    savingTimeoutsRef.current[field] = setTimeout(() => {
      salvarNaAPI(field, value);
      // Limpar a referência após executar
      delete savingTimeoutsRef.current[field];
    }, 300); // Debounce de 300ms
  };

  // Função para atualizar os dados do formulário
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Notificar que houve mudança no campo
    onFieldChange?.();
    
    // Salvar na API se houver um ID de imóvel
    if (imovelId) {
      debounceSave(field, value);
    } else {
      // Sem imovelId, não salva
    }
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
                { value: 'PORCENTAGEM', label: 'Porcentagem (%)' },
                { value: 'VALOR', label: 'Valor (R$)' }
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

        
      </div>
    </div>
  );
};

export default DadosPrivativos;
