import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { InputMask } from '../ui/InputMask';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { RadioGroup } from '../ui/RadioGroup';
import ClienteService, { Cliente, ClienteCategoria, ClienteOrigemCaptacao } from '../../services/ClienteService';
import Toast, { ToastType } from '../ui/Toast';

const ClienteCadastroCompleto: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tipoPessoa, setTipoPessoa] = useState('fisica');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const loadedOnceRef = useRef(false);

  // Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<ToastType>('info');
  const showToast = (message: string, type: ToastType = 'info') => {
    setToastMsg(message);
    setToastType(type);
    setToastOpen(true);
  };

  // Estados dos campos suportados no backend
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [origemCaptacao, setOrigemCaptacao] = useState<ClienteOrigemCaptacao | ''>('');
  const [categoria, setCategoria] = useState<ClienteCategoria | ''>('');

  // Endereço (UI + ViaCEP)
  const [cep, setCep] = useState('');
  const [pais, setPais] = useState('Brasil');
  const [uf, setUf] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [cepSuccess, setCepSuccess] = useState(false);

  // Tipo de Pessoa - estados e helpers
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [rgIe, setRgIe] = useState('');
  const [dataNascimento, setDataNascimento] = useState(''); // dd/mm/yyyy
  const [profissao, setProfissao] = useState('');
  const [estadoCivil, setEstadoCivil] = useState('');
  const [rendaMensal, setRendaMensal] = useState(''); // R$ 0,00
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [dataFundacao, setDataFundacao] = useState(''); // dd/mm/yyyy
  const [ramoAtividade, setRamoAtividade] = useState('');

  const onlyDigits = (s: string) => s.replace(/\D/g, '');
  const toIsoDate = (ptbr: string): string | undefined => {
    const m = ptbr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return undefined;
    const [_, d, mo, y] = m;
    return `${y}-${mo}-${d}`;
  };
  const currencyPtBrToNumber = (s: string): number | undefined => {
    if (!s) return undefined;
    const n = s.replace(/[^0-9,]/g, '').replace(/\./g, '').replace(',', '.');
    const v = Number(n);
    return isNaN(v) ? undefined : v;
  };

  // Opções para os selects
  const origemOptions = [
    { value: '', label: 'Selecione' },
    { value: 'site', label: 'Site' },
    { value: 'indicacao', label: 'Indicação' },
    { value: 'redes_sociais', label: 'Redes Sociais' },
    { value: 'anuncio', label: 'Anúncio' },
    { value: 'outro', label: 'Outro' },
  ];

  const categoriaOptions = [
    { value: '', label: 'Selecione' },
    { value: 'cliente', label: 'Cliente' },
    { value: 'prospecto', label: 'Prospecto' },
    { value: 'lead', label: 'Lead' },
  ];

  const estadoCivilOptions = [
    { value: '', label: 'Selecione' },
    { value: 'solteiro', label: 'Solteiro(a)' },
    { value: 'casado', label: 'Casado(a)' },
    { value: 'divorciado', label: 'Divorciado(a)' },
    { value: 'viuvo', label: 'Viúvo(a)' },
    { value: 'uniao_estavel', label: 'União Estável' },
  ];

  const ufOptions = [
    { value: '', label: 'Selecione' },
    { value: 'AC', label: 'AC' },
    { value: 'AL', label: 'AL' },
    { value: 'AP', label: 'AP' },
    { value: 'AM', label: 'AM' },
    { value: 'BA', label: 'BA' },
    { value: 'CE', label: 'CE' },
    { value: 'DF', label: 'DF' },
    { value: 'ES', label: 'ES' },
    { value: 'GO', label: 'GO' },
    { value: 'MA', label: 'MA' },
    { value: 'MT', label: 'MT' },
    { value: 'MS', label: 'MS' },
    { value: 'MG', label: 'MG' },
    { value: 'PA', label: 'PA' },
    { value: 'PB', label: 'PB' },
    { value: 'PR', label: 'PR' },
    { value: 'PE', label: 'PE' },
    { value: 'PI', label: 'PI' },
    { value: 'RJ', label: 'RJ' },
    { value: 'RN', label: 'RN' },
    { value: 'RS', label: 'RS' },
    { value: 'RO', label: 'RO' },
    { value: 'RR', label: 'RR' },
    { value: 'SC', label: 'SC' },
    { value: 'SP', label: 'SP' },
    { value: 'SE', label: 'SE' },
    { value: 'TO', label: 'TO' },
  ];

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      if (loadedOnceRef.current) return; // evita duplicação no StrictMode
      loadedOnceRef.current = true;
      try {
        setLoading(true);
        const cli = await ClienteService.getCliente(Number(id));
        // Preenche campos suportados
        setNome(cli.nome || '');
        setTelefone(cli.telefone || '');
        setEmail(cli.email || '');
        setOrigemCaptacao((cli.origem_captacao as ClienteOrigemCaptacao) || '');
        setCategoria((cli.categoria as ClienteCategoria) || '');
        // Ajusta tipoPessoa apenas para UI
        if ((cli.tipo || '').toString().toUpperCase() === 'PESSOA_JURIDICA') setTipoPessoa('juridica');
        else setTipoPessoa('fisica');
        // PF/PJ
        setCpfCnpj(cli.cpf_cnpj || '');
        setRgIe(cli.rg_ie || '');
        setDataNascimento(cli.data_nascimento ? (() => { const [y, m, d] = cli.data_nascimento.split('-'); return `${d}/${m}/${y}`; })() : '');
        setProfissao(cli.profissao || '');
        setEstadoCivil((cli.estado_civil as any) || '');
        setRendaMensal(cli.renda_mensal ? `R$ ${Number(cli.renda_mensal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '');
        setRazaoSocial(cli.razao_social || '');
        setNomeFantasia(cli.nome_fantasia || '');
        setDataFundacao(cli.data_fundacao ? (() => { const [y, m, d] = cli.data_fundacao.split('-'); return `${d}/${m}/${y}`; })() : '');
        setRamoAtividade(cli.ramo_atividade || '');
        // Endereço
        setCep((cli.cep || '').replace(/\D/g, '').slice(0, 8));
        setUf(cli.uf || '');
        setCidade(cli.cidade || '');
        setBairro(cli.bairro || '');
        setRua(cli.logradouro || '');
        setNumero(cli.numero || '');
        setComplemento(cli.complemento || '');
        if ((cli as any).pais) setPais((cli as any).pais as string);
      } catch (e) {
        console.error('Erro ao carregar cliente', e);
        showToast('Erro ao carregar cliente.', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (id) {
        await ClienteService.updateCliente(Number(id), {
          nome: nome.trim(),
          telefone: telefone || undefined,
          email: email || undefined,
          categoria: (categoria || undefined) as ClienteCategoria | undefined,
          origem_captacao: (origemCaptacao || undefined) as ClienteOrigemCaptacao | undefined,
        } as Partial<Cliente>);
      } else {
        await ClienteService.createCliente({
          nome: nome.trim(),
          telefone: telefone || undefined,
          email: email || undefined,
          categoria: (categoria || undefined) as ClienteCategoria | undefined,
          origem_captacao: (origemCaptacao || undefined) as ClienteOrigemCaptacao | undefined,
        });
      }
      showToast('Cliente salvo com sucesso.', 'success');
      navigate('/clientes');
    } catch (err) {
      console.error('Erro ao salvar cliente', err);
      showToast('Erro ao salvar cliente.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Autosave com debounce por campo (somente campos suportados no backend)
  const debounceRefs = useRef<Record<string, number | undefined>>({});
  const autoSaveField = (field: keyof Cliente, value: any) => {
    if (!id) return; // autosave só no modo edição
    const key = String(field);
    if (debounceRefs.current[key]) {
      window.clearTimeout(debounceRefs.current[key]);
    }
    debounceRefs.current[key] = window.setTimeout(async () => {
      try {
        await ClienteService.updateCliente(Number(id), { [field]: value } as Partial<Cliente>);
        if (field === 'nome') {
          showToast('Nome salvo automaticamente.', 'success');
        }
      } catch (error) {
        console.error(`Erro ao salvar campo ${key}`, error);
        showToast(`Erro ao salvar ${key}.`, 'error');
      }
    }, 600);
  };

  // Busca CEP (padrão Localizacao.tsx)
  const buscarEnderecoPorCEP = async (cepDigits: string) => {
    if (!cepDigits || cepDigits.length !== 8) return;
    setLoadingCep(true);
    setCepError(null);
    setCepSuccess(false);
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      const data = await resp.json();
      if (data?.erro) {
        setCepError('CEP não encontrado.');
        return;
      }
      const newUf = (data.uf ?? '').toString();
      const newCidade = (data.localidade ?? '').toString();
      const newBairro = (data.bairro ?? '').toString();
      const newRua = (data.logradouro ?? '').toString();
      setUf(newUf);
      setCidade(newCidade);
      setBairro(newBairro);
      setRua(newRua);
      // Autosave dos campos retornados
      if (id) {
        autoSaveField('uf' as any, newUf || undefined);
        autoSaveField('cidade' as any, newCidade || undefined);
        autoSaveField('bairro' as any, newBairro || undefined);
        autoSaveField('logradouro' as any, newRua || undefined);
      }
      setCepSuccess(true);
    } catch (error) {
      console.error('Erro ao consultar ViaCEP', error);
      setCepError('Erro ao consultar CEP.');
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">{id ? 'Editar Cliente' : 'Cadastro Completo de Cliente'}</h1>
          <Button 
            variant="secondary"
            onClick={() => navigate('/clientes')}
          >
            Voltar
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seção: Campos Principais */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Informações Principais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input 
                  label="Nome" 
                  placeholder="Digite o nome completo" 
                  required
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                    autoSaveField('nome', e.target.value.trim());
                  }}
                />
              </div>
              <div>
                <InputMask 
                  label="Telefone" 
                  placeholder="(00) 00000-0000" 
                  mask="(##) #####-####" 
                  value={telefone}
                  onChange={(val: string) => {
                    setTelefone(val);
                    autoSaveField('telefone', val || undefined);
                  }}
                />
              </div>
              <div>
                <Input 
                  label="E-mail" 
                  type="email" 
                  placeholder="email@exemplo.com" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    autoSaveField('email', e.target.value || undefined);
                  }}
                />
              </div>
              <div>
                <Select 
                  label="Origem da captação" 
                  value={origemCaptacao}
                  onChange={(e) => {
                    const v = e.target.value as ClienteOrigemCaptacao | '';
                    setOrigemCaptacao(v);
                    autoSaveField('origem_captacao' as any, v || undefined);
                  }}
                  options={origemOptions} 
                />
              </div>
              <div>
                <Select 
                  label="Categoria" 
                  value={categoria}
                  onChange={(e) => {
                    const v = e.target.value as ClienteCategoria | '';
                    setCategoria(v);
                    autoSaveField('categoria', v || undefined);
                  }}
                  options={categoriaOptions} 
                />
              </div>
            </div>
          </div>

          {/* Seção: Tipo de Pessoa */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Tipo de Pessoa</h2>
            <div className="mb-4">
              <RadioGroup 
                label="Tipo de Pessoa"
                name="tipoPessoa"
                options={[
                  { value: 'fisica', label: 'Pessoa Física' },
                  { value: 'juridica', label: 'Pessoa Jurídica' },
                ]}
                value={tipoPessoa}
                onChange={(value) => {
                  setTipoPessoa(value);
                  autoSaveField('tipo', value === 'juridica' ? 'PESSOA_JURIDICA' : 'PESSOA_FISICA');
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tipoPessoa === 'fisica' ? (
                <>
                  <div>
                    <InputMask 
                      label="CPF" 
                      placeholder="000.000.000-00" 
                      mask="###.###.###-##" 
                      value={cpfCnpj}
                      onChange={(val: string) => {
                        setCpfCnpj(val);
                        autoSaveField('cpf_cnpj', onlyDigits(val) || undefined);
                      }}
                    />
                  </div>
                  <div>
                    <Input 
                      label="RG" 
                      placeholder="Digite o RG" 
                      value={rgIe}
                      onChange={(e) => {
                        setRgIe(e.target.value);
                        autoSaveField('rg_ie', e.target.value || undefined);
                      }}
                    />
                  </div>
                  <div>
                    <InputMask 
                      label="Data de Nascimento" 
                      placeholder="00/00/0000" 
                      mask="##/##/####" 
                      value={dataNascimento}
                      onChange={(val: string) => {
                        setDataNascimento(val);
                        autoSaveField('data_nascimento', toIsoDate(val));
                      }}
                    />
                  </div>
                  <div>
                    <Input 
                      label="Profissão" 
                      placeholder="Digite a profissão" 
                      value={profissao}
                      onChange={(e) => {
                        setProfissao(e.target.value);
                        autoSaveField('profissao', e.target.value || undefined);
                      }}
                    />
                  </div>
                  <div>
                    <Select 
                      label="Estado Civil" 
                      options={estadoCivilOptions} 
                      value={estadoCivil}
                      onChange={(e) => {
                        const v = (e.target.value || '') as any;
                        setEstadoCivil(v);
                        autoSaveField('estado_civil', v || undefined);
                      }}
                    />
                  </div>
                  <div>
                    <InputMask 
                      label="Renda Mensal" 
                      placeholder="R$ 0,00" 
                      mask="R$ #.###.###,##" 
                      value={rendaMensal}
                      onChange={(val: string) => {
                        setRendaMensal(val);
                        const num = currencyPtBrToNumber(val);
                        autoSaveField('renda_mensal', num);
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <InputMask 
                      label="CNPJ" 
                      placeholder="00.000.000/0000-00" 
                      mask="##.###.###/####-##" 
                      value={cpfCnpj}
                      onChange={(val: string) => {
                        setCpfCnpj(val);
                        autoSaveField('cpf_cnpj', onlyDigits(val) || undefined);
                      }}
                    />
                  </div>
                  <div>
                    <Input 
                      label="Razão Social" 
                      placeholder="Digite a razão social" 
                      value={razaoSocial}
                      onChange={(e) => {
                        setRazaoSocial(e.target.value);
                        autoSaveField('razao_social', e.target.value || undefined);
                      }}
                    />
                  </div>
                  <div>
                    <Input 
                      label="Nome Fantasia" 
                      placeholder="Digite o nome fantasia" 
                      value={nomeFantasia}
                      onChange={(e) => {
                        setNomeFantasia(e.target.value);
                        autoSaveField('nome_fantasia', e.target.value || undefined);
                      }}
                    />
                  </div>
                  <div>
                    <InputMask 
                      label="Inscrição Estadual" 
                      placeholder="000.000.000.000" 
                      mask="###.###.###.###"
                      value={rgIe}
                      onChange={(val: string) => {
                        setRgIe(val);
                        autoSaveField('rg_ie', onlyDigits(val) || undefined);
                      }}
                    />
                  </div>
                  <div>
                    <InputMask 
                      label="Data de Fundação" 
                      placeholder="00/00/0000" 
                      mask="##/##/####" 
                      value={dataFundacao}
                      onChange={(val: string) => {
                        setDataFundacao(val);
                        autoSaveField('data_fundacao', toIsoDate(val));
                      }}
                    />
                  </div>
                  <div>
                    <Input 
                      label="Ramo de Atividade" 
                      placeholder="Digite o ramo de atividade" 
                      value={ramoAtividade}
                      onChange={(e) => {
                        setRamoAtividade(e.target.value);
                        autoSaveField('ramo_atividade', e.target.value || undefined);
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Seção: Endereço */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Endereço</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="CEP"
                  placeholder="00000000"
                  value={cep}
                  onChange={(e) => {
                    const digits = (e.target.value || '').replace(/\D/g, '').slice(0, 8);
                    setCep(digits);
                    setCepError(null);
                    setCepSuccess(false);
                    // Autosave do CEP
                    autoSaveField('cep' as any, digits || undefined);
                    if (digits.length === 8) {
                      buscarEnderecoPorCEP(digits);
                    }
                  }}
                  maxLength={8}
                />
                {loadingCep && (
                  <p className="text-xs text-neutral-gray-medium mt-1">Buscando CEP...</p>
                )}
                {cepError && (
                  <p className="text-xs text-red-600 mt-1">{cepError}</p>
                )}
                {cepSuccess && (
                  <p className="text-xs text-green-600 mt-1">CEP encontrado com sucesso!</p>
                )}
              </div>
              <div>
                <Input 
                  label="País" 
                  placeholder="Brasil" 
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                />
              </div>
              <div>
                <Select 
                  label="UF" 
                  options={ufOptions} 
                  value={uf}
                  onChange={(e) => {
                    setUf(e.target.value);
                    autoSaveField('uf' as any, e.target.value || undefined);
                  }}
                />
              </div>
              <div>
                <Input 
                  label="Cidade" 
                  placeholder="Digite a cidade" 
                  value={cidade}
                  onChange={(e) => {
                    setCidade(e.target.value);
                    autoSaveField('cidade' as any, e.target.value || undefined);
                  }}
                />
              </div>
              <div>
                <Input 
                  label="Bairro" 
                  placeholder="Digite o bairro" 
                  value={bairro}
                  onChange={(e) => {
                    setBairro(e.target.value);
                    autoSaveField('bairro' as any, e.target.value || undefined);
                  }}
                />
              </div>
              <div>
                <Input 
                  label="Rua" 
                  placeholder="Digite a rua" 
                  value={rua}
                  onChange={(e) => {
                    setRua(e.target.value);
                    autoSaveField('logradouro' as any, e.target.value || undefined);
                  }}
                />
              </div>
              <div>
                <Input 
                  label="Número" 
                  placeholder="Digite o número" 
                  value={numero}
                  onChange={(e) => {
                    setNumero(e.target.value);
                    autoSaveField('numero' as any, e.target.value || undefined);
                  }}
                />
              </div>
              <div>
                <Input 
                  label="Complemento" 
                  placeholder="Apto, bloco, etc." 
                  value={complemento}
                  onChange={(e) => {
                    setComplemento(e.target.value);
                    autoSaveField('complemento' as any, e.target.value || undefined);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Seção: Observações */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Observações</h2>
            <TextArea 
              label="Observações" 
              placeholder="Digite observações relevantes sobre este cliente..." 
              rows={4}
            />
          </div>

          {/* Seção: Telefones Adicionais */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Telefones Adicionais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputMask 
                  label="Telefone Comercial" 
                  placeholder="(00) 0000-0000" 
                  mask="(##) ####-####" 
                />
              </div>
              <div>
                <InputMask 
                  label="Telefone Residencial" 
                  placeholder="(00) 0000-0000" 
                  mask="(##) ####-####" 
                />
              </div>
            </div>
          </div>

          {/* Seção: Pessoas Relacionadas */}
          <div className="pb-6">
            <h2 className="text-xl font-semibold mb-4">Pessoas Relacionadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input 
                  label="Nome do Cônjuge/Sócio" 
                  placeholder="Digite o nome completo" 
                />
              </div>
              <div>
                <InputMask 
                  label="Telefone" 
                  placeholder="(00) 00000-0000" 
                  mask="(##) #####-####" 
                />
              </div>
              <div>
                <Input 
                  label="E-mail" 
                  type="email" 
                  placeholder="email@exemplo.com" 
                />
              </div>
              <div>
                <InputMask 
                  label="CPF/CNPJ" 
                  placeholder="000.000.000-00" 
                  mask="###.###.###-##"
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <Button 
              variant="secondary" 
              type="button"
              onClick={() => navigate('/clientes')}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={saving || loading || !nome.trim()}
            >
              {id ? (saving ? 'Salvando...' : 'Salvar') : (saving ? 'Cadastrando...' : 'Cadastrar')}
            </Button>
          </div>
        </form>
      </div>
      <Toast open={toastOpen} message={toastMsg} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};

export default ClienteCadastroCompleto;
