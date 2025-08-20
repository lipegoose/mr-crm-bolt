# Contratos de API (front -> back)

Base: `ImovelService` e correlatos.

- Dados Privativos (`/imoveis/:id/etapas/dados-privativos`)
  - GET: retorna `DadosPrivativos` com campos tipados (strings, booleanos, datas, ids opcionais).
  - PUT (parcial): payload mínimo conforme campo alterado.
    - `corretor_id`: number | null (conversão no front a partir de string)
    - `exclusividade`: boolean (front converte 'sim'/'nao')
    - Demais: strings/datas como fornecidas.

- Proximidades
  - Opções: `/imoveis/opcoes/proximidades` (cache volátil e controle de pending request).
  - Etapa do imóvel: `/imoveis/:id/etapas/proximidades` (sempre busca atualizado; promise pendente por id; logs).

- Características
  - `/imoveis/opcoes/caracteristicas/:escopo` com cache volátil por escopo e controle de pending.

- Autenticação
  - Fluxos em `AuthService` (login, register, getCurrentUser, logout). Contexto `AuthContext` lida com token e recuperação do usuário.

- Usuários (select)
  - `/usuarios/select`: retorna array de `{ value, label }` ou `{ success, data }` com `data` em array.

## Exemplos práticos

### 1) PUT parcial — Dados Privativos

Endpoint: `PUT /imoveis/:id/etapas/dados-privativos`

Observação: enviar apenas o campo alterado. Conversões no front:
- `exclusividade`: 'sim' | 'nao' -> boolean
- `corretorResponsavel` (UI string) -> `corretor_id` (number | null)

curl:
```bash
curl -X PUT \
  "$VITE_API_URL/imoveis/123/etapas/dados-privativos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "corretor_id": 45
  }'
```

Request (JSON mínimo):
```json
{
  "corretor_id": 45
}
```

Response (exemplo):
```json
{
  "success": true,
  "message": "Atualizado com sucesso",
  "data": {
    "corretor_id": 45,
    "exclusividade": true,
    "captacao_data": "2025-07-01",
    "observacoes_privativas": "..."
  }
}
```

### 2) GET — Etapa Proximidades (com anti-duplicação)

Endpoint: `GET /imoveis/:id/etapas/proximidades`

curl:
```bash
curl -X GET \
  "$VITE_API_URL/imoveis/123/etapas/proximidades" \
  -H "Authorization: Bearer <TOKEN>"
```

Response (exemplo):
```json
{
  "success": true,
  "data": {
    "proximidades": [
      { "id": 1, "nome": "Padaria", "distancia": 200 },
      { "id": 2, "nome": "Escola", "distancia": 500 }
    ]
  }
}
```

Notas de cliente:
- Serviço reusa Promise quando há múltiplas chamadas concorrentes para o mesmo `id` (mitigação de StrictMode).
- Componente não mantém cache persistente; sempre refaz GET ao entrar na etapa.

### 3) GET — Usuários Select

Endpoint: `GET /usuarios/select`

curl:
```bash
curl -X GET "$VITE_API_URL/usuarios/select" -H "Authorization: Bearer <TOKEN>"
```

Resposta suportada (forma 1 — array direto):
```json
[
  { "value": 45, "label": "Maria Souza" },
  { "value": 72, "label": "João Silva" }
]
```

Resposta suportada (forma 2 — envelope):
```json
{
  "success": true,
  "data": [
    { "value": 45, "label": "Maria Souza" },
    { "value": 72, "label": "João Silva" }
  ]
}
```

Respostas tipadas: `ApiResponse<T>`, interfaces ricas para entidades (Imovel, Endereco, Valores, etc.).
