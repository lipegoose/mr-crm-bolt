import React from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { KeywordService, Keyword } from '../../services/KeywordService';
import { SectionsService } from '../../services/SectionsService';
import logger from '../../utils/logger';

interface Props { sectionId?: number; initialLinkedIds?: number[] }

// Guard de módulo para evitar chamada duplicada do catálogo em React 18 StrictMode (montagem dupla em DEV)
let didFetchCatalogOnce = false;
// Cache do catálogo para hidratar estado em remontagens legítimas
let catalogCache: Keyword[] | null = null;
// Flag de log para hidratação via cache (evita logs duplicados em StrictMode)
let didHydrateCacheLogOnce = false;

const SectionKeywords: React.FC<Props> = ({ sectionId, initialLinkedIds }) => {
  const [q, setQ] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [keywords, setKeywords] = React.useState<Keyword[]>([]);
  const [nome, setNome] = React.useState('');
  const [descricao, setDescricao] = React.useState('');
  const [linkedIds, setLinkedIds] = React.useState<Set<number>>(new Set((initialLinkedIds || []).map((v) => Number(v))));
  // Controle de fetch do catálogo (lista geral)
  const didFetchCatalogRef = React.useRef(false);
  // Fetch de vínculos por seção é disparado a cada montagem/mudança de sectionId; em DEV StrictMode o efeito roda 2x,
  // então evitamos setState de uma chamada anterior via flag 'mounted' no cleanup.
  // Controle de concorrência/cooldown do refetch
  const refetchingRef = React.useRef(false);
  const lastRefetchRef = React.useRef(0);

  // Não sincronizar continuamente a partir de props para evitar "cache" antigo sobrescrevendo o estado vindo do backend.
  // O estado inicial já é derivado de initialLinkedIds; mudanças reais virão do GET dedicado da etapa.
  React.useEffect(() => {
    // noop
  }, []);

  // Sempre que entrar na aba (montar) ou mudar sectionId, buscar vínculos atuais no backend
  React.useEffect(() => {
    if (!sectionId || !Number.isFinite(sectionId)) return;
    let mounted = true;
    logger.info('[SECTION_KEYWORDS] Keywords:fetch:sectionLinked:start', { sectionId });
    (async () => {
      try {
        const ks = await SectionsService.listSectionKeywords(sectionId);
        if (!mounted) return;
        const ids = ks.map(k => Number(k.id));
        setLinkedIds(new Set(ids));
        logger.info('[SECTION_KEYWORDS] Keywords:fetch:sectionLinked:done', { sectionId, ids });
      } catch (e: any) {
        if (!mounted) return;
        logger.error('[SECTION_KEYWORDS] Keywords:fetch:sectionLinked:error', e?.message || e);
        // silencioso: manter estado atual se falhar
      }
    })();
    return () => { mounted = false; };
  }, [sectionId]);

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const resp = await KeywordService.list({ q, per_page: 50 });
      setKeywords(resp.data);
      // Atualiza o cache apenas quando a busca não tiver filtro, mantendo o catálogo base
      if (!q || q.trim() === '') {
        catalogCache = resp.data;
      }
    } catch (e: any) {
      setError(e?.message || 'Falha ao carregar keywords');
    } finally { setLoading(false); }
  }, [q]);

  // Refetch dedicado para os vínculos da seção (reutilizável)
  const refetchLinked = React.useCallback(async () => {
    if (!sectionId || !Number.isFinite(sectionId)) return;
    const now = Date.now();
    if (refetchingRef.current) return;
    if (now - lastRefetchRef.current < 400) return; // cooldown unificado
    refetchingRef.current = true;
    lastRefetchRef.current = now;
    logger.info('[SECTION_KEYWORDS] Keywords:refetch:sectionLinked:start', { sectionId });
    try {
      const ks = await SectionsService.listSectionKeywords(sectionId);
      const ids = ks.map(k => Number(k.id));
      setLinkedIds(new Set(ids));
      logger.info('[SECTION_KEYWORDS] Keywords:refetch:sectionLinked:done', { sectionId, ids });
    } catch (e: any) {
      logger.error('[SECTION_KEYWORDS] Keywords:refetch:sectionLinked:error', e?.message || e);
    } finally {
      refetchingRef.current = false;
    }
  }, [sectionId]);

  // Buscar catálogo ao montar (apenas uma vez em DEV StrictMode), com hidratação via cache em remontagens
  React.useEffect(() => {
    // Se já buscamos anteriormente nesta sessão e temos cache, hidrate o estado para evitar lista vazia
    if (didFetchCatalogOnce && Array.isArray(catalogCache)) {
      setKeywords(catalogCache);
      if (!didHydrateCacheLogOnce) {
        logger.info('[SECTION_KEYWORDS] Keywords:fetch:catalog:hydrate:cache', { count: catalogCache?.length ?? 0 });
        didHydrateCacheLogOnce = true;
      }
      return;
    }
    // Em DEV com StrictMode, o componente monta duas vezes. Este guard em escopo de módulo evita a 2ª chamada.
    if (didFetchCatalogOnce) return;
    didFetchCatalogRef.current = true;
    didFetchCatalogOnce = true;
    logger.info('[SECTION_KEYWORDS] Keywords:fetch:catalog:start');
    (async () => {
      setLoading(true); setError(null);
      try {
        const resp = await KeywordService.list({ q, per_page: 50 });
        setKeywords(resp.data);
        catalogCache = resp.data;
        logger.info('[SECTION_KEYWORDS] Keywords:fetch:catalog:done', { count: resp.data?.length ?? 0 });
      } catch (e: any) {
        setError(e?.message || 'Falha ao carregar keywords');
        logger.error('[SECTION_KEYWORDS] Keywords:fetch:catalog:error', e?.message || e);
      } finally { setLoading(false); }
    })();
  }, []);


  // Refetch quando a aba/rota voltar a ficar visível (hidden -> visible)
  React.useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        refetchLinked();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [sectionId, refetchLinked]);

  const handleCreate = async () => {
    if (!nome.trim()) return;
    try {
      const created = await KeywordService.create({ nome, descricao });
      setNome(''); setDescricao('');
      setError(null);
      setKeywords((prev) => [created, ...prev]);
      if (sectionId && Number.isFinite(sectionId)) {
        try {
          await SectionsService.attachKeyword(sectionId, created.id);
          setLinkedIds(prev => { const s = new Set(prev); s.add(Number(created.id)); return s; });
        } catch {}
      }
    } catch (e: any) {
      // Tratamento amigável para erros 422 vindos do backend (validação Laravel)
      const status = e?.response?.status;
      const data = e?.response?.data;
      if (status === 422 && data?.errors) {
        const errs: Record<string, string[] | string> = data.errors;
        const nomeMsgs = Array.isArray(errs?.nome) ? errs.nome : (errs?.nome ? [errs.nome] : []);
        const slugMsgs = Array.isArray(errs?.slug) ? errs.slug : (errs?.slug ? [errs.slug] : []);
        const all = [...nomeMsgs, ...slugMsgs];
        const msg = all.find((m) => /already been taken|já está em uso|unique/i.test(String(m)))
          ? 'Esta keyword já existe. Utilize a existente na seção.'
          : (data?.message || 'Erro de validação ao criar keyword');
        setError(msg);
      } else {
        setError(e?.message || 'Falha ao criar keyword');
      }
    }
  };

  const handleAttach = async (k: Keyword) => {
    if (!sectionId || !Number.isFinite(sectionId)) return;
    try {
      logger.info('[SECTION_KEYWORDS] Keywords:attach:start', { sectionId, id: Number(k.id) });
      await SectionsService.attachKeyword(sectionId, k.id);
      setError(null);
      setLinkedIds(prev => { const s = new Set(prev); s.add(Number(k.id)); return s; });
      logger.info('[SECTION_KEYWORDS] Keywords:attach:done', { sectionId, id: Number(k.id) });
    } catch (e: any) {
      // manter mensagem simples caso conflito/erro
      setError(e?.response?.data?.message || e?.message || 'Falha ao vincular keyword à seção');
    }
  };

  const handleDetach = async (k: Keyword) => {
    if (!sectionId || !Number.isFinite(sectionId)) return;
    try {
      logger.info('[SECTION_KEYWORDS] Keywords:detach:start', { sectionId, id: Number(k.id) });
      await SectionsService.detachKeyword(sectionId, k.id);
      setError(null);
      setLinkedIds(prev => { const s = new Set(prev); s.delete(Number(k.id)); return s; });
      logger.info('[SECTION_KEYWORDS] Keywords:detach:done', { sectionId, id: Number(k.id) });
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Falha ao desvincular keyword da seção');
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
        {/* Atualização de vínculos é automática ao voltar foco/visibilidade; botão removido */}
      </div>

      <div className="bg-white rounded-lg border p-4 mb-6">
        <h3 className="font-medium mb-3">Nova keyword</h3>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 md:col-span-4">
            <Input label="Nome" value={nome} onChange={(e) => { setNome(e.target.value); if (error) setError(null); }} />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Input label="Descrição (opcional)" value={descricao} onChange={(e) => { setDescricao(e.target.value); if (error) setError(null); }} />
          </div>
          <div className="col-span-12 md:col-span-2 flex items-end">
            <Button onClick={handleCreate}>Adicionar</Button>
          </div>
        </div>
        {sectionId && (
          <div className="text-xs text-neutral-gray-medium mt-2">Seção atual: #{sectionId}</div>
        )}
      </div>

      {loading && <div className="text-neutral-gray-medium">Carregando...</div>}
      {error && <div className="text-status-error mb-2">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {keywords.map(k => {
          const isLinked = linkedIds.has(Number(k.id));
          return (
            <div key={k.id} className="border rounded p-3 bg-white">
              <div className="font-medium">{k.nome}</div>
              <div className="text-sm text-neutral-gray-medium">slug: {k.slug}</div>
              {k.descricao && <div className="text-sm mt-1">{k.descricao}</div>}
              {!!sectionId && (
                <div className="mt-2 text-right">
                  {isLinked ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 border border-green-200">Vinculada</span>
                      <Button variant="secondary" onClick={() => handleDetach(k)}>Desvincular</Button>
                    </div>
                  ) : (
                    <Button variant="secondary" onClick={() => handleAttach(k)}>Vincular</Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {keywords.length === 0 && !loading && (
          <div className="text-neutral-gray-medium">Nenhuma keyword encontrada.</div>
        )}
      </div>
    </div>
  );
};

export default SectionKeywords;
