import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RadioGroup } from '../ui/RadioGroup';
import { MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { ImovelService } from '../../services/ImovelService';
import logger from '../../utils/logger';

interface LocalizacaoProps {
  onUpdate: (data: any) => void;
  onFieldChange?: () => void;
  imovelId?: number;
  initialData?: Record<string, unknown>;
}

const Localizacao: React.FC<LocalizacaoProps> = ({ onUpdate, onFieldChange, imovelId, initialData }) => {
  const [formData, setFormData] = useState({
    cep: (initialData?.cep as string) || '',
    estado: (initialData?.uf as string) || '',
    cidade: (initialData?.cidade as string) || '',
    bairro: (initialData?.bairro as string) || '',
    logradouro: (initialData?.logradouro as string) || '',
    numero: (initialData?.numero as string) || '',
    complemento: (initialData?.complemento as string) || '',
    mostrarEnderecoSite: (initialData as any)?.mostrar_endereco === false ? 'nao' : 'sim',
    mostrarNumeroSite: (initialData as any)?.mostrar_numero === false ? 'nao' : 'sim',
    mostrarApenasProximidades: (initialData as any)?.mostrar_proximidades ? 'sim' : 'nao',
    latitude: initialData?.latitude != null ? String(initialData.latitude) : '',
    longitude: initialData?.longitude != null ? String(initialData.longitude) : '',
  });

  const savingTimeouts = useRef<Record<string, NodeJS.Timeout | number>>({});
  const toBoolean = (v: string) => v === 'sim';
  const toNumberOrNull = (v: string): number | null => {
    if (!v || v.trim() === '') return null;
    const num = Number(v.replace(/\./g, '').replace(',', '.'));
    return isNaN(num) ? null : num;
  };

  const saveFieldWithDebounce = (field: string, value: string) => {
    if (!imovelId) return;
    if (savingTimeouts.current[field]) clearTimeout(savingTimeouts.current[field] as number);
    savingTimeouts.current[field] = setTimeout(async () => {
      try {
        const payload: Record<string, unknown> = {};
        switch (field) {
          case 'cep': payload.cep = value || null; break;
          case 'estado': payload.uf = value || null; break;
          case 'cidade': payload.cidade = value || null; break;
          case 'bairro': payload.bairro = value || null; break;
          case 'logradouro': payload.logradouro = value || null; break;
          case 'numero': payload.numero = value || null; break;
          case 'complemento': payload.complemento = value || null; break;
          case 'mostrarEnderecoSite': payload.mostrar_endereco = toBoolean(value); break;
          case 'mostrarNumeroSite': payload.mostrar_numero = toBoolean(value); break;
          case 'mostrarApenasProximidades': payload.mostrar_proximidades = toBoolean(value); break;
          case 'latitude': payload.latitude = toNumberOrNull(value); break;
          case 'longitude': payload.longitude = toNumberOrNull(value); break;
          default: return;
        }
        await ImovelService.updateEtapaLocalizacao(imovelId, payload);
        logger.info(`[LOCALIZACAO] Campo ${field} atualizado com sucesso.`);
      } catch (error) {
        logger.error(`[LOCALIZACAO] Erro ao atualizar campo ${field}:`, error);
      }
    }, 300);
  };

  // Lista de estados (UF)
  const estados = [
    { value: '', label: 'Selecione' },
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' },
  ];

  // Lista de cidades (simulação - seria preenchida dinamicamente com base no estado)
  const cidades = [
    { value: '', label: 'Selecione' },
    { value: 'sao-paulo', label: 'São Paulo' },
    { value: 'rio-de-janeiro', label: 'Rio de Janeiro' },
    { value: 'belo-horizonte', label: 'Belo Horizonte' },
    { value: 'brasilia', label: 'Brasília' },
    { value: 'salvador', label: 'Salvador' },
    { value: 'fortaleza', label: 'Fortaleza' },
    { value: 'recife', label: 'Recife' },
    { value: 'porto-alegre', label: 'Porto Alegre' },
    { value: 'curitiba', label: 'Curitiba' },
    { value: 'manaus', label: 'Manaus' },
  ];

  // Lista de bairros (simulação - seria preenchida dinamicamente com base na cidade)
  const bairros = [
    { value: '', label: 'Selecione' },
    { value: 'centro', label: 'Centro' },
    { value: 'jardins', label: 'Jardins' },
    { value: 'moema', label: 'Moema' },
    { value: 'ipanema', label: 'Ipanema' },
    { value: 'leblon', label: 'Leblon' },
    { value: 'copacabana', label: 'Copacabana' },
    { value: 'barra-da-tijuca', label: 'Barra da Tijuca' },
    { value: 'savassi', label: 'Savassi' },
    { value: 'boa-viagem', label: 'Boa Viagem' },
    { value: 'meireles', label: 'Meireles' },
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
    saveFieldWithDebounce(field, value);
  };

  // Função para buscar CEP (simulação)
  const buscarCEP = () => {
    // Simulação de busca de CEP
    if (formData.cep.length === 8) {
      // Dados simulados para demonstração
      setFormData(prev => ({
        ...prev,
        estado: 'SP',
        cidade: 'sao-paulo',
        bairro: 'jardins',
        logradouro: 'Rua Oscar Freire'
      }));
    }
  };

  // Função para pegar localização atual (simulação)
  const pegarLocalizacaoAtual = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
      }, () => {
        alert('Não foi possível obter sua localização atual.');
      });
    } else {
      alert('Seu navegador não suporta geolocalização.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-title font-semibold mb-4">Localização</h2>
      <p className="text-neutral-gray-medium mb-6">
        Defina a localização do imóvel.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Input
              label="CEP *"
              placeholder="00000-000"
              value={formData.cep}
              onChange={(e) => handleChange('cep', e.target.value.replace(/\D/g, ''))}
              maxLength={8}
              required
            />
          </div>
          <div className="pb-1">
            <Button 
              variant="secondary"
              onClick={buscarCEP}
              disabled={formData.cep.length !== 8}
            >
              Buscar
            </Button>
          </div>
        </div>

        <div>
          <Select
            label="Estado *"
            options={estados}
            value={formData.estado}
            onChange={(e) => handleChange('estado', e.target.value)}
            required
          />
        </div>

        <div>
          <Select
            label="Cidade *"
            options={cidades}
            value={formData.cidade}
            onChange={(e) => handleChange('cidade', e.target.value)}
            required
          />
        </div>

        <div>
          <Select
            label="Bairro *"
            options={bairros}
            value={formData.bairro}
            onChange={(e) => handleChange('bairro', e.target.value)}
            required
          />
        </div>

        <div>
          <Input
            label="Logradouro *"
            placeholder="Rua, Avenida, etc."
            value={formData.logradouro}
            onChange={(e) => handleChange('logradouro', e.target.value)}
            required
          />
        </div>

        <div>
          <Input
            label="Número *"
            placeholder="Digite o número"
            value={formData.numero}
            onChange={(e) => handleChange('numero', e.target.value)}
            required
          />
        </div>

        <div>
          <Input
            label="Complemento"
            placeholder="Apto, Bloco, etc."
            value={formData.complemento}
            onChange={(e) => handleChange('complemento', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Mostrar endereço no site?
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="mostrarEnderecoSite"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.mostrarEnderecoSite}
              onChange={(value) => handleChange('mostrarEnderecoSite', value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Mostrar número no site?
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="mostrarNumeroSite"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.mostrarNumeroSite}
              onChange={(value) => handleChange('mostrarNumeroSite', value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Mostrar apenas proximidades?
          </label>
          <div className="flex space-x-4">
            <RadioGroup
              name="mostrarApenasProximidades"
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' }
              ]}
              value={formData.mostrarApenasProximidades}
              onChange={(value) => handleChange('mostrarApenasProximidades', value)}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Coordenadas GPS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Latitude"
                placeholder="Ex: -23.5505"
                value={formData.latitude}
                onChange={(e) => handleChange('latitude', e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Longitude"
                placeholder="Ex: -46.6333"
                value={formData.longitude}
                onChange={(e) => handleChange('longitude', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-3">
            <Button 
              variant="secondary"
              className="flex items-center"
              onClick={pegarLocalizacaoAtual}
            >
              <MapPin size={16} className="mr-2" />
              Pegar localização atual
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Localizacao;
