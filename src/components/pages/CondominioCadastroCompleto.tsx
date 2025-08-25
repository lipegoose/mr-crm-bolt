import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Select } from '../ui/Select';
import Toast, { ToastType } from '../ui/Toast';
import CondominioService, { Condominio } from '../../services/CondominioService';

const CondominioCadastroCompleto: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  // Removidos estados de loading/saving (não há mais submit)
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

  // Campos
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cep, setCep] = useState('');
  const [uf, setUf] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [cepSuccess, setCepSuccess] = useState(false);

  const ufOptions = [
    { value: '', label: 'Selecione' },
    { value: 'AC', label: 'AC' },{ value: 'AL', label: 'AL' },{ value: 'AP', label: 'AP' },{ value: 'AM', label: 'AM' },
    { value: 'BA', label: 'BA' },{ value: 'CE', label: 'CE' },{ value: 'DF', label: 'DF' },{ value: 'ES', label: 'ES' },
    { value: 'GO', label: 'GO' },{ value: 'MA', label: 'MA' },{ value: 'MT', label: 'MT' },{ value: 'MS', label: 'MS' },
    { value: 'MG', label: 'MG' },{ value: 'PA', label: 'PA' },{ value: 'PB', label: 'PB' },{ value: 'PR', label: 'PR' },
    { value: 'PE', label: 'PE' },{ value: 'PI', label: 'PI' },{ value: 'RJ', label: 'RJ' },{ value: 'RN', label: 'RN' },
    { value: 'RS', label: 'RS' },{ value: 'RO', label: 'RO' },{ value: 'RR', label: 'RR' },{ value: 'SC', label: 'SC' },
    { value: 'SP', label: 'SP' },{ value: 'SE', label: 'SE' },{ value: 'TO', label: 'TO' },
  ];

  // Autosave com debounce por campo
  const debounceRefs = useRef<Record<string, number | undefined>>({});
  const autoSaveField = (field: keyof Condominio, value: any) => {
    if (!id) return; // somente no modo edição
    const key = String(field);
    if (debounceRefs.current[key]) window.clearTimeout(debounceRefs.current[key]);
    debounceRefs.current[key] = window.setTimeout(async () => {
      try {
        await CondominioService.updateCondominio(Number(id), { [field]: value } as Partial<Condominio>);
        if (field === 'nome') showToast('Nome salvo automaticamente.', 'success');
      } catch (error) {
        console.error(`Erro ao salvar campo ${key}`, error);
        showToast(`Erro ao salvar ${key}.`, 'error');
      }
    }, 600);
  };

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      if (loadedOnceRef.current) return; // evita duplicação no StrictMode
      loadedOnceRef.current = true;
      try {
        const c = await CondominioService.getCondominio(Number(id));
        setNome(c.nome || '');
        setDescricao(c.descricao || '');
        setCep((c.cep || '').toString());
        setUf(c.uf || '');
        setCidade(c.cidade || '');
        setBairro(c.bairro || '');
        setLogradouro(c.logradouro || '');
        setNumero(c.numero || '');
        setComplemento(c.complemento || '');
        setLatitude((c.latitude as any)?.toString?.() || '');
        setLongitude((c.longitude as any)?.toString?.() || '');
      } catch (e) {
        console.error('Erro ao carregar condomínio', e);
        showToast('Erro ao carregar condomínio.', 'error');
      } finally {
        // loading removido
      }
    };
    load();
  }, [id]);

  // Removido handleSubmit: salvamento é dinâmico campo a campo

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
      setLogradouro(newRua);
      if (id) {
        autoSaveField('uf', newUf || undefined);
        autoSaveField('cidade', newCidade || undefined);
        autoSaveField('bairro', newBairro || undefined);
        autoSaveField('logradouro', newRua || undefined);
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
          <h1 className="text-2xl font-semibold">{id ? 'Editar Condomínio' : 'Cadastro Completo de Condomínio'}</h1>
          <Button variant="secondary" onClick={() => navigate('/condominios')}>Voltar</Button>
        </div>

        <div className="space-y-8">
          {/* Principais */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Informações Principais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input label="Nome" placeholder="Digite o nome do condomínio" required value={nome} onChange={(e) => { setNome(e.target.value); autoSaveField('nome', e.target.value.trim()); }} />
              </div>
              <div className="md:col-span-2">
                <TextArea label="Descrição" placeholder="Opcional" rows={3} value={descricao} onChange={(e) => { setDescricao(e.target.value); autoSaveField('descricao', e.target.value || undefined); }} />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Endereço</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input label="CEP" placeholder="00000000" value={cep} maxLength={8} onChange={(e) => {
                  const digits = (e.target.value || '').replace(/\D/g, '').slice(0, 8);
                  setCep(digits);
                  setCepError(null);
                  setCepSuccess(false);
                  autoSaveField('cep', digits || undefined);
                  if (digits.length === 8) buscarEnderecoPorCEP(digits);
                }} />
                {loadingCep && (<p className="text-xs text-neutral-gray-medium mt-1">Buscando CEP...</p>)}
                {cepError && (<p className="text-xs text-red-600 mt-1">{cepError}</p>)}
                {cepSuccess && (<p className="text-xs text-green-600 mt-1">CEP encontrado com sucesso!</p>)}
              </div>
              <div>
                <Select label="UF" options={ufOptions} value={uf} onChange={(e) => { setUf(e.target.value); autoSaveField('uf', e.target.value || undefined); }} />
              </div>
              <div>
                <Input label="Cidade" value={cidade} onChange={(e) => { setCidade(e.target.value); autoSaveField('cidade', e.target.value || undefined); }} />
              </div>
              <div>
                <Input label="Bairro" value={bairro} onChange={(e) => { setBairro(e.target.value); autoSaveField('bairro', e.target.value || undefined); }} />
              </div>
              <div>
                <Input label="Logradouro" value={logradouro} onChange={(e) => { setLogradouro(e.target.value); autoSaveField('logradouro', e.target.value || undefined); }} />
              </div>
              <div>
                <Input label="Número" value={numero} onChange={(e) => { setNumero(e.target.value); autoSaveField('numero', e.target.value || undefined); }} />
              </div>
              <div>
                <Input label="Complemento" value={complemento} onChange={(e) => { setComplemento(e.target.value); autoSaveField('complemento', e.target.value || undefined); }} />
              </div>
            </div>
          </div>

          {/* Geolocalização */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Geolocalização</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input label="Latitude" placeholder="-23.550520" value={latitude} onChange={(e) => { setLatitude(e.target.value); autoSaveField('latitude', e.target.value ? Number(e.target.value) : undefined); }} />
              </div>
              <div>
                <Input label="Longitude" placeholder="-46.633308" value={longitude} onChange={(e) => { setLongitude(e.target.value); autoSaveField('longitude', e.target.value ? Number(e.target.value) : undefined); }} />
              </div>
            </div>
          </div>

          {/* Ação: Voltar (rodapé) */}
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => navigate('/condominios')}>Voltar</Button>
          </div>
        </div>
      </div>
      <Toast open={toastOpen} message={toastMsg} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};

export default CondominioCadastroCompleto;
