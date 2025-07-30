Aqui estão as especificações técnicas do projeto "Mr.CRM - Frontend":

🛠️ Stack Tecnológica Principal

Frontend Framework
 * React 18.3.1 - Biblioteca JavaScript para construção de interfaces
 * TypeScript 5.5.3 - Superset do JavaScript com tipagem estática
 * React Router DOM 7.7.0 - Roteamento para aplicações React

Build Tool & Dev Server
 * Vite 5.4.2 - Build tool moderno e rápido
 * @vitejs/plugin-react - Plugin para suporte ao React

Styling & UI
 * Tailwind CSS 3.4.1 - Framework CSS utilitário
 * PostCSS 8.4.35 - Processador CSS
 * Autoprefixer 10.4.18 - Adiciona prefixos CSS automaticamente
 * Lucide React 0.344.0 - Biblioteca de ícones

Development Tools
 * ESLint 9.9.1 - Linter para JavaScript/TypeScript
 * TypeScript ESLint 8.3.0 - Linter específico para TypeScript
 * ESLint React Hooks - Regras para React Hooks
 * ESLint React Refresh - Suporte ao Fast Refresh

⚙️ Configurações Técnicas

TypeScript
 * Target: ES2020
 * Module: ESNext
 * JSX: React JSX
 * Strict Mode: Ativado
 * Module Resolution: Bundler

Vite Configuration
 * Output Directory: `dist`
 * Assets Directory: `assets`
 * Alias: `@` aponta para `./src`
 * Optimization: Exclui `lucide-react` das dependências otimizadas

Estrutura do Projeto
O projeto segue uma arquitetura modular com:
 * Componentes reutilizáveis em `./src/components/`
 * Páginas em `./src/components/pages/`
 * Componentes de UI em `./src/components/ui/`
 * Layout em `./src/components/layout/`

🚀 Scripts Disponíveis
 * npm run dev - Inicia servidor de desenvolvimento
 * npm run build - Gera build de produção
 * npm run lint - Executa linting
 * npm run preview - Visualiza build de produção

Este é um projeto moderno de CRM (Customer Relationship Management) construído com tecnologias atuais e boas práticas de desenvolvimento frontend.