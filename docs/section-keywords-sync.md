# Guia: Sincronização de Keywords por Seção (SectionKeywords)

Este documento consolida padrões e decisões adotadas no componente `mr-crm-bolt/src/components/sections/SectionKeywords.tsx` e nos serviços relacionados, para garantir sincronização confiável de keywords vinculadas a uma seção, com logs essenciais, atualização automática e sem chamadas duplicadas.

## Objetivos
- Manter apenas logs essenciais para debug eficaz.
- Atualização 100% automática dos vínculos ao retornar para a aba/rota (sem botão manual).
- Evitar chamadas duplicadas (React 18 StrictMode) e rajadas de refetch.
- Garantir consistência entre o retorno do backend e o estado/UI.

## Decisões e padrões

- **Tag de logs dedicada:** use `[SECTION_KEYWORDS]` em todas as mensagens do componente. Em `mr-crm-bolt/src/utils/logger.ts`, a tag deve estar em `ALWAYS_TAGS` para exibir `debug/info` mesmo sem debug global.
- **Refetch automático:** apenas por `document.visibilitychange` quando `document.visibilityState === 'visible'`.
- **Sem botão manual:** o botão "Atualizar vínculos" foi removido.
- **Guarda de concorrência:** `refetchLinked()` possui lock in-flight + cooldown global (ex.: 400 ms) para evitar duplicidades.
- **Compatibilidade com StrictMode:**
  - Efeito de fetch de vínculos não usa mais refs de bloqueio por montagem; usa apenas `mounted` no cleanup para evitar setState após unmount.
  - Deduplicação de requisições no serviço via reuse de Promise pendente + cache leve com TTL curto.
- **Catálogo com cache de módulo:** catálogo é buscado uma vez por sessão (DEV) e cacheado para hidratar em remontagens legítimas. Log de hidratação é deduplicado 1x/sessão.

## Componente: `SectionKeywords.tsx`

- **Estados relevantes**
  - `keywords: Keyword[]` (catálogo)
  - `linkedIds: Set<number>` (IDs vinculados da seção)
- **Efeito de fetch de vínculos**
  - Dispara em montagem e ao mudar `sectionId`.
  - Usa `mounted` no cleanup.
  - Logs:
    - `Keywords:fetch:sectionLinked:start { sectionId }`
    - `Keywords:fetch:sectionLinked:done { sectionId, ids }`
- **Refetch ao voltar para aba**
  - Listener: `document.visibilitychange`.
  - Condição: `document.visibilityState === 'visible'`.
  - Guarda: lock in-flight + cooldown para prevenir duplicidade.
- **Catálogo**
  - Busca única na sessão (DEV) com cache de módulo + hidratação em remontagem.
  - Logs:
    - `Keywords:fetch:catalog:start|done`
    - `Keywords:fetch:catalog:hydrate:cache { count }` (no máx. 1x/sessão)
- **Ações de vínculo**
  - `attach`/`detach` atualizam `linkedIds` imediatamente.
  - Logs:
    - `Keywords:attach:start|done { sectionId, id }`
    - `Keywords:detach:start|done { sectionId, id }`

## Serviço: `SectionsService.ts`

- **Deduplicação de GET de vínculos por seção**
  - Campo: `pendingSectionKeywords: Record<number, Promise<Keyword[]> | undefined>`.
  - Reutiliza a mesma Promise quando a requisição está pendente (colapsa chamadas simultâneas do StrictMode).
- **Cache leve (TTL curto)**
  - Campo: `cacheSectionKeywords: Record<number, { data: Keyword[]; ts: number } | undefined>`.
  - TTL padrão: 600 ms. Evita duplicidade de chamadas muito próximas.
- **Fotos da seção (referência de padrão)**
  - `listPhotos` usa o mesmo padrão: Promise pendente + cache com TTL curto.

## Fluxo esperado (exemplos de logs)

- **Ao entrar na aba**
  - `[INFO] [SECTION_KEYWORDS] Keywords:fetch:sectionLinked:start {sectionId: 1}`
  - `[INFO] [SECTION_KEYWORDS] Keywords:fetch:catalog:start`
  - `[INFO] [SECTION_KEYWORDS] Keywords:fetch:catalog:done {count: N}`
  - `[INFO] [SECTION_KEYWORDS] Keywords:fetch:sectionLinked:done {sectionId: 1, ids: [...]} `

- **Ao voltar para a aba**
  - `[INFO] [SECTION_KEYWORDS] Keywords:fetch:sectionLinked:start {sectionId: 1}`
  - `[INFO] [SECTION_KEYWORDS] Keywords:fetch:catalog:hydrate:cache {count: N}` (se aplicável)
  - `[INFO] [SECTION_KEYWORDS] Keywords:fetch:sectionLinked:done {sectionId: 1, ids: [...]}`

- Observação: em DEV StrictMode o log `start` pode aparecer 2x, mas o serviço garante 1 request real.

## Boas práticas e checklists

- **Ao criar telas semelhantes:**
  - Use tag de log dedicada e registre-a em `ALWAYS_TAGS`.
  - Prefira `visibilitychange` a `focus` para refetch passivo.
  - Use guarda de in-flight e cooldown em funções de refetch.
  - Em efeitos assíncronos, use `mounted` para evitar setState após unmount.
  - No serviço, deduplique chamadas com Promise pendente e considere TTL curto.
  - Evite sincronizar estado com props após montagem; derive inicial e confie no GET dedicado.

- **Parâmetros recomendados**
  - Cooldown de refetch: ~400 ms.
  - TTL de cache de keywords da seção: ~600 ms.
  - TTL de cache de fotos: ~1500 ms (referência existente).

## Troubleshooting

- **UI não reflete o backend ao voltar**
  - Verifique se o efeito de vínculos está sem guards de bloqueio (apenas `mounted`).
  - Confirme logs `fetch:sectionLinked:done` e Network com 1 request por retorno.
- **Requests duplicados em DEV**
  - Confirme deduplicação no serviço (`pendingSectionKeywords`) e TTL curto.
- **Logs sumiram**
  - Confirme `ALWAYS_TAGS` inclui `[SECTION_KEYWORDS]` em `utils/logger.ts`.

## Arquivos citados
- `src/components/sections/SectionKeywords.tsx`
- `src/services/SectionsService.ts`
- `src/services/KeywordService.ts`
- `src/utils/logger.ts`
