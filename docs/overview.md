# Visão Geral

- Nome: Mr.CRM (mr-crm-bolt)
- Stack: Vite + React 18 + TypeScript + Tailwind + React Router DOM 7 + Axios
- Objetivo: Cadastro e gestão de imóveis com fluxo em etapas (wizard), salvamento incremental por etapa e por campo, integração a APIs REST da camada backend.

Principais features implementadas:
- Wizard de cadastro de imóvel com etapas: informacoes, comodos, medidas, preco, caracteristicas-imovel, caracteristicas-condominio (condicional), localizacao, proximidades, descricao, complementos, dados-privativos, imagens, publicacao. Arquivo: `src/components/pages/ImovelCadastro.tsx`.
- Auto-save por campo (debounce) em `DadosPrivativos` com mapeamento fiel aos campos da API. Arquivo: `src/components/imoveis/DadosPrivativos.tsx`.
- Serviços centralizados para cada recurso de backend com controle anti-duplicação de requisições (quando necessário). Arquivo principal: `src/services/`.
- Contexto de autenticação com persistência e refresh: `src/contexts/AuthContext.tsx`.
- Hooks utilitários para formular e callbacks de etapas: `src/hooks/useFormWithChanges.ts`, `src/hooks/useStepCallbacks.ts`.

Diretrizes operacionais:
- Hot reload sempre ativo em dev. Não iniciar servidor manualmente. Não rodar `build:static` após cada mudança; só quando necessário para build/deploy.
