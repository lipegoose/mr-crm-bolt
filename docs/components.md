# Componentes

- Página `ImovelCadastro` (`src/components/pages/ImovelCadastro.tsx`)
  - Wizard de etapas com `StepNavigation`. Carregamento lazy por etapa via `loadStepData` e `ImovelService.getEtapa*`.
  - Controle de etapas concluídas (`stepsCompleted`), etapas carregadas (`loadedSteps`) e "dados já salvos" por etapa.
  - Integração com hooks `useStepCallbacks` para submit por etapa ao navegar.
  - Condicional de exibição de `caracteristicas-condominio` via `hasValidCondominio()`.

- `DadosPrivativos` (`src/components/imoveis/DadosPrivativos.tsx`)
  - Form local com `useState`.
  - Auto-save com debounce de 300ms por campo; envio de payload mínimo.
  - Conversões: `exclusividade` 'sim'/'nao' -> boolean; `corretorResponsavel` string -> number; datas e strings passadas diretamente.
  - Carrega corretores via `UsuarioService.getUsuariosSelect()`; adiciona opção "Selecione"; lida com diferentes formatos de resposta.

- Demais etapas (informações, cômodos, medidas, preço, características, localização, proximidades, descrição, complementos, imagens, publicação)
  - Cada uma integra `onUpdate`, recebe `initialData` e `imovelId` quando aplicável; utiliza `ImovelService.updateEtapa*`.
