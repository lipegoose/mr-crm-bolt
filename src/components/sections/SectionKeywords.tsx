import React from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { KeywordService, Keyword } from '../../services/KeywordService';

const SectionKeywords: React.FC = () => {
  const [q, setQ] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [keywords, setKeywords] = React.useState<Keyword[]>([]);
  const [nome, setNome] = React.useState('');
  const [descricao, setDescricao] = React.useState('');
  const didFetchRef = React.useRef(false);

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const resp = await KeywordService.list({ q, per_page: 50 });
      setKeywords(resp.data);
    } catch (e: any) {
      setError(e?.message || 'Falha ao carregar keywords');
    } finally { setLoading(false); }
  }, [q]);

  // Chamar apenas uma vez ao montar (entrada na aba) mesmo em StrictMode
  React.useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const resp = await KeywordService.list({ q, per_page: 50 });
        setKeywords(resp.data);
      } catch (e: any) {
        setError(e?.message || 'Falha ao carregar keywords');
      } finally { setLoading(false); }
    })();
  }, []);

  const handleCreate = async () => {
    if (!nome.trim()) return;
    try {
      const created = await KeywordService.create({ nome, descricao });
      setNome(''); setDescricao('');
      setKeywords((prev) => [created, ...prev]);
    } catch (e: any) {
      setError(e?.message || 'Falha ao criar keyword');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-title font-semibold mb-4">Keywords</h2>
      <p className="text-neutral-gray-medium mb-6">Gerencie o catálogo de palavras-chave utilizadas nos itens da seção.</p>

      <div className="grid grid-cols-12 gap-3 mb-6">
        <div className="col-span-12 md:col-span-4">
          <Input label="Buscar" placeholder="Digite para filtrar" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="col-span-12 md:col-span-2 flex items-end">
          <Button onClick={load}>Buscar</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 mb-6">
        <h3 className="font-medium mb-3">Nova keyword</h3>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 md:col-span-4">
            <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Input label="Descrição (opcional)" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <div className="col-span-12 md:col-span-2 flex items-end">
            <Button onClick={handleCreate}>Adicionar</Button>
          </div>
        </div>
      </div>

      {loading && <div className="text-neutral-gray-medium">Carregando...</div>}
      {error && <div className="text-status-error mb-2">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {keywords.map(k => (
          <div key={k.id} className="border rounded p-3 bg-white">
            <div className="font-medium">{k.nome}</div>
            <div className="text-sm text-neutral-gray-medium">slug: {k.slug}</div>
            {k.descricao && <div className="text-sm mt-1">{k.descricao}</div>}
          </div>
        ))}
        {keywords.length === 0 && !loading && (
          <div className="text-neutral-gray-medium">Nenhuma keyword encontrada.</div>
        )}
      </div>
    </div>
  );
};

export default SectionKeywords;
