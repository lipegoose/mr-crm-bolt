import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { SectionItemsService, SectionItem } from '../../services/SectionItemsService';
import { SectionsService } from '../../services/SectionsService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';

// Toggle acessível (igual ao usado em SectionDetail)
const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; id?: string }> = ({ checked, onChange, label, id }) => {
  return (
    <label htmlFor={id} className="flex items-center gap-2 select-none">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={
          `relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 border ${
            checked ? 'bg-primary-orange border-primary-orange' : 'bg-gray-200 border-gray-300'
          }`
        }
      >
        <span
          className={
            `inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
              checked ? 'translate-x-5' : 'translate-x-0.5'
            }`
          }
        />
      </button>
      <span className="text-sm text-gray-800">{label}</span>
    </label>
  );
};

const SectionItemDetail: React.FC = () => {
  const { id, itemId } = useParams();
  const sectionId = Number(id);
  const parsedItemId = Number(itemId);
  const navigate = useNavigate();

  const [item, setItem] = React.useState<SectionItem | null>(null);
  const [sectionTitle, setSectionTitle] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
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
    // carrega título da seção para breadcrumb
    SectionsService.get(sectionId).then((sec) => setSectionTitle(sec?.titulo || `Seção ${sectionId}`)).catch(() => {});
  }, [load, sectionId, parsedItemId]);

  const updateField = <K extends keyof SectionItem>(key: K, value: SectionItem[K]) => {
    if (!item) return;
    setItem({ ...item, [key]: value });
  };

  // Autosave com debounce por campo
  const debounceRefs = React.useRef<Record<string, number | undefined>>({});
  const autoSaveField = <K extends keyof SectionItem>(field: K, value: SectionItem[K]) => {
    if (!item) return;
    const key = String(field);
    if (debounceRefs.current[key]) window.clearTimeout(debounceRefs.current[key]);
    debounceRefs.current[key] = window.setTimeout(async () => {
      try {
        await SectionItemsService.update(sectionId, item.id, { [field]: value } as Partial<SectionItem>);
      } catch (e) {
        console.error(`Erro ao salvar campo ${key}`, e);
      }
    }, 600);
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
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <nav className="text-sm text-gray-500 mb-2" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 flex-wrap">
                <li>
                  <Link to="/cms/sections" className="hover:text-gray-700">Seções</Link>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <Link to={`/cms/sections/${sectionId}`} className="hover:text-gray-700">{sectionTitle || `Seção ${sectionId}`}</Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-700">{item?.titulo || `Item ${parsedItemId}`}</li>
              </ol>
            </nav>
            <h1 className="text-2xl font-semibold">Editar Item</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate(`/cms/sections/${sectionId}`)}>Voltar</Button>
            <button onClick={handleDelete} className="px-3 py-2 border rounded text-red-600 border-red-600">Remover</button>
          </div>
        </div>

        {loading && <div>Carregando...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {item && (
          <div className="space-y-8">
            {/* Informações principais */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Informações do Item</h2>
              <div className="space-y-4">
                {/* Topo à direita: toggles e ordem */}
                <div className="flex justify-end gap-6 items-end flex-wrap">
                  <Toggle id="toggle-ativo-item" checked={!!item.ativo} onChange={(v) => { updateField('ativo', v); autoSaveField('ativo', v as any); }} label="Ativo" />
                  <Toggle id="toggle-home-item" checked={!!item.show_on_home} onChange={(v) => { updateField('show_on_home', v as any); autoSaveField('show_on_home', v as any); }} label="Mostrar na home" />
                  <div className="w-28">
                    <Input label="Ordem" type="number" value={item.ordem as any} onChange={(e) => { const num = Math.min(999, Math.max(0, Number(e.target.value))); updateField('ordem', num); autoSaveField('ordem', num as any); }} />
                  </div>
                </div>

                {/* Título (linha inteira) */}
                <div>
                  <Input label="Título" value={item.titulo} onChange={(e) => { updateField('titulo', e.target.value); autoSaveField('titulo', e.target.value); }} />
                </div>

                {/* Slug (linha inteira) */}
                <div>
                  <Input
                    label="Slug"
                    value={item.slug || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateField('slug', v as any);
                      autoSaveField('slug', (v || undefined) as any);
                    }}
                  />
                </div>

                {/* Subtítulo (linha inteira) */}
                <div>
                  <Input label="Subtítulo" value={item.subtitulo || ''} onChange={(e) => { updateField('subtitulo', e.target.value); autoSaveField('subtitulo', e.target.value || (undefined as any)); }} />
                </div>

                {/* Descrição (linha inteira) */}
                <div>
                  <TextArea label="Descrição" rows={3} value={item.descricao || ''} onChange={(e) => { updateField('descricao', e.target.value); autoSaveField('descricao', e.target.value || (undefined as any)); }} />
                </div>

                {/* URL, Texto do botão e Exibir botão (mesma linha 5/5/2) */}
                <div className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-12 md:col-span-5">
                    <Input label="URL" value={item.url_link || ''} onChange={(e) => { updateField('url_link', e.target.value); autoSaveField('url_link', e.target.value || (undefined as any)); }} />
                  </div>
                  <div className="col-span-12 md:col-span-5">
                    <Input label="Texto do botão" value={item.texto_url || ''} onChange={(e) => { updateField('texto_url', e.target.value); autoSaveField('texto_url', e.target.value || (undefined as any)); }} />
                  </div>
                  <div className="col-span-12 md:col-span-2 flex items-center md:justify-start">
                    <Toggle id="toggle-botao-item" checked={!!item.botao} onChange={(v) => { updateField('botao', v); autoSaveField('botao', v as any); }} label="Exibir botão" />
                  </div>
                </div>

                
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionItemDetail;
