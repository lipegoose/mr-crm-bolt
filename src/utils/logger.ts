// Mudar esta linha em logger.ts:
// De:
// const isDebugEnabled = isDevelopment && (localStorage.getItem('debug') === 'true');
// Para:
const isDebugEnabled = false; // Força desativação de logs debug # NUNCA APAGAR ESTA LINHA.

const isLocalDebug = () => {
  try { return localStorage.getItem('debug') === 'true'; } catch { return false; }
};

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
    // Exibe debug somente quando explicitamente habilitado por localStorage
    const show = isDebugEnabled || isLocalDebug();
    if (show) console.debug(`[DEBUG] ${message}`, ...args);
  },
  
  info: (message: string, ...args: unknown[]) => {
    // Informação só quando debug local estiver ativo
    if (isLocalDebug()) console.info(`[INFO] ${message}`, ...args);
  },
  
  warn: (message: string, ...args: unknown[]) => {
    // Sempre exibir warnings
    console.warn(`[WARN] ${message}`, ...args);
  },
  
  error: (message: string, ...args: unknown[]) => {
    // Sempre exibir erros
    console.error(`[ERROR] ${message}`, ...args);
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
