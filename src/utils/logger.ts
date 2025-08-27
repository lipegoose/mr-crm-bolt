const isDevelopment = process.env.NODE_ENV === 'development';
// Mudar esta linha em logger.ts:
// De:
// const isDebugEnabled = isDevelopment && (localStorage.getItem('debug') === 'true');
// Para:
const isDebugEnabled = false; // Força desativação de logs debug # NUNCA APAGAR ESTA LINHA.

// Helper: verifica se devemos exibir o log dado o canal e a mensagem
const hasTag = (message: string, tag: string) => message?.includes(tag);
const isLocalDebug = () => {
  try { return localStorage.getItem('debug') === 'true'; } catch { return false; }
};
const shouldShowInfoWarn = (message: string) => (
  hasTag(message, '[CONDOMINIO]') ||
  hasTag(message, '[DADOS_PRIVATIVOS]') ||
  hasTag(message, '[USUARIO_SERVICE]') ||
  hasTag(message, '[SECTION_IMAGENS]')
);

interface Logger {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
  enableDebug: () => void;
  disableDebug: () => void;
}

const logger: Logger = {
  debug: (message: string, ...args: unknown[]) => {
    // Exibe debug se: explicitamente habilitado por localStorage, ou marcado com [SECTION_IMAGENS]
    const show = isDebugEnabled || isLocalDebug() || hasTag(message, '[SECTION_IMAGENS]');
    if (show) {
      console.debug(`[DEBUG] ${message}`, ...args);
      // Garantir visibilidade para quem filtra 'Verbose' no console
      if (hasTag(message, '[SECTION_IMAGENS]')) {
        console.info(`[INFO] ${message}`, ...args);
      }
    }
  },
  
  info: (message: string, ...args: unknown[]) => {
    // Em desenvolvimento, mostrar infos marcadas ou quando local debug ativo
    if ((isDevelopment && shouldShowInfoWarn(message)) || isLocalDebug()) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: unknown[]) => {
    if (shouldShowInfoWarn(message) || isLocalDebug()) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: unknown[]) => {
    // Sempre exibir erros em desenvolvimento; em produção, exibir os marcados
    if (isDevelopment || shouldShowInfoWarn(message) || isLocalDebug() || hasTag(message, '[SECTION_IMAGENS]')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
  
  enableDebug: () => {
    localStorage.setItem('debug', 'true');
    location.reload();
  },
  
  disableDebug: () => {
    localStorage.removeItem('debug');
    location.reload();
  }
};

export default logger;
