import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { Select } from '../ui/Select';
import { InputMask } from '../ui/InputMask';
import { Plus, Search, Filter, Edit, Trash2, Phone, Mail } from 'lucide-react';
import ClienteService, { Cliente, ClienteCategoria, ClienteOrigemCaptacao } from '../../services/ClienteService';

// Lista de clientes será carregada da API

export const Clientes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const [total, setTotal] = useState(0);

  // Campos da Modal
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [categoria, setCategoria] = useState<ClienteCategoria | ''>('');
  const [origemCaptacao, setOrigemCaptacao] = useState<ClienteOrigemCaptacao | ''>('');
  const formRef = useRef<HTMLFormElement | null>(null);

  const loadClientes = async (targetPage = 1) => {
    try {
      setLoading(true);
      const resp = await ClienteService.getClientes({ page: targetPage, per_page: perPage });
      setClientes(resp.data);
      setTotal(resp.total || 0);
      setPage(resp.current_page || targetPage);
    } catch (e) {
      console.error('Erro ao carregar clientes', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientes(1);
  }, []);

  // Debounce de busca chamando a API
  useEffect(() => {
    const handler = setTimeout(async () => {
      const term = searchTerm.trim();
      if (!term) {
        await loadClientes(1);
        return;
      }
      try {
        setLoading(true);
        const resp = await ClienteService.searchClientes({ page: 1, per_page: perPage, nome: term });
        setClientes(resp.data);
        setTotal(resp.total || 0);
        setPage(resp.current_page || 1);
      } catch (e) {
        console.error('Erro na busca de clientes', e);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm, perPage]);

  const getStatusColor = (status: string) => {
    switch ((status || '').toString().toUpperCase()) {
      case 'ATIVO':
        return 'bg-status-success text-white';
      case 'INATIVO':
        return 'bg-neutral-gray-medium text-white';
      case 'PROSPECTO':
        return 'bg-status-info text-white';
      default:
        return 'bg-neutral-gray text-neutral-black';
    }
  };

  return (
    <div className="space-y-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-title font-bold text-neutral-black">Clientes</h1>
          <p className="text-neutral-gray-medium mt-1">Gerencie seus clientes e prospects</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-medium w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-gray rounded-default focus:outline-none focus:border-primary-orange"
              />
            </div>
          </div>
          <Button variant="secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
      </Card>

      {loading && (
        <div className="text-sm text-neutral-gray-medium mb-2">Carregando clientes...</div>
      )}
      {/* Clients List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientes.map((cliente) => (
          <Card key={cliente.id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar name={cliente.nome} />
                <div>
                  <h3 className="font-semibold text-neutral-black">{cliente.nome}</h3>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor((cliente.status || 'ATIVO') as string)}`}>
                    {(cliente.status || 'ATIVO') as string}
                  </span>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  className="p-1 text-neutral-gray-medium hover:text-primary-orange"
                  onClick={() => cliente.id && navigate(`/clientes/${cliente.id}`)}
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  className="p-1 text-neutral-gray-medium hover:text-status-error"
                  onClick={async () => {
                    if (!cliente.id) return;
                    const ok = window.confirm('Deseja realmente excluir este cliente?');
                    if (!ok) return;
                    try {
                      setLoading(true);
                      await ClienteService.deleteCliente(cliente.id);
                      // Recarrega mantendo página corrente, mas se esvaziar a página, volta uma
                      const totalAfter = Math.max(total - 1, 0);
                      const lastPage = Math.max(Math.ceil(totalAfter / perPage), 1);
                      const nextPage = Math.min(page, lastPage);
                      await loadClientes(nextPage);
                    } catch (e) {
                      console.error('Erro ao excluir cliente', e);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-neutral-gray-medium">
                <Mail className="w-4 h-4 mr-2" />
                {cliente.email || '—'}
              </div>
              <div className="flex items-center text-sm text-neutral-gray-medium">
                <Phone className="w-4 h-4 mr-2" />
                {cliente.telefone || '—'}
              </div>
              <div className="text-sm text-neutral-gray-medium">
                {/* Campo cidade não vem do contrato atual */}
                📍
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-neutral-gray-medium">
          {total > 0 ? (
            <>Mostrando {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} de {total}</>
          ) : (
            <>Nenhum registro encontrado</>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={loading || page <= 1}
            onClick={() => {
              const newPage = Math.max(page - 1, 1);
              if (searchTerm.trim()) {
                // Com busca ativa, chama search na página anterior
                setPage(newPage);
                setSearchTerm(searchTerm); // mantém termo; efeito de debounce cuidará
              } else {
                loadClientes(newPage);
              }
            }}
          >
            Anterior
          </Button>
          <Button
            variant="secondary"
            disabled={loading || page >= Math.max(Math.ceil(total / perPage), 1)}
            onClick={() => {
              const newPage = page + 1;
              if (searchTerm.trim()) {
                setPage(newPage);
                setSearchTerm(searchTerm);
              } else {
                loadClientes(newPage);
              }
            }}
          >
            Próxima
          </Button>
        </div>
      </div>

      {/* Modal inicial (simplificado) */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ marginTop: 0 }}>
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-title font-semibold">Cadastrar Cliente</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-neutral-gray-medium hover:text-neutral-black"
              >
                ✕
              </button>
            </div>
            
            <form
              className="space-y-4"
              ref={formRef}
              onSubmit={async (e) => {
                e.preventDefault();
                if (!nome.trim()) return;
                try {
                  const novo = await ClienteService.createCliente({
                    nome: nome.trim(),
                    telefone: telefone || undefined,
                    email: email || undefined,
                    categoria: (categoria || undefined) as ClienteCategoria | undefined,
                    origem_captacao: (origemCaptacao || undefined) as ClienteOrigemCaptacao | undefined,
                  });
                  setShowForm(false);
                  // Limpa campos
                  setNome(''); setTelefone(''); setEmail(''); setCategoria(''); setOrigemCaptacao('');
                  // Recarrega lista
                  await loadClientes();
                  console.info('Cliente cadastrado', novo.id);
                } catch (err) {
                  console.error('Erro ao cadastrar cliente', err);
                }
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input 
                    label="Nome" 
                    placeholder="Digite o nome completo" 
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
                <div>
                  <InputMask 
                    label="Telefone" 
                    placeholder="(00) 00000-0000" 
                    mask="(##) #####-####" 
                    value={telefone}
                    onChange={(e: any) => setTelefone(e.target.value)}
                  />
                </div>
                <div>
                  <Input 
                    label="E-mail" 
                    type="email" 
                    placeholder="email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Select 
                    label="Origem da captação" 
                    value={origemCaptacao}
                    onChange={(e) => setOrigemCaptacao(e.target.value as ClienteOrigemCaptacao | '')}
                    options={[
                      { value: '', label: 'Selecione' },
                      { value: 'site', label: 'Site' },
                      { value: 'indicacao', label: 'Indicação' },
                      { value: 'redes_sociais', label: 'Redes Sociais' },
                      { value: 'anuncio', label: 'Anúncio' },
                      { value: 'outro', label: 'Outro' },
                    ]} 
                  />
                </div>
                <div>
                  <Select 
                    label="Categoria" 
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as ClienteCategoria | '')}
                    options={[
                      { value: '', label: 'Selecione' },
                      { value: 'cliente', label: 'Cliente' },
                      { value: 'prospecto', label: 'Prospecto' },
                      { value: 'lead', label: 'Lead' },
                    ]} 
                  />
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="w-full text-sm" 
                  onClick={async () => {
                    // Dispara validação nativa do formulário (ex.: Nome obrigatório)
                    if (formRef.current && !formRef.current.reportValidity()) {
                      return;
                    }
                    try {
                      const novo = await ClienteService.createCliente({
                        nome: nome.trim(),
                        telefone: telefone || undefined,
                        email: email || undefined,
                        categoria: (categoria || undefined) as ClienteCategoria | undefined,
                        origem_captacao: (origemCaptacao || undefined) as ClienteOrigemCaptacao | undefined,
                      });
                      setShowForm(false);
                      setNome(''); setTelefone(''); setEmail(''); setCategoria(''); setOrigemCaptacao('');
                      navigate(`/clientes/${novo.id}`);
                    } catch (err) {
                      console.error('Erro ao cadastrar e navegar', err);
                    }
                  }}
                >
                  Ver cadastro completo
                </Button>
              </div>
              
              <div className="flex space-x-3 pt-4 border-t mt-4">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">Cadastrar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
      
    </div>
  );
};