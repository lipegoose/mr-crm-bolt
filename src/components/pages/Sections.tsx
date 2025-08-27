import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionsService, Section } from '../../services/SectionsService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Search, Filter, Edit } from 'lucide-react';

const Sections: React.FC = () => {
  const [data, setData] = React.useState<Section[] | null>(null);
  const [q, setQ] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await SectionsService.list({ page: 1, q: q || undefined, per_page: 20 });
      setData(res.data);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar seções');
    } finally {
      setLoading(false);
    }
  }, [q]);

  React.useEffect(() => {
    let mounted = true;
    if (mounted) load();
    return () => { mounted = false; };
  }, [load]);

  const handleCreate = async () => {
    try {
      const created = await SectionsService.create({ slug: `sec-${Date.now()}`, titulo: 'Nova Seção', template: 'destaques', show_on_home: false, ativo: true, ordem: 0 });
      navigate(`/cms/sections/${created.id}`);
    } catch (e) {
      console.error(e);
      alert('Falha ao criar seção');
    }
  };

  return (
    <div className="space-y-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-title font-bold text-neutral-black">Seções</h1>
          <p className="text-neutral-gray-medium mt-1">Gerencie as seções do site</p>
        </div>
        <Button onClick={handleCreate}>+ Nova Seção</Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-medium w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar seções..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
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

      {loading && <div className="text-sm text-neutral-gray-medium mb-2">Carregando seções...</div>}
      {error && <div className="text-status-error">{error}</div>}

      {/* Lista */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((s) => (
          <Card key={s.id}>
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-neutral-black">{s.titulo}</h3>
              <button
                className="p-1 text-neutral-gray-medium hover:text-primary-orange"
                onClick={() => navigate(`/cms/sections/${s.id}`)}
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-neutral-gray-medium">slug: {s.slug} · template: {s.template}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Sections;
