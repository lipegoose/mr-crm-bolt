# Serviços (src/services/)

Base: `api.ts` (Axios configurado com baseURL via `VITE_API_URL`).

- ImovelService (`src/services/ImovelService.ts`)
  - CRUD e etapas: `getEtapa*`, `updateEtapa*`, `finalizarCadastro`, `getCompletude`.
  - Anti-duplicação: `pendingEtapaProximidadesRequests[id]` para `getEtapaProximidades` + logs.
  - Cache volátil: `caracteristicasCache`, `proximidadesCache`, `etapaProximidadesCache` (atualizado a cada fetch de etapa).
  - Uploads: `uploadImagem`, reordenação, principal, delete.

- UsuarioService (`src/services/UsuarioService.ts`)
  - `getUsuariosSelect`: retorna opções para Select. Sem cache persistente; reuso de promise pendente.
  - Normalização flexível do retorno (array direto ou `{ success, data }`).

- LocalidadesService (não exibido aqui, mas com controle de chamadas em andamento para StrictMode).

- AuthService / ClienteService
  - Autenticação, usuários e clientes conforme necessidades do app (detalhar contratos em `api-contracts.md` quando necessário).

Respostas tipadas: `ApiResponse<T>`, interfaces ricas para entidades (Imovel, Endereco, Valores, etc.).

## Resumo de métodos por serviço (padrões)

- ImovelService
  - Etapas do cadastro: `getEtapa<Nome>` e `updateEtapa<Nome>` para cada etapa do wizard (ex.: Informacoes, Comodos, Medidas, Preco, CaracteristicasImovel, CaracteristicasCondominio, Localizacao, Proximidades, Descricao, Complementos, DadosPrivativos, Imagens, Publicacao).
  - Proximidades: método de GET com controle de requisições pendentes por `imovelId` e atualização do cache volátil associado à etapa.
  - Imagens: upload, marcar principal, reordenar e deletar (operações dedicadas).
  - Utilidades: `getCompletude` do cadastro e `finalizarCadastro` quando aplicável.

- UsuarioService
  - Select de usuários/corretores: método para obter opções consumidas por componentes de formulário, com reuso de Promise em chamadas concorrentes e normalização do retorno.

- LocalidadesService
  - Recursos de localidades (ex.: estados/municípios/bairros) com mitigação de chamadas duplicadas em StrictMode por meio de reuso de Promise por chave de recurso.
