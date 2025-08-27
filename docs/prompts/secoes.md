# Seções CMS – Itens pendentes

Lista objetiva do que ainda falta implementar e/ou finalizar.

## Backend (Lumen)
- [ ] Endpoint público GET /api/public/sections com filtros (slug, home=1, template, keyword) e retorno conforme contrato simplificado.
- [ ] Upload e gestão de fotos de itens e seções (múltiplas imagens, principal única, ordenar, remover) reutilizando padrão de Imóveis.
- [ ] Recursos/transformers para normalizar resposta pública (foto principal + galeria) e CMS.
- [ ] Validador AnchorOrUrl opcional para url_link (se necessário), mantendo string|max:500 atualmente.

## Painel CMS (Bolt)
- [ ] Fotos do item: UI de upload múltiplo, marcar principal, ordenar e remover.
- [ ] Fotos da seção: UI equivalente.
- [ ] Keywords: CRUD simples + attach/detach aos itens (autocomplete multi-select).
- [ ] Lista de Seções: filtros (ativo, template, show_on_home) e toggle direto de show_on_home.
- [ ] Feedback: toasts sutis no autosave (sucesso/erro) sem poluir a interface.
- [ ] Reordenar itens (drag-and-drop) com persistência de ordem.

## Site Público (bhelite-site)
- [ ] Service para consumir GET /api/public/sections (pending promises + cache volátil curto).
- [ ] Componentização de templates (destaques, sobre, servicos, blog) e renderização dos dados reais.
- [ ] Resiliência: estado vazio amigável e fallbacks de imagem.

## Testes e validação
- [ ] Garantir única foto principal por entidade (seção/item) em todas as operações.
- [ ] Verificar limites (até 12 fotos) e tamanhos (até 5MB) onde aplicável.
- [ ] Fluxos CRUD completos com autosave campo a campo e filtros funcionando.

---
Anotações: manter padrões de anti-duplicação de GETs, PUT parcial por campo e sem cache persistente em componentes.