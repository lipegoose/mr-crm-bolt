import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SectionItemsService, SectionItem } from '../../services/SectionItemsService';

const SectionItemDetail: React.FC = () => {
  const { id, itemId } = useParams();
  const sectionId = Number(id);
  const parsedItemId = Number(itemId);
  const navigate = useNavigate();

  const [item, setItem] = React.useState<SectionItem | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await SectionItemsService.get(sectionId, parsedItemId);
      setItem(res);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar item');
    } finally {
      setLoading(false);
    }
  }, [sectionId, parsedItemId]);

  React.useEffect(() => {
    if (!Number.isFinite(sectionId) || !Number.isFinite(parsedItemId)) return;
    load();
  }, [load, sectionId, parsedItemId]);

  const updateField = <K extends keyof SectionItem>(key: K, value: SectionItem[K]) => {
    if (!item) return;
    setItem({ ...item, [key]: value });
  };

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    try {
      const updated = await SectionItemsService.update(sectionId, item.id, {
        titulo: item.titulo,
        subtitulo: item.subtitulo,
        descricao: item.descricao,
        url_link: item.url_link,
        texto_url: item.texto_url,
        botao: item.botao,
        url_amigavel: item.url_amigavel,
        ordem: item.ordem,
        ativo: item.ativo,
      });
      setItem(updated);
    } catch (e) {
      console.error(e);
      alert('Falha ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Remover este item?')) return;
    try {
      await SectionItemsService.remove(sectionId, parsedItemId);
      navigate(`/cms/sections/${sectionId}`);
    } catch (e) {
      console.error(e);
      alert('Falha ao remover');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Editar Item</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/cms/sections/${sectionId}`)} className="px-3 py-2 border rounded">Voltar</button>
          <button onClick={handleDelete} className="px-3 py-2 border rounded text-red-600 border-red-600">Remover</button>
          <button onClick={handleSave} disabled={saving} className="px-3 py-2 bg-primary-orange text-white rounded">{saving ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </div>

      {loading && <div>Carregando...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {item && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-gray-600">Título</span>
              <input value={item.titulo} onChange={(e) => updateField('titulo', e.target.value)} className="border rounded px-3 py-2 w-full" />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Subtítulo</span>
              <input value={item.subtitulo || ''} onChange={(e) => updateField('subtitulo', e.target.value)} className="border rounded px-3 py-2 w-full" />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Descrição</span>
              <textarea value={item.descricao || ''} onChange={(e) => updateField('descricao', e.target.value)} className="border rounded px-3 py-2 w-full min-h-[100px]" />
            </label>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-sm text-gray-600">URL</span>
                <input value={item.url_link || ''} onChange={(e) => updateField('url_link', e.target.value)} className="border rounded px-3 py-2 w-full" />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">Texto do botão</span>
                <input value={item.texto_url || ''} onChange={(e) => updateField('texto_url', e.target.value)} className="border rounded px-3 py-2 w-full" />
              </label>
            </div>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={!!item.botao} onChange={(e) => updateField('botao', e.target.checked)} />
              <span>Exibir botão</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={!!item.ativo} onChange={(e) => updateField('ativo', e.target.checked)} />
              <span>Ativo</span>
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Ordem</span>
              <input type="number" value={item.ordem} onChange={(e) => updateField('ordem', Number(e.target.value))} className="border rounded px-3 py-2 w-full" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionItemDetail;
