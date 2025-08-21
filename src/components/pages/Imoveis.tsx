import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, Search, Filter, Edit, Trash2, MapPin, DollarSign, Home, Loader2 } from 'lucide-react';
import FiltersModal from '../imoveis/FiltersModal';
import { ImovelService, type Imovel as ImovelApi, type ImoveisListResponse } from '../../services/ImovelService';
import ConfirmDialog from '../ui/ConfirmDialog';
import Toast from '../ui/Toast';

interface ImovelUI {
  id: number;
  titulo: string;
  tipo: string;
  endereco: string;
  preco: number;
  precoFormatado?: string | null;
  area: number;
  quartos?: number;
  banheiros?: number;
  status: string;
  imagem: string;
}

export const Imoveis: React.FC = () => {
  const navigate = useNavigate();
  const [imoveisApi, setImoveisApi] = useState<ImovelApi[]>([]);
  const [pagination, setPagination] = useState<ImoveisListResponse['pagination'] | null>(null);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Record<number, boolean>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    tipoSubtipo?: string;
    precoMin?: string;
    precoMax?: string;
    areaMin?: string;
    areaMax?: string;
    dormitorios?: number;
  } | null>(null);
  const [creatingImovel, setCreatingImovel] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ImovelService.listImoveis({ page });
        if (cancelled) return;
        setImoveisApi(res.data || []);
        setPagination(res.pagination || null);
      } catch (e) {
        console.error('Erro ao listar imóveis:', e);
        if (!cancelled) setError('Falha ao carregar imóveis');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [page]);


  // Função para criar novo imóvel
  const handleNovoImovel = async () => {
    setCreatingImovel(true);
    try {
      const response = await ImovelService.iniciarCadastro();
      navigate(`/imoveis/${response.imovel.id}`);
    } catch (error) {
      console.error('Erro ao criar novo imóvel:', error);
      // Aqui você pode adicionar um toast de erro se tiver implementado
      alert('Erro ao criar novo imóvel. Tente novamente.');
    } finally {
      setCreatingImovel(false);
    }
  };

  const imoveisUI: ImovelUI[] = useMemo(() => {
    return (imoveisApi || []).map((imovel) => {
      const cf: any = imovel.caracteristicas_fisicas || {};
      const areaRaw = cf.area_privativa ?? cf.area_total;
      const areaNum = areaRaw != null ? Number(areaRaw) : 0;
      const quartos = (cf.dormitorios ?? cf.quartos ?? 0) || undefined;
      const banheiros = (cf.banheiros ?? 0) || undefined;
      const end = imovel.endereco?.endereco_formatado || '';
      const valores = imovel.valores || ({} as any);
      const precoBase = valores.valor_venda ?? valores.valor_locacao ?? 0;
      const precoFmt = valores.valor_venda_formatado || valores.valor_locacao_formatado || null;
      const titulo = imovel.codigo_referencia || `${imovel.tipo}${imovel.subtipo ? ' - ' + imovel.subtipo : ''}`;
      // Usa imagem principal se disponível; fallback para placeholder
      const imagem = imovel.imagem_principal?.url || imovel.imagem_principal?.url_completa || '/image.png';
      return {
        id: imovel.id,
        titulo,
        tipo: imovel.tipo,
        endereco: end || '—',
        preco: Number(precoBase) || 0,
        precoFormatado: precoFmt,
        area: areaNum || 0,
        quartos,
        banheiros,
        status: (imovel.status || '').toUpperCase(),
        imagem,
      } as ImovelUI;
    });
  }, [imoveisApi]);

  const filteredImoveis = imoveisUI.filter(imovel => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        imovel.titulo.toLowerCase().includes(searchLower) ||
        imovel.endereco.toLowerCase().includes(searchLower) ||
        imovel.tipo.toLowerCase().includes(searchLower)
      );
      
      if (!matchesSearch) return false;
    }
    
    if (!activeFilters) return true;
    
    let matches = true;
    
    if (activeFilters.tipoSubtipo && activeFilters.tipoSubtipo !== '') {
      matches = matches && imovel.tipo === activeFilters.tipoSubtipo;
    }
    
    if (activeFilters.precoMin && activeFilters.precoMin !== '') {
      matches = matches && imovel.preco >= parseFloat(activeFilters.precoMin);
    }
    
    if (activeFilters.precoMax && activeFilters.precoMax !== '') {
      matches = matches && imovel.preco <= parseFloat(activeFilters.precoMax);
    }
    
    if (activeFilters.areaMin && activeFilters.areaMin !== '') {
      matches = matches && imovel.area >= parseFloat(activeFilters.areaMin);
    }
    
    if (activeFilters.areaMax && activeFilters.areaMax !== '') {
      matches = matches && imovel.area <= parseFloat(activeFilters.areaMax);
    }
    
    if (activeFilters.dormitorios && activeFilters.dormitorios > 0) {
      matches = matches && (imovel.quartos || 0) >= activeFilters.dormitorios;
    }
    
    return matches;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return 'bg-status-success text-white';
      case 'INATIVO':
        return 'bg-neutral-gray-medium text-white';
      case 'ALUGADO':
        return 'bg-status-info text-white';
      case 'RESERVADO':
        return 'bg-primary-orange text-white';
      case 'EM_NEGOCIACAO':
        return 'bg-primary-orange text-white';
      case 'VENDIDO':
        return 'bg-neutral-gray-medium text-white';
      case 'RASCUNHO':
        return 'bg-neutral-gray text-neutral-black';
      default:
        return 'bg-neutral-gray text-neutral-black';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'casa':
        return Home;
      case 'apartamento':
        return Home;
      case 'comercial':
        return Home;
      default:
        return Home;
    }
  };

  const formatPrice = (price: number, formatted?: string | null) => {
    if (formatted) return formatted;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price || 0);
  };

  // Título do imóvel alvo da confirmação
  const confirmTitle = useMemo(() => {
    if (confirmTargetId == null) return '';
    const item = imoveisUI.find((i) => i.id === confirmTargetId);
    return item?.titulo || '';
  }, [confirmTargetId, imoveisUI]);

  const handleDelete = async (id: number) => {
    // Abre diálogo de confirmação amigável
    setConfirmTargetId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    const id = confirmTargetId;
    if (id == null) return;
    setConfirmOpen(false);
    setDeletingIds((prev) => ({ ...prev, [id]: true }));
    try {
      await ImovelService.deleteImovel(id);
      // Recarrega a página atual
      const res = await ImovelService.listImoveis({ page });
      setImoveisApi(res.data || []);
      setPagination(res.pagination || null);
      // Se a página ficou vazia e existe anterior, volta uma página
      if ((res.data || []).length === 0 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      }
      setSuccessMsg(`Imóvel "${confirmTitle}" excluído com sucesso.`);
    } catch (e) {
      console.error('Erro ao excluir imóvel:', e);
      setError('Erro ao excluir imóvel. Tente novamente.');
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
          <h1 className="text-3xl font-title font-bold text-neutral-black">Imóveis</h1>
          <p className="text-neutral-gray-medium mt-1">Gerencie seu portfólio de imóveis</p>
        </div>
        <Button onClick={handleNovoImovel} disabled={creatingImovel}>
          {creatingImovel ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          {creatingImovel ? 'Criando...' : 'Novo Imóvel'}
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
                placeholder="Buscar imóveis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-gray rounded-default focus:outline-none focus:border-primary-orange"
              />
            </div>
          </div>
          <Button 
            variant="secondary"
            onClick={() => setIsFiltersModalOpen(true)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
      </Card>

      {/* Modal de Filtros */}
      <FiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApplyFilters={(filters) => {
          setActiveFilters(filters);
          setIsFiltersModalOpen(false);
        }}
        totalImoveis={filteredImoveis.length}
      />

      {/* Estado de carregamento/erro */}
      {error && (
        <Card>
          <div className="text-status-error">{error}</div>
        </Card>
      )}
      {/* Toast de sucesso */}
  <Toast
        open={!!successMsg}
        message={successMsg || ''}
        type="success"
        duration={3000}
        onClose={() => setSuccessMsg(null)}
      />
      {loading && (
        <div className="flex items-center gap-2 text-neutral-gray-medium">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando imóveis...
        </div>
      )}

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImoveis.map((imovel) => {
          const TipoIcon = getTipoIcon(imovel.tipo);
          
          return (
            <Card key={imovel.id} className="overflow-hidden p-0">
              {/* Image */}
              <div className="relative h-48">
                <img
                  src={imovel.imagem}
                  alt={imovel.titulo}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(imovel.status)}`}>
                    {imovel.status}
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <div className="bg-white bg-opacity-90 p-1 rounded">
                    <TipoIcon className="w-4 h-4 text-primary-orange" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-component">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-neutral-black">{imovel.titulo}</h3>
                    <div className="flex items-center text-sm text-neutral-gray-medium mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {imovel.endereco}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button className="p-1 text-neutral-gray-medium hover:text-primary-orange" onClick={() => navigate(`/imoveis/${imovel.id}`)}>
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-neutral-gray-medium hover:text-status-error disabled:opacity-50"
                      onClick={() => handleDelete(imovel.id)}
                      disabled={!!deletingIds[imovel.id]}
                      title="Excluir imóvel"
                    >
                      {deletingIds[imovel.id] ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-lg font-semibold text-primary-orange">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {formatPrice(imovel.preco, imovel.precoFormatado)}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-neutral-gray-medium">
                    <span>{imovel.area}m²</span>
                    {imovel.quartos && (
                      <span>{imovel.quartos} quartos</span>
                    )}
                    {imovel.banheiros && (
                      <span>{imovel.banheiros} banheiros</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Paginação */}
      {pagination && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-neutral-gray-medium">
            Página {pagination.current_page} de {pagination.total_pages} • Total: {pagination.total}
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={loading || page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => (pagination.has_more_pages ? p + 1 : p))}
              disabled={loading || !pagination.has_more_pages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
      
      {/* Dialogo de confirmação de exclusão */}
      <ConfirmDialog
        open={confirmOpen}
        title="Excluir imóvel"
        description={`Tem certeza que deseja excluir o imóvel "${confirmTitle}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        loading={confirmTargetId != null && !!deletingIds[confirmTargetId]}
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setConfirmTargetId(null); }}
      />
    </div>
  );
};