import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionsService, Section } from '../../services/SectionsService';

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Seções</h1>
        <button onClick={handleCreate} className="px-3 py-2 bg-primary-orange text-white rounded">Adicionar</button>
      </div>

      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." className="border rounded px-3 py-2 w-full" />
        <button onClick={load} className="px-3 py-2 bg-gray-800 text-white rounded">Buscar</button>
      </div>

      {loading && <div>Carregando...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((s) => (
          <div key={s.id} className="border rounded p-4 bg-white">
            <div className="font-semibold">{s.titulo}</div>
            <div className="text-sm text-gray-600">slug: {s.slug} · template: {s.template}</div>
            <div className="mt-2 flex justify-end">
              <button onClick={() => navigate(`/cms/sections/${s.id}`)} className="px-3 py-1 bg-gray-100 border rounded">Editar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sections;
