// Mudar esta linha em logger.ts:
// De:
// const isDebugEnabled = isDevelopment && (localStorage.getItem('debug') === 'true');
// Para:
const isDebugEnabled = false; // Força desativação de logs debug # NUNCA APAGAR ESTA LINHA.

const isLocalDebug = () => {
  try { return localStorage.getItem('debug') === 'true'; } catch { return false; }
};

// Tags que devem SEMPRE aparecer no console, independente de isDebugEnabled/local debug
const ALWAYS_TAGS = ['[SECTION_KEYWORDS]'];
const hasAnyTag = (message: string, tags: string[]) => tags.some(t => message?.includes(t));

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
    // Exibe debug se local debug habilitado ou se a mensagem contiver alguma das tags ALWAYS
    const show = isDebugEnabled || isLocalDebug() || hasAnyTag(message, ALWAYS_TAGS);
    if (show) console.debug(`[DEBUG] ${message}`, ...args);
  },
  
  info: (message: string, ...args: unknown[]) => {
    // Mostrar info quando local debug ativo ou quando mensagem tiver tag ALWAYS
    if (isLocalDebug() || hasAnyTag(message, ALWAYS_TAGS)) console.info(`[INFO] ${message}`, ...args);
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
