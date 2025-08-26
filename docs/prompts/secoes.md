# Prompt: Implementar CMS genérico de Seções (Backend Lumen + Frontend Bolt + Site Público)

## Contexto
- Projeto: Mr.CRM (Backend Lumen 10 + Painel React/TS “Mr.CRM Bolt”).
- Site público: bhelite.com.br (React/TS). Hoje a seção “Regiões” é mock; vamos substituí-la por uma seção gerida via CMS chamada “Destaques”.
- Padrões obrigatórios do projeto:
  - Anti-duplicação de chamadas (StrictMode): usar mapa de Promises pendentes por chave em todos GETs e limpar referência ao finalizar.
  - Cache volátil somente quando seguro (ex.: opções estáveis). Não usar cache persistente em componentes.
  - PUT parcial com payload mínimo por campo alterado.
  - Rotas sem “/novo”: criação via ação na lista que faz POST mínimo, obtém id e navega para “/recurso/:id” para edição com autosave por campo.
  - Páginas de lista: efeito de montagem chama apenas load(1); debounce de busca não dispara quando termo vazio.
  - Páginas de detalhe: loadedOnceRef para evitar dupla execução no StrictMode.
  - Imagens: mesmo padrão de foto “principal” usado em `src/components/imoveis/ImagensImovel.tsx`.

## Objetivo
Criar um CMS genérico de Seções, com:
- Seções configuráveis por `slug` (ex.: destaques, sobre, servicos, blog).
- Campos da Seção: `titulo`, `subtitulo`, `descricao`, `url_link` (pode ser âncora da página), `texto_url`, `botao:boolean` (se true, `texto_url` vira CTA; se false, o card/link pode ser o container ou apenas um link sem CTA), `url_amigavel`, `show_on_home:boolean`, `template:enum(destaques|sobre|servicos|blog)`, `ordem:int`, `ativo:boolean`, `published_at:datetime|null`.
- Cada Seção possui N itens (Section Items) com: `titulo`, `subtitulo`, `descricao`, `url_link`, `texto_url`, `botao:boolean`, `url_amigavel`, `ordem`, `ativo` e fotos (upload múltiplo), com exatamente uma “principal”, ordenação e remoção.
- Fotos tanto da Seção quanto de cada Item: `section_photos` e `section_item_photos`.
- Suporte a Palavras-Chave (keywords) para relacionar itens (e opcionalmente seções) e permitir filtros por palavra-chave.

## Modelo de Dados (proposta)
Tabelas:
 - sections
  - id (PK)
  - slug (string, 100, unique) — identifica a seção (ex.: "destaques", "sobre").
  - titulo (string, 255)
  - subtitulo (string, 255, nullable)
  - descricao (text, nullable)
  - url_link (string, 500, nullable) — pode ser uma âncora (ex.: "#sobre").
  - texto_url (string, 255, nullable)
  - botao (boolean, default false) — define se `texto_url` renderiza como CTA.
  - url_amigavel (string, 255, unique nullable) — slug editável amigável.
  - template (enum: destaques, sobre, servicos, blog)
  - show_on_home (boolean, default false)
  - ordem (int, default 0)
  - ativo (boolean, default true)
  - published_at (datetime, nullable)
  - timestamps
- section_items
  - id (PK)
  - section_id (FK -> sections)
  - titulo (string, 255, required)
  - subtitulo (string, 255, nullable)
  - descricao (text, nullable)
  - url_link (string, 500, nullable)
  - texto_url (string, 255, nullable)
  - botao (boolean, default false)
  - url_amigavel (string, 255, unique nullable)
  - ordem (int, default 0)
  - ativo (boolean, default true)
  - timestamps
- section_photos
  - id (PK)
  - section_id (FK -> sections)
  - path (string, 500)
  - principal (boolean, default false)
  - ordem (int, default 0)
  - alt_text (string, 255, nullable)
  - timestamps
- section_item_photos
  - id (PK)
  - section_item_id (FK -> section_items)
  - path (string, 500)
  - principal (boolean, default false)
  - ordem (int, default 0)
  - alt_text (string, 255, nullable)
  - timestamps
- keywords
  - id (PK)
  - nome (string, 100, unique)
  - slug (string, 120, unique)
  - descricao (string, 255, nullable)
  - timestamps
- keyword_section_item (pivot M:N)
  - id (PK)
  - keyword_id (FK -> keywords)
  - section_item_id (FK -> section_items)
  - created_at
- keyword_section (pivot M:N, opcional)
  - id (PK)
  - keyword_id (FK -> keywords)
  - section_id (FK -> sections)
  - created_at

Índices:
- sections: (slug), (show_on_home, ordem), (template, ordem), (ativo, ordem)
- section_items: (section_id, ordem), (ativo, ordem)
- section_photos: (section_id, ordem)
- section_item_photos: (section_item_id, ordem)
- keyword_section_item: (keyword_id, section_item_id), (section_item_id)
- keyword_section: (keyword_id, section_id), (section_id)

Seed inicial (opcional):
- Criar registros base em `sections` para slugs: destaques, sobre, servicos, blog com `template` correspondente.

Regras:
- Garantir via aplicação que exista no máximo UMA foto principal por item e por seção.
- Validações “sometimes|required” em updates parciais.

## Backend (Lumen) – Tarefas
1) Migrations e Models
- Criar migrations conforme modelo (com comentários nas tabelas e nos principais campos).
- Models: Section, SectionItem, SectionPhoto, SectionItemPhoto, Keyword, pivots.

2) Storage e Upload
- Usar o MESMO padrão de salvamento de imagens já utilizado em Imóveis (ver `routes/imoveis.php` e `ImovelController@uploadImagem`):
  - Lumen sem Flysystem: mover o arquivo para diretório público com `app()->basePath('public/...')` (ex.: `public/sections/{sectionId}/fotos` ou `public/sections/{sectionId}/items/{itemId}/fotos`).
  - Nome do arquivo por UUID preservando extensão.
  - Armazenar caminho relativo público (ex.: `sections/{sectionId}/fotos/<uuid>.jpg`) para servir direto pelo servidor web.
  - Definir `ordem` como última + 1.
  - Se primeira foto, marcar automaticamente como `principal=true`; ao marcar `principal=true` em outra, desmarcar as demais da mesma entidade.
  - Validar tipos: jpg, jpeg, png, webp. Tamanho: até 5MB cada. Limite de 12 fotos por entidade (parametrizável).
  - Retornar URL pública absoluta na resposta (derivada do caminho relativo).

3) Validação (Lumen)
- Usar `Illuminate\Support\Facades\Validator` nos controladores.
- Regras (store/update parcial com `sometimes`):
  - Section: `titulo:max:255`, `subtitulo:max:255|nullable`, `descricao:nullable`, `url_link:nullable|string|max:500|AnchorOrUrl`, `texto_url:max:255|nullable`, `botao:boolean`, `url_amigavel:max:255|nullable`, `template:in:destaques,sobre,servicos,blog`, `show_on_home:boolean`, `ordem:integer`, `ativo:boolean`, `published_at:date|nullable`.
  - SectionItem: `titulo:required|max:255`, `subtitulo:max:255|nullable`, `descricao:nullable`, `url_link:url|nullable`, `texto_url:max:255|nullable`, `botao:boolean`, `url_amigavel:max:255|nullable`, `ordem:integer`, `ativo:boolean`.
  - Upload fotos: `files.*:required|image|mimes:jpg,jpeg,png,webp|max:5120`.
  - Keywords: `nome:required|max:100`, `slug:max:120`.
  - 422 em falhas com payload padronizado.

4) Resources (Transformers)
- Usar `JsonResource` ou arrays.
- Estruturas:
  - SectionItemPhoto: { id, url, principal, ordem, alt_text }
  - SectionPhoto: { id, url, principal, ordem, alt_text }
  - SectionItem: { id, titulo, subtitulo, descricao, url_link, texto_url, botao, url_amigavel, ordem, ativo, fotos: [SectionItemPhoto], keywords: [ { id, nome, slug } ] }
  - Section: { id, slug, titulo, subtitulo, descricao, url_link, texto_url, botao, url_amigavel, template, show_on_home, ordem, ativo, published_at, fotos: [SectionPhoto], items: [SectionItem], keywords?: [ { id, nome, slug } ] }

5) Rotas e Controladores (prefixo /api/cms/sections, protegido por auth JWT)
- Em `routes/web.php` (Lumen) usando `$router` e grupos:
  ```php
  $router->group(['prefix' => 'api/cms/sections', 'middleware' => ['auth']], function () use ($router) {
      // Seções
      $router->get('/', 'SectionController@index'); // filtros: q, ativo, show_on_home, slug, template
      $router->post('/', 'SectionController@store');
      $router->get('{sectionId}', 'SectionController@show');
      $router->put('{sectionId}', 'SectionController@update');
      $router->delete('{sectionId}', 'SectionController@destroy');

      // Fotos da Seção
      $router->get('{sectionId}/photos', 'SectionPhotoController@index');
      $router->post('{sectionId}/photos', 'SectionPhotoController@upload');
      $router->put('{sectionId}/photos/{photoId}', 'SectionPhotoController@update');
      $router->delete('{sectionId}/photos/{photoId}', 'SectionPhotoController@delete');

      // Itens da Seção
      $router->get('{sectionId}/items', 'SectionItemController@index');
      $router->post('{sectionId}/items', 'SectionItemController@store');
      $router->get('{sectionId}/items/{itemId}', 'SectionItemController@show');
      $router->put('{sectionId}/items/{itemId}', 'SectionItemController@update');
      $router->delete('{sectionId}/items/{itemId}', 'SectionItemController@destroy');

      // Fotos do Item
      $router->get('{sectionId}/items/{itemId}/photos', 'SectionItemPhotoController@index');
      $router->post('{sectionId}/items/{itemId}/photos', 'SectionItemPhotoController@upload');
      $router->put('{sectionId}/items/{itemId}/photos/{photoId}', 'SectionItemPhotoController@update');
      $router->delete('{sectionId}/items/{itemId}/photos/{photoId}', 'SectionItemPhotoController@delete');

      // Keywords (CRUD simples)
      $router->get('keywords', 'KeywordController@index');
      $router->post('keywords', 'KeywordController@store');
      $router->put('keywords/{id}', 'KeywordController@update');
      $router->delete('keywords/{id}', 'KeywordController@destroy');

      // Vincular keywords
      $router->post('{sectionId}/items/{itemId}/keywords', 'SectionItemKeywordController@attach'); // { keyword_ids: number[] }
      $router->delete('{sectionId}/items/{itemId}/keywords/{keywordId}', 'SectionItemKeywordController@detach');
  });
  ```
  Comentários detalhados:
  - Sections: CRUD completo; filtros em index.
  - Section photos: upload múltiplo; `principal=true` desmarca as demais.
  - Items: CRUD completo por seção.
  - Item photos: upload múltiplo; `principal=true` desmarca as demais.
  - Keywords: CRUD e vinculação M:N com items (e opcionalmente sections).
  - Middleware `auth` com JWT (`tymon/jwt-auth`) configurado no `bootstrap/app.php`.

6) Endpoint público (sem auth) consumido pelo site
- GET /api/public/sections
  - Filtros: `slug` (recomendado), `home=1` (somente seções com `show_on_home=true`), `template`, `keyword`.
  - Retorna somente seções com `published_at != null` e `ativo=true` e seus items `ativo=true`, ordenados por `ordem`.
  - Estrutura:
    {
      "sections": [
        {
          "slug": string,
          "titulo": string,
          "subtitulo": string|null,
          "descricao": string|null,
          "url_link": string|null,
          "texto_url": string|null,
          "botao": boolean,
          "url_amigavel": string|null,
          "template": "destaques|sobre|servicos|blog",
          "fotos": [{ id, url, principal, alt_text }],
          "items": [
            { id, titulo, subtitulo, descricao, url_link, texto_url, botao, url_amigavel, foto_principal: { url, alt_text } | null, galeria: [{ id, url, alt_text }], keywords: [{ id, nome, slug }] }
          ]
        }
      ]
    }
  - Opcional: ETag/Cache-Control e TTL curto.

Exemplos de API (resumo)
- POST seção:
  POST /api/cms/sections
  { "slug": "destaques", "titulo": "Destaques", "template": "destaques", "show_on_home": true }

- PUT seção (parcial):
  PUT /api/cms/sections/10
  { "subtitulo": "Nossos destaques", "url_link": "#destaques", "texto_url": "Ver mais", "botao": true }

- POST item:
  POST /api/cms/sections/10/items
  { "titulo": "Pampulha", "ordem": 1, "ativo": true }

- Upload fotos do item:
  POST /api/cms/sections/10/items/123/photos
  multipart/form-data: files[] (múltiplas imagens)

- Marcar foto principal do item:
  PUT /api/cms/sections/10/items/123/photos/987
  { "principal": true }

- Vincular keywords ao item:
  POST /api/cms/sections/10/items/123/keywords
  { "keyword_ids": [1, 2, 3] }

## Frontend CMS (Mr.CRM Bolt – React/TS) – Tarefas
1) Services
- `SectionsService.ts`: list/create/get/update/delete sections; photos CRUD
- `SectionItemsService.ts`: list/create/get/update/delete items; photos CRUD
- `KeywordsService.ts`: CRUD de keywords; attach/detach em items
- Implementar pending Promises para GETs e autosave por campo (PUT parcial).

2) Rotas no painel
- Lista de Seções: /cms/sections
  - Tabela/cards com busca debounce, ordenação, filtros (ativo, template, show_on_home), toggle "Mostrar na Home" (PUT parcial `{ show_on_home }`).
  - Botão “Adicionar” cria seção mínima e navega para /cms/sections/:id.
- Detalhe da Seção: /cms/sections/:id
  - Form autosave, campos extras (subtitulo, url_link, texto_url, botao, url_amigavel, template, ordem, published_at, ativo).
  - Fotos da seção: upload múltiplo, principal única, ordenar, remover.
  - Itens: grid/tabela com CRUD, drag-and-drop de ordem.
- Detalhe do Item: /cms/sections/:id/items/:itemId
  - Autosave, campos extras (subtitulo, url_link, texto_url, botao, url_amigavel, ordem, ativo).
  - Fotos do item: upload múltiplo, principal única, ordenar, remover.
  - Keywords: autocomplete multi-select (CRUD em modal/opções).

3) UX e consistência
- Seguir toasts, dialogs, logger e padrões já usados no projeto.
- Não manter cache persistente em componentes; refazer GET na montagem quando necessário.
- Tratar loading/erro de forma amigável.

## Site Público (bhelite-site) – Tarefas
1) Consumir endpoint público
- Criar service `services/sections.ts` com GET `/api/public/sections?slug=<slug>` e suporte a `home=1`.
  - Usar controle de pending Promises + cache volátil curto (ex.: 60s).

2) Componentes
- Criar um `Sections` genérico que recebe `slug` e seleciona um dos 4 templates de renderização:
  - `TemplateDestaques` (baseado em RegionsSection.tsx)
  - `TemplateAbout` (baseado em AboutSection.tsx)
  - `TemplateServices` (baseado em ServicesSection.tsx)
  - `TemplateBlog` (baseado em BlogSection.tsx)
- Renderizar título/subtítulo/descrição, CTA conforme `botao` e `texto_url`.
- Grid/list conforme template; foto principal com fallback; alt_text e lazy-loading.

3) Resiliência
- Estado vazio amigável quando API indisponível.

## Validações e Regras
- Exatamente uma foto principal por seção e por item.
- Limites de tamanho/quantidade configuráveis (ex.: 12 fotos/entidade).
- Campos obrigatórios:
  - Section: `titulo`, `slug`, `template`.
  - SectionItem: `titulo`.
- Segurança: /api/cms/* protegido por auth; /api/public/sections público.

## Checklist de Testes
- CRUD completo de sections e section_items.
- Upload múltiplo, marcar principal, reorder, remover (section e item).
- PUT parcial campo a campo com autosave.
- Filtros por slug, template, show_on_home e keyword.
- Anti-duplicação observado em dev com StrictMode.
- Site público renderizando dados reais com fallbacks.
- SEO/alt nas imagens, lazy-loading e tamanhos adequados.

## Entregáveis
- Migrations (com comentários), Models, Resources, Controllers e Rotas.
- Services `SectionsService`, `SectionItemsService`, `KeywordsService` no Bolt e telas/rotas do CMS.
- Componente `Sections` com 4 templates e integração com service público.
- Doc curta em `docs/cms-sections.md` com endpoints/formatos.

## Observações finais
- Não rodar build a cada alteração; hot reload em dev.
- Rodar build apenas quando solicitado (validação/deploy).
- Em qualquer dúvida, parar e confirmar antes de seguir.

#