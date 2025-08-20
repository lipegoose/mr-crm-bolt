# Arquitetura

- Build tool: Vite (`vite.config.ts`), alias `@ -> ./src`, env via `import.meta.env`.
- UI: React + Tailwind. Componentes organizados em `src/components/` com subpastas `imoveis/`, `layout/`, `pages/`, `ui/`.
- Roteamento: React Router DOM 7 (tipos embarcados). `ImovelCadastro` usa `useParams`, `useNavigate`.
- Serviços: `src/services/` (Axios em `api.ts`) + camadas por domínio (`ImovelService`, `LocalidadesService`, `UsuarioService`, `AuthService`, `ClienteService`).
- Estado: local por componente + hooks customizados. Contexto global de auth em `AuthContext.tsx`.
- Logs: util `src/utils/logger` (utilizado em serviços e páginas).

Padrões:
- Anti-duplicação de chamadas: promises pendentes reusadas por chave (ex.: `ImovelService.getEtapaProximidades`, `UsuarioService.getUsuariosSelect`).
- Cache volátil apenas quando benéfico e seguro (ex.: opções estáticas). Evitar cache persistente em componentes.
- Mapeamento de payload por etapa, enviando apenas campos alterados quando aplicável.
