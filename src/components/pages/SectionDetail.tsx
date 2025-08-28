import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { SectionsService, Section } from '../../services/SectionsService';
import { SectionItemsService, SectionItem } from '../../services/SectionItemsService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Select } from '../ui/Select';
import { StepNavigation } from '../ui/StepNavigation';
import SectionImagens from '../sections/SectionImagens';
import SectionKeywords from '../sections/SectionKeywords';

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
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<SectionItem[]>([]);
  const [activeStep, setActiveStep] = React.useState<'info' | 'keywords' | 'imagens' | 'itens'>('info');

  // Autosave com debounce por campo (padrão dos outros CRUDs)
  const debounceRefs = React.useRef<Record<string, number | undefined>>({});
  const autoSaveField = <K extends keyof Section>(field: K, value: Section[K]) => {
    if (!section) return;
    const key = String(field);
    if (debounceRefs.current[key]) window.clearTimeout(debounceRefs.current[key]);
    debounceRefs.current[key] = window.setTimeout(async () => {
      try {
        await SectionsService.update(section.id, { [field]: value } as Partial<Section>);
      } catch (e) {
        console.error(`Erro ao salvar campo ${key}`, e);
      }
    }, 600);
  };

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await SectionsService.get(sectionId);
      setSection(s);
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

  // Removido botão/ação de salvar: agora salvamento é dinâmico por campo

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

  // Controle para buscar itens somente quando entrar na aba "itens"
  const itemsFetchEntryRef = React.useRef<number>(0);
  const fetchItemsForCurrentEntry = React.useCallback(async () => {
    try {
      const list = await SectionItemsService.list(sectionId, { page: 1, per_page: 50 });
      setItems(list.data);
    } catch (e) {
      console.error('Erro ao carregar itens da seção', e);
    }
  }, [sectionId]);

  const setStepAndMaybeFetch = (id: typeof activeStep) => {
    setActiveStep(id);
    if (id === 'itens') {
      // nova entrada na aba itens -> incrementar e buscar uma única vez
      itemsFetchEntryRef.current += 1;
      // chama async sem duplicar nesta entrada
      void (async () => {
        // se outra entrada acontecer antes de concluir, este entry fica desconsiderado pelo número
        await fetchItemsForCurrentEntry();
        // opcional: poderíamos checar entry === itemsFetchEntryRef.current para evitar sobrescrever estado antigo
      })();
    }
  };

  const steps = [
    { id: 'info', label: 'Informações da Seção' },
    { id: 'keywords', label: 'Keywords' },
    { id: 'imagens', label: 'Imagens da Seção' },
    { id: 'itens', label: 'Itens da Seção' },
  ] as const;

  return (
    <div>
      {/* Header fora do card, idêntico ao ImovelCadastro */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-title font-bold text-neutral-black">Cadastro de Seção</h1>
          <p className="text-neutral-gray-medium">Preencha os dados da seção em cada etapa</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/cms/sections')}
            className="flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </Button>
        </div>
      </div>

      {/* Container do wizard: mesmo layout do ImovelCadastro */}
      <div className="flex bg-white border border-neutral-gray rounded-default shadow-sm">
        <StepNavigation
          steps={steps.map(s => ({ id: s.id, label: s.label }))}
          activeStep={activeStep}
          onStepChange={(id) => setStepAndMaybeFetch(id as typeof activeStep)}
        />

        <div className="flex-1 p-6">

            {loading && <div>Carregando...</div>}
            {error && <div className="text-red-600">{error}</div>}

            {/* Conteúdo por etapa */}
            {section && activeStep === 'info' && (
              <div className="space-y-8">
                <div className="border-b pb-6">
                  <h2 className="text-xl font-semibold mb-4">Informações da Seção</h2>
                  <div className="space-y-4">
                    <div className="flex justify-end gap-6 items-end flex-wrap">
                      <Toggle id="toggle-show-on-home" checked={!!section.show_on_home} onChange={(v) => { updateField('show_on_home', v); autoSaveField('show_on_home', v as any); }} label="Mostrar na home" />
                      <Toggle id="toggle-ativo" checked={!!section.ativo} onChange={(v) => { updateField('ativo', v); autoSaveField('ativo', v as any); }} label="Ativo" />
                      <div className="w-28">
                        <Input label="Ordem" type="number" value={section.ordem as any} onChange={(e) => { const num = Math.min(999, Math.max(0, Number(e.target.value))); updateField('ordem', num); autoSaveField('ordem', num as any); }} />
                      </div>
                    </div>

                    <div>
                      <Input label="Título" value={section.titulo} onChange={(e) => { updateField('titulo', e.target.value); autoSaveField('titulo', e.target.value); }} />
                    </div>

                    <div>
                      <Input label="Subtítulo" value={section.subtitulo || ''} onChange={(e) => { updateField('subtitulo', e.target.value); autoSaveField('subtitulo', e.target.value || (undefined as any)); }} />
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6">
                        <Input label="Slug" value={section.slug} onChange={(e) => { updateField('slug', e.target.value); autoSaveField('slug', e.target.value); }} />
                      </div>
                      <div className="col-span-12 md:col-span-6">
                        <Select
                          label="Template"
                          value={section.template}
                          onChange={(e) => { const v = e.target.value as Section['template']; updateField('template', v); autoSaveField('template', v); }}
                          options={[
                            { value: 'destaques', label: 'destaques' },
                            { value: 'sobre', label: 'sobre' },
                            { value: 'servicos', label: 'servicos' },
                            { value: 'blog', label: 'blog' },
                          ]}
                        />
                      </div>
                    </div>

                    <div>
                      <TextArea label="Descrição" rows={3} value={section.descricao || ''} onChange={(e) => { updateField('descricao', e.target.value); autoSaveField('descricao', e.target.value || (undefined as any)); }} />
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-12 md:col-span-5">
                        <Input label="URL" value={section.url_link || ''} onChange={(e) => { updateField('url_link', e.target.value); autoSaveField('url_link', e.target.value || (undefined as any)); }} />
                      </div>
                      <div className="col-span-12 md:col-span-5">
                        <Input label="Texto do botão" value={section.texto_url || ''} onChange={(e) => { updateField('texto_url', e.target.value); autoSaveField('texto_url', e.target.value || (undefined as any)); }} />
                      </div>
                      <div className="col-span-12 md:col-span-2 flex items-center md:justify-start">
                        <Toggle id="toggle-botao" checked={!!section.botao} onChange={(v) => { updateField('botao', v); autoSaveField('botao', v as any); }} label="Exibir botão" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 'keywords' && section && (
              <SectionKeywords
                sectionId={sectionId}
                initialLinkedIds={(section.keywords ?? []).map(k => k.id)}
              />
            )}

            {activeStep === 'imagens' && Number.isFinite(sectionId) && (
              <SectionImagens sectionId={sectionId} />
            )}

            {activeStep === 'itens' && (
              <div>
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
            )}

            {/* Navegação inferior Anterior/Próximo (com borda superior, como no ImovelCadastro) */}
            <div className="flex justify-between mt-8 pt-4 border-t border-neutral-gray">
              <Button
                variant="secondary"
                onClick={() => {
                  const order = ['info','keywords','imagens','itens'] as const;
                  const idx = order.indexOf(activeStep);
                  if (idx > 0) setStepAndMaybeFetch(order[idx-1]);
                }}
                disabled={(() => { const order = ['info','keywords','imagens','itens'] as const; return order.indexOf(activeStep) === 0; })()}
              >Anterior</Button>
              <Button
                onClick={() => {
                  const order = ['info','keywords','imagens','itens'] as const;
                  const idx = order.indexOf(activeStep);
                  if (idx < order.length - 1) setStepAndMaybeFetch(order[idx+1]);
                }}
                disabled={(() => { const order = ['info','keywords','imagens','itens'] as const; return order.indexOf(activeStep) === order.length - 1; })()}
              >Próximo</Button>
            </div>
        </div>
      </div>
    </div>
  );
}
;

export default SectionDetail;
