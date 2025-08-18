import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RadioGroup } from '../ui/RadioGroup';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ImovelService } from '../../services/ImovelService';
import logger from '../../utils/logger';
import { ViaCEPResponse } from '../../utils/cepUtils';
import { LocalidadesService } from '../../services/LocalidadesService';

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
    cidade_id: (initialData?.cidade_id as string) || '',
    bairro: (initialData?.bairro as string) || '',
    bairro_id: (initialData?.bairro_id as string) || '',
    logradouro: (initialData?.logradouro as string) || '',
    numero: (initialData?.numero as string) || '',
    complemento: (initialData?.complemento as string) || '',
    mostrarEnderecoSite: (initialData as any)?.mostrar_endereco === false ? 'nao' : 'sim',
    mostrarNumeroSite: (initialData as any)?.mostrar_numero === false ? 'nao' : 'sim',
    mostrarApenasProximidades: (initialData as any)?.mostrar_proximidades ? 'sim' : 'nao',
    latitude: initialData?.latitude != null ? String(initialData.latitude) : '',
    longitude: initialData?.longitude != null ? String(initialData.longitude) : '',
  });
  
  
  // Estados para controle da busca de CEP
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [cepSuccess, setCepSuccess] = useState(false);
  
  // Estados para validação de latitude e longitude
  const [latitudeError, setLatitudeError] = useState<string | null>(null);
  const [longitudeError, setLongitudeError] = useState<string | null>(null);
  
  // Estados para armazenar dados de cidades e bairros
  const [cidades, setCidades] = useState<{ value: string; label: string; id: number; uf: string }[]>([
    { value: '', label: 'Selecione', id: 0, uf: '' }
  ]);

  // Estado para os bairros filtrados pela cidade selecionada
  const [bairrosFiltrados, setBairrosFiltrados] = useState<{ value: string; label: string; id: number; cidade_id: number }[]>([
    { value: '', label: 'Selecione', id: 0, cidade_id: 0 }
  ]);
  
  
  // Estados para controlar carregamento
  const [loadingLocalidades, setLoadingLocalidades] = useState(true);
  const [loadingBairros, setLoadingBairros] = useState(false);

  // Mapa para pesquisa rápida de cidades e bairros
  const cidadesPorNome = useRef<Record<string, { id: number; uf: string }>>({});
  const bairrosPorNomeECidade = useRef<Record<string, { id: number; cidade_id: number }>>({});

  const savingTimeouts = useRef<Record<string, NodeJS.Timeout | number>>({});
  const toBoolean = (v: string) => v === 'sim';
  const toNumberOrNull = (v: string): number | null => {
    if (!v || v.trim() === '') return null;
    // Não remover pontos, apenas garantir que vírgulas sejam convertidas para pontos
    const num = Number(v.replace(',', '.'));
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
  
  // Função para salvar múltiplos campos de uma vez
  const saveMultipleFields = async (fields: Record<string, string>) => {
    if (!imovelId) return;
    
    try {
      const payload: Record<string, unknown> = {};
      
      // Mapeia os campos para o formato esperado pela API
      Object.entries(fields).forEach(([field, value]) => {
        switch (field) {
          case 'cep': payload.cep = value || null; break;
          case 'estado': payload.uf = value || null; break;
          case 'cidade': payload.cidade = value || null; break;
          case 'cidade_id': payload.cidade_id = value ? Number(value) : null; break; // Adicionar
          case 'bairro': payload.bairro = value || null; break;
          case 'bairro_id': payload.bairro_id = value ? Number(value) : null; break; // Adicionar
          case 'logradouro': payload.logradouro = value || null; break;
          case 'numero': payload.numero = value || null; break;
          case 'complemento': payload.complemento = value || null; break;
          case 'mostrarEnderecoSite': payload.mostrar_endereco = toBoolean(value); break;
          case 'mostrarNumeroSite': payload.mostrar_numero = toBoolean(value); break;
          case 'mostrarApenasProximidades': payload.mostrar_proximidades = toBoolean(value); break;
          case 'latitude': payload.latitude = toNumberOrNull(value); break;
          case 'longitude': payload.longitude = toNumberOrNull(value); break;
        }
      });
      
      // Envia todos os campos de uma vez
      await ImovelService.updateEtapaLocalizacao(imovelId, payload);
      logger.info(`[LOCALIZACAO] Múltiplos campos atualizados com sucesso.`);
      return true;
    } catch (error) {
      logger.error(`[LOCALIZACAO] Erro ao atualizar múltiplos campos:`, error);
      return false;
    }
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

    // Função para normalizar texto (remover acentos, converter para minúsculas)
  const normalizarTexto = (texto: string): string => {
    return texto.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '');
  };

  // Função para carregar cidades quando a UF mudar
  const handleUFChange = async (uf: string) => {
    handleChange('estado', uf);
    // Limpar cidade e bairro ao mudar UF
    handleChange('cidade', '');
    handleChange('cidade_id', '');
    handleChange('bairro', '');
    handleChange('bairro_id', '');
    
    // Resetar o select visual de bairros
    setBairrosFiltrados([{ value: '', label: 'Selecione', id: 0, cidade_id: 0 }]);
    
    if (!uf) return;
    
    setLoadingLocalidades(true);
    try {
      
      const cidadesResponse = await LocalidadesService.getCidadesPorUF(uf);
      
      // Determinar o formato da resposta e extrair o array de cidades
      let cidadesArray;
      
      if (Array.isArray(cidadesResponse)) {
        // Resposta é um array direto
        cidadesArray = cidadesResponse;
      } else if (cidadesResponse?.data && Array.isArray(cidadesResponse.data)) {
        // Resposta é um objeto com propriedade data contendo um array
        cidadesArray = cidadesResponse.data;
      } else {
        // Formato não reconhecido
        cidadesArray = null;
      }
      
      if (cidadesArray && cidadesArray.length > 0) {
        
        // Mapear dados para o formato esperado pelo select
        const cidadesUF = [
          { value: '', label: 'Selecione', id: 0, uf: '' },
          ...cidadesArray.map(cidade => ({
            value: cidade.value || '',
            label: cidade.label || '',
            id: parseInt(cidade.value || '0'),
            uf: uf
          }))
        ];
        
        setCidades(cidadesUF);
        
        // Criar mapa de cidades para pesquisa rápida
        const mapaCidades: Record<string, { id: number; uf: string }> = {};
        cidadesArray.forEach(cidade => {
          if (cidade.label && cidade.value) {
            const chave = normalizarTexto(`${cidade.label}-${uf}`);
            mapaCidades[chave] = { 
              id: parseInt(cidade.value), 
              uf: uf 
            };
          }
        });
        cidadesPorNome.current = mapaCidades;
      } else {
        console.warn('[LOCALIZAÇÃO] Resposta vazia ou formato inesperado:', cidadesResponse);
        setCidades([{ value: '', label: 'Selecione', id: 0, uf: '' }]);
      }
    } catch (error) {
      console.error('[LOCALIZAÇÃO] Erro ao carregar cidades:', error);
      setCidades([{ value: '', label: 'Selecione', id: 0, uf: '' }]);
    } finally {
      setLoadingLocalidades(false);
    }
  };
  
  // Função para carregar cidades e bairros iniciais
  useEffect(() => {
    const carregarLocalidades = async () => {
      // Carregar cidades da UF inicial (MG por padrão)
      const ufInicial = formData.estado || 'MG';
      
      // Evitar chamada direta ao handleUFChange para prevenir chamadas duplicadas
      if (!ufInicial) return;
      
      setLoadingLocalidades(true);
      try {
        const cidadesResponse = await LocalidadesService.getCidadesPorUF(ufInicial);
        
        // Determinar o formato da resposta e extrair o array de cidades
        let cidadesArray;
        
        if (Array.isArray(cidadesResponse)) {
          // Resposta é um array direto
          cidadesArray = cidadesResponse;
        } else if (cidadesResponse?.data && Array.isArray(cidadesResponse.data)) {
          // Resposta é um objeto com propriedade data contendo um array
          cidadesArray = cidadesResponse.data;
        } else {
          // Formato não reconhecido
          cidadesArray = null;
        }
        
        if (cidadesArray && cidadesArray.length > 0) {
          
          // Mapear dados para o formato esperado pelo select
          const cidadesUF = [
            { value: '', label: 'Selecione', id: 0, uf: '' },
            ...cidadesArray.map(cidade => ({
              value: cidade.value || '',
              label: cidade.label || '',
              id: parseInt(cidade.value || '0'),
              uf: ufInicial
            }))
          ];
          
          setCidades(cidadesUF);
          
          // Criar mapa de cidades para pesquisa rápida
          const mapaCidades: Record<string, { id: number; uf: string }> = {};
          cidadesArray.forEach(cidade => {
            if (cidade.label && cidade.value) {
              const chave = normalizarTexto(`${cidade.label}-${ufInicial}`);
              mapaCidades[chave] = { 
                id: parseInt(cidade.value), 
                uf: ufInicial 
              };
            }
          });
          cidadesPorNome.current = mapaCidades;
          
          // Carregar bairros iniciais se houver cidade_id nos dados iniciais
          const cidadeId = initialData?.cidade_id ? Number(initialData.cidade_id) : 0;
          if (cidadeId > 0) {
            // Se houver um bairro_id nos dados iniciais, passar para a função carregarBairros
            const bairroId = initialData?.bairro_id ? String(initialData.bairro_id) : '';
            const bairroNome = initialData?.bairro ? String(initialData.bairro) : '';
            
            // Carregar bairros já passando o bairro selecionado para evitar duplicação
            await carregarBairros(cidadeId, bairroId, bairroNome);
          }
        } else {
          console.warn('[LOCALIZAÇÃO] Resposta vazia ou formato inesperado:', cidadesResponse);
          setCidades([{ value: '', label: 'Selecione', id: 0, uf: '' }]);
        }
      } catch (error) {
        console.error('[LOCALIZAÇÃO] Erro ao carregar cidades:', error);
        setCidades([{ value: '', label: 'Selecione', id: 0, uf: '' }]);
      } finally {
        setLoadingLocalidades(false);
      }
    };
    
    carregarLocalidades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Função para carregar bairros por cidade
  const carregarBairros = async (cidadeId: number, bairroIdSelecionado?: string, bairroNomeSelecionado?: string) => {
    console.log('[LOCALIZAÇÃO] carregarBairros - Iniciando com:', { cidadeId, bairroIdSelecionado, bairroNomeSelecionado });
    
    if (!cidadeId) {
      console.log('[LOCALIZAÇÃO] carregarBairros - Cidade ID inválido, retornando apenas "Selecione"');
      setBairrosFiltrados([{ value: '', label: 'Selecione', id: 0, cidade_id: 0 }]);
      return;
    }
    
    setLoadingBairros(true);
    try {
      const bairrosResponse = await LocalidadesService.getBairrosPorCidade(cidadeId);
      
      // Determinar o formato da resposta e extrair o array de bairros
      let bairrosArray;
      
      if (Array.isArray(bairrosResponse)) {
        // Resposta é um array direto
        bairrosArray = bairrosResponse;
      } else if (bairrosResponse?.data && Array.isArray(bairrosResponse.data)) {
        // Resposta é um objeto com propriedade data contendo um array
        bairrosArray = bairrosResponse.data;
      } else {
        // Formato não reconhecido
        bairrosArray = null;
      }
      
      if (bairrosArray && bairrosArray.length > 0) {
        console.log(`[LOCALIZAÇÃO] carregarBairros - Encontrados ${bairrosArray.length} bairros para a cidade ID ${cidadeId}`);
        
        // Criar lista de bairros para o dropdown
        const bairrosOptions = [
          { value: '', label: 'Selecione', id: 0, cidade_id: 0 },
          ...bairrosArray.map(bairro => ({
            value: bairro.value || '',
            label: bairro.label || '',
            id: parseInt(bairro.value || '0'),
            cidade_id: cidadeId
          }))
        ];
        
        console.log('[LOCALIZAÇÃO] carregarBairros - Substituindo estado de bairros:', { 
          antigos: bairrosFiltrados.length, 
          novos: bairrosOptions.length 
        });
        
        // Substituir completamente o estado anterior para evitar duplicações
        setBairrosFiltrados(bairrosOptions);
        
        // Atualizar o mapa de bairros por nome e cidade para pesquisa rápida
        const mapaBairros: Record<string, { id: number; cidade_id: number }> = {};
        bairrosArray.forEach(bairro => {
          if (bairro.label && bairro.value) {
            const chave = normalizarTexto(`${bairro.label}-${cidadeId}`);
            mapaBairros[chave] = { 
              id: parseInt(bairro.value), 
              cidade_id: cidadeId 
            };
          }
        });
        bairrosPorNomeECidade.current = mapaBairros;
        console.log(`[LOCALIZAÇÃO] carregarBairros - Cache de bairros atualizado com ${Object.keys(mapaBairros).length} entradas`);
        
        // Se temos um bairro selecionado (ID e nome), verificar se ele está na lista
        // Se não estiver, adicioná-lo para evitar perder a seleção
        if (bairroIdSelecionado && bairroNomeSelecionado) {
          const bairroIdInt = parseInt(bairroIdSelecionado);
          const bairroExistente = bairrosOptions.find(b => b.id === bairroIdInt || b.value === bairroIdSelecionado);
          
          console.log('[LOCALIZAÇÃO] carregarBairros - Verificando bairro selecionado:', { 
            bairroIdSelecionado, 
            bairroNomeSelecionado, 
            bairroExistente: !!bairroExistente 
          });
          
          if (!bairroExistente && bairroIdInt > 0) {
            console.log('[LOCALIZAÇÃO] carregarBairros - Adicionando bairro selecionado à lista');
            
            // Adicionar o bairro selecionado à lista se não estiver presente
            setBairrosFiltrados(prev => [
              ...prev,
              { 
                value: bairroIdSelecionado, 
                label: bairroNomeSelecionado, 
                id: bairroIdInt,
                cidade_id: cidadeId
              }
            ]);
            
            // Adicionar ao mapa de bairros também
            const chave = normalizarTexto(`${bairroNomeSelecionado}-${cidadeId}`);
            const novoMapaBairros = { ...bairrosPorNomeECidade.current };
            novoMapaBairros[chave] = { id: bairroIdInt, cidade_id: cidadeId };
            bairrosPorNomeECidade.current = novoMapaBairros;
            console.log('[LOCALIZAÇÃO] carregarBairros - Bairro adicionado ao cache com chave:', chave);
          }
        }
      } else {
        // Se não houver bairros, mostrar apenas a opção "Selecione"
        setBairrosFiltrados([{ value: '', label: 'Selecione', id: 0, cidade_id: 0 }]);
      }
    } catch (error) {
      console.error('[LOCALIZAÇÃO] Erro ao carregar bairros:', error);
      setBairrosFiltrados([{ value: '', label: 'Selecione', id: 0, cidade_id: 0 }]);
    } finally {
      setLoadingBairros(false);
    }
  };
  
  // Handler para mudança de cidade
  const handleCidadeChange = async (cidadeId: number, cidadeNome: string) => {
    if (!cidadeId) {
      setBairrosFiltrados([{ value: '', label: 'Selecione', id: 0, cidade_id: 0 }]);
      setFormData(prev => ({
        ...prev,
        cidade_id: '',
        bairro: '',
        bairro_id: ''
      }));
      
      onFieldChange?.();
      
      if (imovelId) {
        saveFieldWithDebounce('cidade', '');
        saveFieldWithDebounce('cidade_id', '');
        saveFieldWithDebounce('bairro', '');
        saveFieldWithDebounce('bairro_id', '');
      }
      return;
    }
    
    // Atualizar formData com a cidade selecionada
    setFormData(prev => ({
      ...prev,
      cidade: cidadeNome,
      cidade_id: cidadeId.toString(),
      bairro: '',
      bairro_id: ''
    }));
    
    onFieldChange?.();
    
    if (imovelId) {
      saveFieldWithDebounce('cidade', cidadeNome);
      saveFieldWithDebounce('cidade_id', cidadeId.toString());
      saveFieldWithDebounce('bairro', '');
      saveFieldWithDebounce('bairro_id', '');
    }
    
    // Carregar bairros para a cidade selecionada
    // Passamos strings vazias para bairroId e bairroNome para evitar adicionar bairro duplicado
    await carregarBairros(cidadeId, '', '');
  };
  
  // Handler para mudança de bairro
  const handleBairroChange = (bairroValue: string) => {
    // Atualizar o campo bairro (texto) e bairro_id
    const bairroSelecionado = bairrosFiltrados.find(b => b.value === bairroValue);
    
    if (bairroSelecionado) {
      handleChange('bairro', bairroSelecionado.label);
      handleChange('bairro_id', bairroValue);
    } else {
      handleChange('bairro', '');
      handleChange('bairro_id', '');
    }
  };
  
  // Removido o useEffect que observava formData.cidade_id para evitar chamadas duplicadas
  // O carregamento de bairros agora é feito apenas no handleCidadeChange

  // Atualiza os dados do formulário quando há mudanças
  // Removemos onUpdate da lista de dependências para evitar o loop infinito
  useEffect(() => {
    // Chamamos onUpdate apenas quando formData mudar
    onUpdate(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Função para atualizar os dados do formulário
  const handleChange = async (field: string, value: string) => {
    // Limpa mensagens de erro e sucesso ao alterar qualquer campo
    if (field === 'cep') {
      setCepError(null);
      setCepSuccess(false);
    }
    
    // Validação especial para latitude e longitude
    if (field === 'latitude' || field === 'longitude') {
      // Limpar mensagens de erro anteriores
      if (field === 'latitude') {
        setLatitudeError(null);
      } else {
        setLongitudeError(null);
      }
      
      // Permitir apenas números, ponto, vírgula e sinal de negativo no início
      const valorLimpo = value.replace(/[^0-9.,\-]/g, '');
      
      // Garantir que o sinal de negativo só apareça no início
      let valorTratado = valorLimpo;
      if (valorLimpo.includes('-') && valorLimpo.indexOf('-') > 0) {
        valorTratado = valorLimpo.replace(/-/g, '');
      }
      
      // Verificar se há mais de um ponto ou vírgula
      const temPonto = valorTratado.includes('.');
      const temVirgula = valorTratado.includes(',');
      
      // Se já tem ponto, não permitir vírgula e vice-versa
      let valorFormatado = valorTratado;
      if (temPonto && temVirgula) {
        // Manter apenas o ponto
        valorFormatado = valorTratado.replace(/,/g, '');
      }
      
      // Converter vírgula para ponto
      valorFormatado = valorFormatado.replace(',', '.');
      
      // Validar intervalo
      const num = Number(valorFormatado);
      if (!isNaN(num)) {
        if (field === 'latitude' && (num < -90 || num > 90)) {
          
          setLatitudeError('A latitude deve estar entre -90 e 90');
          
          // Ainda atualiza o campo para mostrar o que foi digitado
          setFormData(prev => ({
            ...prev,
            [field]: valorFormatado
          }));
          
          // Notificar que houve mudança no campo
          onFieldChange?.();
          return;
        } else if (field === 'longitude' && (num < -180 || num > 180)) {
          
          setLongitudeError('A longitude deve estar entre -180 e 180');
          
          // Ainda atualiza o campo para mostrar o que foi digitado
          setFormData(prev => ({
            ...prev,
            [field]: valorFormatado
          }));
          
          // Notificar que houve mudança no campo
          onFieldChange?.();
          return;
        }
      }
      
      // Atualizar com o valor formatado
      setFormData(prev => ({
        ...prev,
        [field]: valorFormatado
      }));
      
      // Notificar que houve mudança no campo
      onFieldChange?.();
      
      // Salvar o valor formatado
      saveFieldWithDebounce(field, valorFormatado);
      return;
    }
    
    // Para os demais campos, manter o comportamento original
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Notificar que houve mudança no campo
    onFieldChange?.();
    
    // Se for o campo CEP e tiver 8 dígitos, busca o endereço automaticamente
    if (field === 'cep' && value.length === 8) {
      await buscarEnderecoPorCEP(value);
    } else {
      // Para outros campos, salva normalmente
      saveFieldWithDebounce(field, value);
    }
  };

  // Função para processar dados retornados da API ViaCEP usando o cache local
  const processarDadosCEP = async (dadosCEP: ViaCEPResponse) => {
    console.log('[LOCALIZAÇÃO] processarDadosCEP - Iniciando com dados:', { 
      localidade: dadosCEP?.localidade, 
      bairro: dadosCEP?.bairro, 
      uf: dadosCEP?.uf 
    });
    
    if (!dadosCEP || dadosCEP.erro) {
      console.log('[LOCALIZAÇÃO] processarDadosCEP - Dados inválidos ou com erro');
      return;
    }
    
    // Dados temporários para atualização em lote após todas as operações
    const dadosAtualizados: Record<string, any> = {
      cep: formData.cep,
      estado: dadosCEP.uf,
      cidade: dadosCEP.localidade, // Nome da cidade como texto
      bairro: dadosCEP.bairro,     // Nome do bairro como texto
      logradouro: dadosCEP.logradouro
    };
    
    // Atualizar UF diretamente sem chamar handleUFChange
    // para evitar chamada duplicada à API
    handleChange('estado', dadosCEP.uf);
    
    // Verificar se já temos as cidades carregadas para esta UF
    // Se não tivermos, precisamos carregá-las
    const ufAtual = dadosCEP.uf;
    const temCidadesDaUF = cidades.some(c => c.uf === ufAtual && c.id > 0);
    
    if (!temCidadesDaUF) {
      // Carregar cidades apenas se não tivermos cidades para esta UF
      
      setLoadingLocalidades(true);
      try {
        const cidadesResponse = await LocalidadesService.getCidadesPorUF(ufAtual);
        
        // Determinar o formato da resposta e extrair o array de cidades
        let cidadesArray;
        
        if (Array.isArray(cidadesResponse)) {
          cidadesArray = cidadesResponse;
        } else if (cidadesResponse?.data && Array.isArray(cidadesResponse.data)) {
          cidadesArray = cidadesResponse.data;
        } else {
          cidadesArray = null;
        }
        
        if (cidadesArray && cidadesArray.length > 0) {
          const cidadesUF = [
            { value: '', label: 'Selecione', id: 0, uf: '' },
            ...cidadesArray.map(cidade => ({
              value: cidade.value || '',
              label: cidade.label || '',
              id: parseInt(cidade.value || '0'),
              uf: ufAtual
            }))
          ];
          
          // Substituir completamente o estado anterior para evitar duplicações
          setCidades(cidadesUF);
          
          // Atualizar cache de cidades
          const mapaCidades: Record<string, { id: number; uf: string }> = {};
          cidadesArray.forEach(cidade => {
            if (cidade.label && cidade.value) {
              const chave = normalizarTexto(`${cidade.label}-${ufAtual}`);
              mapaCidades[chave] = { 
                id: parseInt(cidade.value), 
                uf: ufAtual 
              };
            }
          });
          cidadesPorNome.current = mapaCidades;
        }
      } catch (error) {
        console.error('[LOCALIZAÇÃO] Erro ao carregar cidades no processamento de CEP:', error);
      } finally {
        setLoadingLocalidades(false);
      }
    }
    
    // Normalizar os nomes para pesquisa no cache
    const nomeCidadeNormalizado = normalizarTexto(`${dadosCEP.localidade}-${dadosCEP.uf}`);
    
    // Verificar se a cidade existe no cache
    let cidadeId = 0;
    if (cidadesPorNome.current[nomeCidadeNormalizado]) {
      // Cidade encontrada no cache
      cidadeId = cidadesPorNome.current[nomeCidadeNormalizado].id;
      
      // Verificar se a cidade está na lista de opções do select
      const cidadeExistente = cidades.find(c => c.id === cidadeId || c.value === cidadeId.toString());
      
      console.log('[LOCALIZAÇÃO] processarDadosCEP - Verificando cidade no select:', { 
        cidadeId, 
        cidadeExistente: !!cidadeExistente,
        totalCidades: cidades.length
      });
      
      if (!cidadeExistente && cidadeId > 0) {
        console.log('[LOCALIZAÇÃO] processarDadosCEP - Cidade não encontrada no select, adicionando');
        
        // Se a cidade não estiver na lista, adicioná-la
        // Importante: Substituir completamente o estado para evitar duplicações
        const novasCidades = [
          ...cidades.filter(c => c.id === 0 || (c.id !== cidadeId && c.value !== cidadeId.toString())),
          { 
            value: cidadeId.toString(), 
            label: dadosCEP.localidade, 
            id: cidadeId,
            uf: dadosCEP.uf 
          }
        ];
        console.log('[LOCALIZAÇÃO] processarDadosCEP - Atualizando lista de cidades:', { 
          antes: cidades.length, 
          depois: novasCidades.length 
        });
        setCidades(novasCidades);
      }
      
      // Atualizar formData diretamente para garantir que o select seja atualizado
      setFormData(prev => ({
        ...prev,
        cidade: dadosCEP.localidade,
        cidade_id: cidadeId.toString()
      }));
      
      // Atualizar os campos separadamente para garantir que os handlers sejam chamados
      handleChange('cidade', dadosCEP.localidade);
      handleChange('cidade_id', cidadeId.toString());
      dadosAtualizados.cidade_id = cidadeId;
      
      // Carregar bairros para a cidade selecionada
      // Importante: Passar strings vazias para evitar adicionar bairros duplicados
      await carregarBairros(cidadeId, '', '');
    } else {
      // Cidade não encontrada, criar nova
      try {
        
        const cidadeResponse = await LocalidadesService.buscarOuCriarCidade({
          nome: dadosCEP.localidade,
          uf: dadosCEP.uf
        });
        
        if (cidadeResponse?.data && cidadeResponse.data.id) {
          cidadeId = cidadeResponse.data.id;
          
          // Adicionar a cidade recém-criada à lista de opções
          // Importante: Substituir completamente o estado para evitar duplicações
          const novasCidades = [
            ...cidades.filter(c => c.id === 0 || (c.id !== cidadeId && c.value !== cidadeId.toString())),
            { 
              value: cidadeId.toString(), 
              label: dadosCEP.localidade, 
              id: cidadeId,
              uf: dadosCEP.uf 
            }
          ];
          setCidades(novasCidades);
          
          // Atualizar formData diretamente
          setFormData(prev => ({
            ...prev,
            cidade: dadosCEP.localidade,
            cidade_id: cidadeId.toString()
          }));
          
          // Atualizar os campos separadamente
          handleChange('cidade', dadosCEP.localidade);
          handleChange('cidade_id', cidadeId.toString());
          dadosAtualizados.cidade_id = cidadeId;
          
          // Atualizar cache de cidades
          const mapaCidades = { ...cidadesPorNome.current };
          mapaCidades[nomeCidadeNormalizado] = { id: cidadeId, uf: dadosCEP.uf };
          cidadesPorNome.current = mapaCidades;
          
          // Carregar bairros para a cidade recém-criada
          // Importante: Passar strings vazias para evitar adicionar bairros duplicados
          await carregarBairros(cidadeId, '', '');
        }
      } catch (error) {
        console.error('[LOCALIZAÇÃO] Erro ao criar cidade:', error);
      }
    }
    
    // Se temos cidade e bairro, verificar se o bairro existe
    if (cidadeId && dadosCEP.bairro) {
      const nomeBairroNormalizado = normalizarTexto(`${dadosCEP.bairro}-${cidadeId}`);
      let bairroId = 0;
      
      if (bairrosPorNomeECidade.current[nomeBairroNormalizado]) {
        // Bairro encontrado no cache
        bairroId = bairrosPorNomeECidade.current[nomeBairroNormalizado].id;
        
        // Verificar se o bairro está na lista de opções do select
        const bairroExistente = bairrosFiltrados.find((b: { id: number; value: string }) => b.id === bairroId || b.value === bairroId.toString());
        
        console.log('[LOCALIZAÇÃO] processarDadosCEP - Verificando bairro no select:', { 
          bairroId, 
          bairroNome: dadosCEP.bairro,
          bairroExistente: !!bairroExistente,
          totalBairros: bairrosFiltrados.length
        });
        
        if (!bairroExistente && bairroId > 0) {
          console.log('[LOCALIZAÇÃO] processarDadosCEP - Bairro não encontrado no select, adicionando');
          
          // Se o bairro não estiver na lista, adicioná-lo
          // Importante: Substituir completamente o estado para evitar duplicações
          const novosBairros = [
            ...bairrosFiltrados.filter(b => b.id === 0 || (b.id !== bairroId && b.value !== bairroId.toString())),
            { 
              value: bairroId.toString(), 
              label: dadosCEP.bairro, 
              id: bairroId,
              cidade_id: cidadeId
            }
          ];
          console.log('[LOCALIZAÇÃO] processarDadosCEP - Atualizando lista de bairros:', { 
            antes: bairrosFiltrados.length, 
            depois: novosBairros.length 
          });
          setBairrosFiltrados(novosBairros);
        }
        
        // Atualizar formData diretamente para garantir que o select seja atualizado
        setFormData(prev => ({
          ...prev,
          bairro: dadosCEP.bairro,
          bairro_id: bairroId.toString()
        }));
        
        // Atualizar os campos separadamente
        handleChange('bairro', dadosCEP.bairro);
        handleChange('bairro_id', bairroId.toString());
        dadosAtualizados.bairro_id = bairroId;
      } else {
        // Bairro não encontrado, criar novo
        try {
          
          // Buscar cidade para obter nome e UF
          const cidadeAtual = cidades.find(c => c.id === cidadeId);
          
          const bairroResponse = await LocalidadesService.buscarOuCriarBairro({
            nome: dadosCEP.bairro,
            cidade_id: cidadeId,
            cidade_nome: cidadeAtual?.label || dadosCEP.localidade,
            uf: cidadeAtual?.uf || dadosCEP.uf
          });
          
          if (bairroResponse?.data && bairroResponse.data.id) {
            bairroId = bairroResponse.data.id;
            
            // Adicionar o bairro recém-criado à lista de opções
            // Importante: Substituir completamente o estado para evitar duplicações
            const novosBairros = [
              ...bairrosFiltrados.filter(b => b.id === 0 || (b.id !== bairroId && b.value !== bairroId.toString())),
              { 
                value: bairroId.toString(), 
                label: dadosCEP.bairro, 
                id: bairroId,
                cidade_id: cidadeId
              }
            ];
            setBairrosFiltrados(novosBairros);
            
            // Atualizar formData diretamente
            setFormData(prev => ({
              ...prev,
              bairro: dadosCEP.bairro,
              bairro_id: bairroId.toString()
            }));
            
            // Atualizar os campos separadamente
            handleChange('bairro', dadosCEP.bairro);
            handleChange('bairro_id', bairroId.toString());
            dadosAtualizados.bairro_id = bairroId;
            
            // Atualizar cache de bairros
            const mapaBairros = { ...bairrosPorNomeECidade.current };
            mapaBairros[nomeBairroNormalizado] = { id: bairroId, cidade_id: cidadeId };
            bairrosPorNomeECidade.current = mapaBairros;
          }
        } catch (error) {
          console.error('[LOCALIZAÇÃO] Erro ao criar bairro:', error);
        }
      }
    }
    
    // Atualizar logradouro
    if (dadosCEP.logradouro) {
      handleChange('logradouro', dadosCEP.logradouro);
    }
    
    // Mover foco para o campo número
    const numeroInput = document.querySelector('input[name="numero"]');
    if (numeroInput) {
      (numeroInput as HTMLInputElement).focus();
    }
  };

  // Função para buscar endereço por CEP usando a API ViaCEP
  const buscarEnderecoPorCEP = async (cep: string) => {
    // Verifica se o CEP tem 8 dígitos
    if (cep.length !== 8) {
      setCepError('CEP deve conter 8 dígitos');
      return;
    }
    
    // Inicia o loading
    setLoadingCep(true);
    setCepError(null);
    setCepSuccess(false);
    
    try {
      // Busca o endereço na API ViaCEP diretamente
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: ViaCEPResponse = await response.json();
      
      if (data.erro) {
        throw new Error('CEP não encontrado.');
      }
      
      // CEP já está sem hífen para a API
      
      // Processar dados do CEP para verificar/criar cidade e bairro
      await processarDadosCEP(data);
      
      // Aguardar um momento para garantir que todas as atualizações de estado foram aplicadas
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // IMPORTANTE: Coletar os dados ATUALIZADOS após o processamento
      // Usar os dados do ViaCEP diretamente, com os IDs obtidos do processamento
      const dadosAtualizados = {
        cep: cep,
        estado: data.uf,
        cidade: data.localidade,
        bairro: data.bairro,
        logradouro: data.logradouro,
        cidade_id: formData.cidade_id,
        bairro_id: formData.bairro_id
      };
      
      // Salvar todos os campos atualizados de uma vez
      if (imovelId) {
        await saveMultipleFields(dadosAtualizados);
      }
      
      // Indica sucesso na busca
      setCepSuccess(true);
      
      // Notifica que houve mudança nos campos
      onFieldChange?.();
      
    } catch (error) {
      // Em caso de erro, exibe a mensagem
      if (error instanceof Error) {
        setCepError(error.message);
      } else {
        setCepError('Erro ao buscar CEP');
      }
      logger.error('[LOCALIZACAO] Erro ao buscar CEP:', error);
    } finally {
      // Finaliza o loading
      setLoadingCep(false);
    }
  };
  
  // Função para buscar CEP manualmente (botão de fallback)
  const buscarCEPManual = async () => {
    if (formData.cep.length === 8) {
      await buscarEnderecoPorCEP(formData.cep);
    }
  };

  // Função para pegar localização atual
  const pegarLocalizacaoAtual = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Limpar mensagens de erro
        setLatitudeError(null);
        setLongitudeError(null);
        
        // Formatar valores com ponto decimal (até 8 casas decimais)
        const latFormatado = lat.toFixed(8);
        const lngFormatado = lng.toFixed(8);
        
        setFormData(prev => ({
          ...prev,
          latitude: latFormatado,
          longitude: lngFormatado
        }));
        
        // Salvar coordenadas se houver um imóvel
        if (imovelId) {
          saveMultipleFields({
            latitude: latFormatado,
            longitude: lngFormatado
          });
        }
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
        <div className="flex space-x-3">
          <div className="flex-1">
            <div>
              <Input
                label="CEP *"
                placeholder="00000-000"
                value={formData.cep}
                onChange={(e) => handleChange('cep', e.target.value.replace(/\D/g, ''))}
                maxLength={8}
                required
                error={cepError || undefined}
              />
              {cepSuccess && (
                <p className="text-xs text-green-600 mt-1">CEP encontrado com sucesso!</p>
              )}
            </div>
          </div>
          <div className="flex items-start pt-6">
            <Button 
              variant="secondary"
              onClick={buscarCEPManual}
              disabled={formData.cep.length !== 8 || loadingCep}
            >
              {loadingCep ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                'Buscar'
              )}
            </Button>
          </div>
        </div>

        <div>
          <Select
            label="Estado *"
            options={estados}
            value={formData.estado}
            onChange={(e) => handleUFChange(e.target.value)}
            disabled={loadingLocalidades}
          />
          {loadingLocalidades && (
            <p className="text-xs text-blue-600 mt-1 flex items-center">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Carregando cidades...
            </p>
          )}
        </div>
        <div>
          <Select
            label="Cidade"
            name="cidade_id"
            value={formData.cidade_id || ''}
            onChange={(e) => {
              const cidadeId = parseInt(e.target.value) || 0;
              const cidadeSelecionada = cidades.find(c => c.value === e.target.value);
              const cidadeNome = cidadeSelecionada?.label || '';
              handleCidadeChange(cidadeId, cidadeNome);
            }}
            options={cidades}
            disabled={loadingLocalidades}
          />
        </div>
        <div>
          <Select
            label="Bairro"
            name="bairro_id"
            value={formData.bairro_id || ''}
            onChange={(e) => handleBairroChange(e.target.value)}
            options={bairrosFiltrados}
            disabled={loadingBairros}
          />
          {loadingBairros && (
            <p className="text-xs text-blue-600 mt-1 flex items-center">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Carregando bairros...
            </p>
          )}
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
                error={latitudeError || undefined}
              />
            </div>
            <div>
              <Input
                label="Longitude"
                placeholder="Ex: -46.6333"
                value={formData.longitude}
                onChange={(e) => handleChange('longitude', e.target.value)}
                error={longitudeError || undefined}
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
