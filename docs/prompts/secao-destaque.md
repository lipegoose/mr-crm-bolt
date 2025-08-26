# Prompt: Implementar CMS da seção “Destaques” (Backend Laravel + Frontend Bolt + Site Público)

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
Criar o CMS da seção “Destaques”, com:
- Título da Seção.
- Descrição da Seção.
- N destaques (itens), cada um com: Título, Descrição e Fotos (upload múltiplo), podendo marcar exatamente uma foto como “principal”, ordenar e remover.

## Modelo de Dados (proposta)
Tabelas:
- destaque_sections
  - id (PK)
  - titulo (string, 255)
  - descricao (text, nullable)
  - slug (string, 100, unique) — valor padrão “destaques”
  - published_at (datetime, nullable)
  - timestamps
- destaques
  - id (PK)
  - section_id (FK -> destaque_sections)
  - titulo (string, 255, required)
  - descricao (text, nullable)
  - ordem (int, default 0)
  - ativo (boolean, default true)
  - timestamps
- destaque_photos
  - id (PK)
  - destaque_id (FK -> destaques)
  - path (string, 500)
  - principal (boolean, default false)
  - ordem (int, default 0)
  - alt_text (string, 255, nullable)
  - timestamps

Índices:
- (section_id, ordem)
- (destaque_id, ordem)

Seed inicial:
- Criar registro em destaque_sections com slug “destaques” e valores vazios.

Regras:
- Garantir via aplicação que exista no máximo UMA foto principal por destaque.
- Validações “sometimes|required” em updates parciais.

## Backend (Lumen) – Tarefas
1) Migrations e Models
- Criar migrations conforme modelo.
- Models: DestaqueSection, Destaque, DestaquePhoto com relações hasMany/belongsTo.

2) Storage e Upload
- Usar Storage do Laravel (public ou S3 via .env).
- Validar tipos: jpg, jpeg, png, webp. Tamanho: até 5MB cada. Limite de 12 fotos por destaque (parametrizável).
- Retornar URL pública absoluta.

3) Validação (Lumen)
- Usar `Illuminate\Support\Facades\Validator` dentro dos controladores (ou um trait de validação) para validar payloads.
- Regras:
  - Section update: `titulo:max:255`, `descricao:nullable`, `published_at:date|nullable`.
  - Destaque store/update: `titulo:required|max:255`, `descricao:nullable`, `ordem:integer`, `ativo:boolean`.
  - Upload fotos: `files.*:required|image|mimes:jpg,jpeg,png,webp|max:5120`.
  - Responder 422 com erros padronizados ao falhar.

4) Resources (Transformers)
- Usar `JsonResource` quando disponível no Lumen ou transformers manuais (arrays) para respostas consistentes.
- Estruturas:
  - DestaquePhoto: { id, url, principal, ordem, alt_text }
  - Destaque: { id, titulo, descricao, ordem, ativo, fotos: [DestaquePhoto] }
  - DestaqueSection: { id, slug, titulo, descricao, published_at, destaques: [Destaque] }

5) Rotas e Controladores (prefixo /api/cms/destaques, protegido por auth JWT)
- Em `routes/web.php` (Lumen) usando `$router` e grupos:
  ```php
  $router->group(['prefix' => 'api/cms/destaques', 'middleware' => ['auth']], function () use ($router) {
      $router->get('section', 'DestaqueSectionController@show');
      $router->put('section', 'DestaqueSectionController@update');

      $router->get('/', 'DestaqueController@index');
      $router->post('/', 'DestaqueController@store');
      $router->get('{id}', 'DestaqueController@show');
      $router->put('{id}', 'DestaqueController@update');
      $router->delete('{id}', 'DestaqueController@destroy');

      $router->get('{id}/fotos', 'DestaqueFotoController@index');
      $router->post('{id}/fotos', 'DestaqueFotoController@upload');
      $router->put('{id}/fotos/{fotoId}', 'DestaqueFotoController@update');
      $router->delete('{id}/fotos/{fotoId}', 'DestaqueFotoController@delete');
  });
  ```
  Comentários detalhados dos endpoints acima:
  - Section
    - GET `/api/cms/destaques/section` — retorna a seção "destaques" e seus itens.
    - PUT `/api/cms/destaques/section` — update parcial de `titulo`/`descricao`/`published_at`.
  - Destaques (CRUD)
    - GET `/api/cms/destaques` — lista com filtros `q`, `ativo`; ordenação e paginação.
    - POST `/api/cms/destaques` — cria um item vinculado à seção "destaques"; retorna `id`.
    - GET `/api/cms/destaques/{id}` — obtém um destaque específico.
    - PUT `/api/cms/destaques/{id}` — update parcial do destaque.
    - DELETE `/api/cms/destaques/{id}` — remove o destaque.
  - Fotos
    - GET `/api/cms/destaques/{id}/fotos` — lista fotos do destaque.
    - POST `/api/cms/destaques/{id}/fotos` — upload multipart/form-data `files[]` (múltiplas imagens).
    - PUT `/api/cms/destaques/{id}/fotos/{fotoId}` — atualiza metadados: `{ principal?: boolean, ordem?: number, alt_text?: string }`. Se `principal=true`, desmarcar as demais.
    - DELETE `/api/cms/destaques/{id}/fotos/{fotoId}` — exclui a foto.
  - Middleware `auth` com JWT (`tymon/jwt-auth`) configurado no `bootstrap/app.php`.

6) Endpoint público (sem auth) consumido pelo site
- GET /api/public/destaques
  - Retorna somente seção publicada (published_at != null) e destaques ativo=true, ordenados.
  - Estrutura:
    {
      "section": { "titulo": string, "descricao": string|null },
      "itens": [
        {
          "id": number,
          "titulo": string,
          "descricao": string|null,
          "foto_principal": { "url": string, "alt_text": string|null } | null,
          "galeria": [{ id, url, alt_text }]
        }
      ]
    }
  - Opcional: ETag/Cache-Control e TTL curto.

Exemplos de API (resumo)
- PUT seção:
  PUT /api/cms/destaques/section
  { "titulo": "Destaques", "descricao": "Escolha qual região você deseja morar" }

- POST destaque:
  POST /api/cms/destaques
  { "titulo": "Pampulha", "descricao": "Bairros arborizados", "ordem": 1, "ativo": true }

- Upload fotos:
  POST /api/cms/destaques/123/fotos
  multipart/form-data: files[] (múltiplas imagens)

- Marcar principal:
  PUT /api/cms/destaques/123/fotos/987
  { "principal": true }

## Frontend CMS (Mr.CRM Bolt – React/TS) – Tarefas
1) Service `src/services/DestaquesService.ts`
- Baseado em `ImovelService.ts` no padrão do projeto.
- Implementar pending Promises para todos GETs; limpar ao finalizar.
- Métodos:
  - getSection(), updateSection(payload parcial)
  - listDestaques(params)
  - createDestaque(payload mínimo) -> id
  - getDestaque(id), updateDestaque(id, payload parcial), deleteDestaque(id)
  - listFotos(id), uploadFotos(id, files[]), setPrincipal(id, fotoId), updateFoto(id, { ordem, alt_text }), deleteFoto(id, fotoId)

2) Rotas no painel
- Lista: /cms/destaques
  - Cards/tabela, busca com debounce (não dispara vazio), ordenação, status ativo.
  - Botão “Adicionar” que cria e navega para /cms/destaques/:id.
- Detalhe: /cms/destaques/:id
  - Form com autosave por campo (debounce ~300ms, PUT parcial).
  - Gerenciar fotos:
    - Upload múltiplo drag-and-drop.
    - Listar com preview, remover.
    - Reorder drag-and-drop (PUT ordem).
    - Marcar UMA principal (PUT principal=true), desmarcando outras (efeito no backend).
- Config da Seção: /cms/destaques/section
  - Título e Descrição (autosave).
  - Publicar: botão que define published_at = now().

3) UX e consistência
- Seguir toasts, dialogs, logger e padrões já usados no projeto.
- Não manter cache persistente em componentes; refazer GET na montagem quando necessário.
- Tratar loading/erro de forma amigável.

## Site Público (bhelite-site) – Tarefas
1) Consumir endpoint público
- Criar service `services/destaques.ts` com GET /api/public/destaques.
- Usar controle de pending Promises + cache volátil curto (ex.: 60s).

2) Componente de seção
- Criar `DestaquesSection` substituindo `RegionsSection`.
- Renderizar título/descrição da seção.
- Grid de cards com foto principal; fallback se não houver.
- Acessibilidade: alt_text, headings corretos, lazy-loading.

3) Resiliência
- Estado vazio amigável quando API indisponível.

## Validações e Regras
- Exatamente uma foto principal por destaque (garantido ao marcar no backend).
- Limites de tamanho/quantidade configuráveis.
- Campos obrigatórios:
  - Seção: titulo.
  - Destaque: titulo.
- Segurança: /api/cms/* protegido por auth; /api/public/destaques público.

## Checklist de Testes
- CRUD completo de destaques.
- Upload múltiplo, marcar principal, reorder, remover.
- PUT parcial campo a campo com autosave.
- Anti-duplicação observado em dev com StrictMode.
- Site público renderizando dados reais com fallbacks.
- SEO/alt nas imagens, lazy-loading e tamanhos adequados.

## Entregáveis
- Migrations, Models, Requests, Resources, Controllers e Rotas.
- `DestaquesService.ts` no Bolt e telas/rotas do CMS.
- Substituição da seção no site público consumindo o endpoint público.
- Doc curta em `docs/cms-destaques.md` com endpoints/formatos.

## Observações finais
- Não rodar build a cada alteração; hot reload em dev.
- Rodar build apenas quando solicitado (validação/deploy).
- Em qualquer dúvida, parar e confirmar antes de seguir.

#