import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus, Search, Filter, Edit, Trash2, MapPin, Loader2 } from 'lucide-react';
import ConfirmDialog from '../ui/ConfirmDialog';
import CondominioService, { Condominio } from '../../services/CondominioService';

export const Condominios = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const [total, setTotal] = useState(0);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [deletingIds, setDeletingIds] = useState<Record<number, boolean>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);

  // Modal
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const loadCondominios = async (targetPage = 1) => {
    try {
      setLoading(true);
      const resp = await CondominioService.getCondominios({ page: targetPage, per_page: perPage });
      setCondominios(resp.data);
      setTotal(resp.total || 0);
      setPage(resp.current_page || targetPage);
    } catch (e) {
      console.error('Erro ao carregar condomínios', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCondominios(1);
  }, []);

  // Debounce de busca
  useEffect(() => {
    const handler = setTimeout(async () => {
      const term = searchTerm.trim();
      if (!term) return; // evita segunda chamada inicial; carga padrão fica no efeito de montagem
      try {
        setLoading(true);
        const resp = await CondominioService.searchCondominios({ page: 1, per_page: perPage, nome: term });
        setCondominios(resp.data);
        setTotal(resp.total || 0);
        setPage(resp.current_page || 1);
      } catch (e) {
        console.error('Erro na busca de condomínios', e);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm, perPage]);

  // Título do condomínio alvo da confirmação
  const confirmTitle = useMemo(() => {
    if (confirmTargetId == null) return '';
    const item = condominios.find((c) => c.id === confirmTargetId);
    return item?.nome || '';
  }, [confirmTargetId, condominios]);

  const handleDelete = (id: number) => {
    setConfirmTargetId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    const id = confirmTargetId;
    if (id == null) return;
    setConfirmOpen(false);
    setDeletingIds((prev) => ({ ...prev, [id]: true }));
    try {
      await CondominioService.deleteCondominio(id);
      const totalAfter = Math.max(total - 1, 0);
      const lastPage = Math.max(Math.ceil(totalAfter / perPage), 1);
      const nextPage = Math.min(page, lastPage);
      await loadCondominios(nextPage);
    } catch (e) {
      console.error('Erro ao excluir condomínio', e);
    } finally {
      setDeletingIds((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
      setConfirmTargetId(null);
    }
  };

  return (
    <div className="space-y-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-title font-bold text-neutral-black">Condomínios</h1>
          <p className="text-neutral-gray-medium mt-1">Gerencie seus condomínios</p>
          {/* Diálogo de confirmação de exclusão */}
      <ConfirmDialog
        open={confirmOpen}
        title="Excluir condomínio"
        description={`Tem certeza que deseja excluir o condomínio "${confirmTitle}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        loading={confirmTargetId != null && !!deletingIds[confirmTargetId]}
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setConfirmTargetId(null); }}
      />
    </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Condomínio
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-medium w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar condomínios..."
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

      {loading && <div className="text-sm text-neutral-gray-medium mb-2">Carregando condomínios...</div>}

      {/* Lista */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {condominios.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-neutral-black">{c.nome}</h3>
                <div className="text-xs text-neutral-gray-medium mt-1 line-clamp-2">{c.descricao || '—'}</div>
              </div>
              <div className="flex space-x-1">
                <button
                  className="p-1 text-neutral-gray-medium hover:text-primary-orange"
                  onClick={() => c.id && navigate(`/condominios/${c.id}`)}
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  className="p-1 text-neutral-gray-medium hover:text-status-error disabled:opacity-50"
                  onClick={() => c.id && handleDelete(c.id)}
                  disabled={!!(c.id && deletingIds[c.id])}
                  title="Excluir"
                >
                  {c.id && deletingIds[c.id] ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center text-sm text-neutral-gray-medium">
              <MapPin className="w-4 h-4 mr-2" />
              {c.bairro && c.cidade && c.uf ? `${c.bairro}, ${c.cidade}/${c.uf}` : (c.cidade && c.uf ? `${c.cidade}/${c.uf}` : '—')}
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
                setPage(newPage);
                setSearchTerm(searchTerm);
              } else {
                loadCondominios(newPage);
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
                loadCondominios(newPage);
              }
            }}
          >
            Próxima
          </Button>
        </div>
      </div>

      {/* Modal cadastro simples */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ marginTop: 0 }}>
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-title font-semibold">Cadastrar Condomínio</h2>
              <button onClick={() => setShowForm(false)} className="text-neutral-gray-medium hover:text-neutral-black">✕</button>
            </div>

            <form
              className="space-y-4"
              ref={formRef}
              onSubmit={async (e) => {
                e.preventDefault();
                if (!nome.trim()) return;
                try {
                  await CondominioService.createCondominio({ nome: nome.trim(), descricao: descricao || undefined });
                  setShowForm(false);
                  setNome('');
                  setDescricao('');
                  await loadCondominios();
                } catch (err) {
                  console.error('Erro ao cadastrar condomínio', err);
                }
              }}
            >
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Input label="Nome" placeholder="Digite o nome do condomínio" required value={nome} onChange={(e) => setNome(e.target.value)} />
                </div>
                <div>
                  <Input label="Descrição" placeholder="Opcional" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full text-sm"
                  onClick={async () => {
                    if (formRef.current && !formRef.current.reportValidity()) return;
                    try {
                      const novo = await CondominioService.createCondominio({ nome: nome.trim(), descricao: descricao || undefined });
                      setShowForm(false);
                      setNome('');
                      setDescricao('');
                      navigate(`/condominios/${novo.id}`);
                    } catch (err) {
                      console.error('Erro ao cadastrar e navegar', err);
                    }
                  }}
                >
                  Ver cadastro completo
                </Button>
              </div>

              <div className="flex space-x-3 pt-4 border-t mt-4">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
                <Button type="submit" className="flex-1">Cadastrar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Condominios;
