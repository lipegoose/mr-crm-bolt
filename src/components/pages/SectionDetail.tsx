import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SectionsService, Section } from '../../services/SectionsService';
import { SectionItemsService, SectionItem } from '../../services/SectionItemsService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Select } from '../ui/Select';

// Toggle simples e acessível, consistente com Tailwind do projeto
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

const SectionDetail: React.FC = () => {
  const { id } = useParams();
  const sectionId = Number(id);
  const navigate = useNavigate();

  const [section, setSection] = React.useState<Section | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<SectionItem[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await SectionsService.get(sectionId);
      setSection(s);
      // carregar itens básicos
      const list = await SectionItemsService.list(sectionId, { page: 1, per_page: 50 });
      setItems(list.data);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar seção');
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  React.useEffect(() => {
    if (!Number.isFinite(sectionId)) return;
    load();
  }, [load, sectionId]);

  const updateField = <K extends keyof Section>(key: K, value: Section[K]) => {
    if (!section) return;
    setSection({ ...section, [key]: value });
  };

  const handleSave = async () => {
    if (!section) return;
    setSaving(true);
    try {
      const updated = await SectionsService.update(section.id, {
        titulo: section.titulo,
        slug: section.slug,
        subtitulo: section.subtitulo,
        descricao: section.descricao,
        url_link: section.url_link,
        texto_url: section.texto_url,
        botao: section.botao,
        url_amigavel: section.url_amigavel,
        template: section.template,
        show_on_home: section.show_on_home,
        ordem: section.ordem,
        ativo: section.ativo,
      });
      setSection(updated);
    } catch (e) {
      console.error(e);
      alert('Falha ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateItem = async () => {
    try {
      const safeItems = Array.isArray(items) ? items : [];
      const created = await SectionItemsService.create(sectionId, {
        titulo: 'Novo Item',
        ativo: true,
        ordem: ((safeItems[safeItems.length - 1]?.ordem ?? 0) + 1),
      });
      navigate(`/cms/sections/${sectionId}/items/${created.id}`);
    } catch (e) {
      console.error(e);
      alert('Falha ao criar item');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Editar Seção</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/cms/sections')}>Voltar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </div>

        {loading && <div>Carregando...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {section && (
          <div className="space-y-8">
            {/* Informações principais */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Informações da Seção</h2>
              <div className="space-y-4">
                {/* Topo à direita: Mostrar na Home e Ativo */}
                <div className="flex justify-end gap-6">
                  <Toggle id="toggle-show-on-home" checked={!!section.show_on_home} onChange={(v) => updateField('show_on_home', v)} label="Mostrar na home" />
                  <Toggle id="toggle-ativo" checked={!!section.ativo} onChange={(v) => updateField('ativo', v)} label="Ativo" />
                </div>

                {/* Título (linha inteira) */}
                <div>
                  <Input label="Título" value={section.titulo} onChange={(e) => updateField('titulo', e.target.value)} />
                </div>

                {/* Subtítulo (linha inteira) */}
                <div>
                  <Input label="Subtítulo" value={section.subtitulo || ''} onChange={(e) => updateField('subtitulo', e.target.value)} />
                </div>

                {/* Slug, Template e Ordem (mesma linha) */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-5">
                    <Input label="Slug" value={section.slug} onChange={(e) => updateField('slug', e.target.value)} />
                  </div>
                  <div className="col-span-12 md:col-span-5">
                    <Select
                      label="Template"
                      value={section.template}
                      onChange={(e) => updateField('template', e.target.value as Section['template'])}
                      options={[
                        { value: 'destaques', label: 'destaques' },
                        { value: 'sobre', label: 'sobre' },
                        { value: 'servicos', label: 'servicos' },
                        { value: 'blog', label: 'blog' },
                      ]}
                    />
                  </div>
                  <div className="col-span-12 md:col-span-2">
                    <Input label="Ordem" type="number" value={section.ordem as any} onChange={(e) => updateField('ordem', Number(e.target.value))} />
                  </div>
                </div>

                {/* Descrição (linha inteira) */}
                <div>
                  <TextArea label="Descrição" rows={3} value={section.descricao || ''} onChange={(e) => updateField('descricao', e.target.value)} />
                </div>

                {/* URL, Texto do botão e Exibir botão (mesma linha) */}
                <div className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-12 md:col-span-5">
                    <Input label="URL" value={section.url_link || ''} onChange={(e) => updateField('url_link', e.target.value)} />
                  </div>
                  <div className="col-span-12 md:col-span-5">
                    <Input label="Texto do botão" value={section.texto_url || ''} onChange={(e) => updateField('texto_url', e.target.value)} />
                  </div>
                  <div className="col-span-12 md:col-span-2 flex items-center md:justify-start">
                    <Toggle id="toggle-botao" checked={!!section.botao} onChange={(v) => updateField('botao', v)} label="Exibir botão" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card separado: Itens */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Itens</h2>
          <Button variant="secondary" onClick={handleCreateItem}>Adicionar item</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(items ?? []).map(it => (
            <div key={it.id} className="border rounded p-4 bg-white">
              <div className="font-medium">{it.titulo}</div>
              <div className="text-sm text-gray-600">ativo: {it.ativo ? 'sim' : 'não'} · ordem: {it.ordem}</div>
              <div className="mt-2 text-right">
                <Button variant="secondary" onClick={() => navigate(`/cms/sections/${sectionId}/items/${it.id}`)}>Editar</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionDetail;
