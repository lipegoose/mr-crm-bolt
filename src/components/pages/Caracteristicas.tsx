import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus, Search, Filter, Edit, Trash2, Loader2 } from 'lucide-react';
import ConfirmDialog from '../ui/ConfirmDialog';
import CaracteristicaService, { Caracteristica, CaracteristicaEscopo } from '../../services/CaracteristicaService';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export const Caracteristicas = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const initialEscopo = (query.get('escopo') as CaracteristicaEscopo) || 'IMOVEL';

  const [escopo, setEscopo] = useState<CaracteristicaEscopo>(initialEscopo);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const [total, setTotal] = useState(0);
  const [itens, setItens] = useState<Caracteristica[]>([]);
  const [deletingIds, setDeletingIds] = useState<Record<number, boolean>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);

  // Modal
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [nome, setNome] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  // Carregar lista (aceita escopo explícito para evitar estado obsoleto)
  const loadList = async (targetPage = 1, targetEscopo: CaracteristicaEscopo = escopo) => {
    try {
      setLoading(true);
      const resp = await CaracteristicaService.getCaracteristicas({ page: targetPage, per_page: perPage, escopo: targetEscopo });
      setItens(resp.data);
      setTotal(resp.total || 0);
      setPage(resp.current_page || targetPage);
    } catch (e) {
      console.error('Erro ao carregar características', e);
    } finally {
      setLoading(false);
    }
  };

  // URL é a fonte de verdade do escopo. Reage a mudanças no query param e carrega a lista.
  useEffect(() => {
    const qp = (query.get('escopo') as CaracteristicaEscopo) || 'IMOVEL';
    setEscopo(qp);
    setSearchTerm('');
    loadList(1, qp);
  }, [query]);

  // Debounce de busca
  useEffect(() => {
    const handler = setTimeout(async () => {
      const term = searchTerm.trim();
      if (!term) return; // evita duplicação com efeito de montagem
      try {
        setLoading(true);
        const resp = await CaracteristicaService.searchCaracteristicas({ page: 1, per_page: perPage, nome: term, escopo });
        setItens(resp.data);
        setTotal(resp.total || 0);
        setPage(resp.current_page || 1);
      } catch (e) {
        console.error('Erro na busca de características', e);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm, perPage, escopo]);

  // Confirm dialog title
  const confirmTitle = useMemo(() => {
    if (confirmTargetId == null) return '';
    const item = itens.find((c) => c.id === confirmTargetId);
    return item?.nome || '';
  }, [confirmTargetId, itens]);

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
      await CaracteristicaService.deleteCaracteristica(id);
      const totalAfter = Math.max(total - 1, 0);
      const lastPage = Math.max(Math.ceil(totalAfter / perPage), 1);
      const nextPage = Math.min(page, lastPage);
      await loadList(nextPage);
    } catch (e) {
      console.error('Erro ao excluir característica', e);
    } finally {
      setDeletingIds((prev) => {
        const n = { ...prev };
        delete n[id!];
        return n;
      });
      setConfirmTargetId(null);
    }
  };

  const openCreate = () => {
    setEditId(null);
    setNome('');
    setShowForm(true);
  };

  const openEdit = (item: Caracteristica) => {
    setEditId(item.id);
    setNome(item.nome || '');
    setShowForm(true);
  };

  return (
    <div className="space-y-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-title font-bold text-neutral-black">Características</h1>
          <p className="text-neutral-gray-medium mt-1">Gerencie as características de {escopo === 'IMOVEL' ? 'imóveis' : 'condomínios'}</p>

          <ConfirmDialog
            open={confirmOpen}
            title="Excluir característica"
            description={`Tem certeza que deseja excluir a característica "${confirmTitle}"? Esta ação não pode ser desfeita.`}
            confirmText="Excluir"
            cancelText="Cancelar"
            loading={confirmTargetId != null && !!deletingIds[confirmTargetId]}
            onConfirm={confirmDelete}
            onCancel={() => { setConfirmOpen(false); setConfirmTargetId(null); }}
          />
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Característica
        </Button>
      </div>

      {/* Tabs escopo */}
      <div className="flex gap-2">
        <Button
          variant={escopo === 'IMOVEL' ? 'primary' : 'secondary'}
          onClick={() => navigate('/caracteristicas?escopo=IMOVEL')}
        >
          Imóvel
        </Button>
        <Button
          variant={escopo === 'CONDOMINIO' ? 'primary' : 'secondary'}
          onClick={() => navigate('/caracteristicas?escopo=CONDOMINIO')}
        >
          Condomínio
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
                placeholder={`Buscar características de ${escopo === 'IMOVEL' ? 'imóveis' : 'condomínios'}...`}
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

      {loading && <div className="text-sm text-neutral-gray-medium mb-2">Carregando características...</div>}

      {/* Lista */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itens.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-neutral-black">{c.nome}</h3>
              {!c.sistema ? (
                <div className="flex space-x-1">
                  <button
                    className="p-1 text-neutral-gray-medium hover:text-primary-orange"
                    onClick={() => openEdit(c)}
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
              ) : null}
            </div>
            <div className="text-xs text-neutral-gray-medium">Escopo: {c.escopo}</div>
            {c.sistema ? <div className="text-[10px] mt-1 inline-block px-2 py-0.5 rounded bg-neutral-gray-medium text-white">Sistema</div> : null}
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
                loadList(newPage);
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
                loadList(newPage);
              }
            }}
          >
            Próxima
          </Button>
        </div>
      </div>

      {/* Modal cadastro/edição simples */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ marginTop: 0 }}>
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-title font-semibold">{editId ? 'Editar' : 'Cadastrar'} Característica</h2>
              <button onClick={() => setShowForm(false)} className="text-neutral-gray-medium hover:text-neutral-black">✕</button>
            </div>

            <form
              className="space-y-4"
              ref={formRef}
              onSubmit={async (e) => {
                e.preventDefault();
                if (!nome.trim()) return;
                try {
                  if (editId) {
                    await CaracteristicaService.updateCaracteristica(editId, { nome: nome.trim() });
                  } else {
                    await CaracteristicaService.createCaracteristica({ nome: nome.trim(), escopo });
                  }
                  setShowForm(false);
                  setNome('');
                  setEditId(null);
                  await loadList();
                } catch (err) {
                  console.error('Erro ao salvar característica', err);
                }
              }}
            >
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Input label="Nome" placeholder="Digite o nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t mt-4">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
                <Button type="submit" className="flex-1">Salvar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Caracteristicas;
