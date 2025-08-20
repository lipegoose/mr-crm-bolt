const isDevelopment = process.env.NODE_ENV === 'development';
// Mudar esta linha em logger.ts:
// De:
// const isDebugEnabled = isDevelopment && (localStorage.getItem('debug') === 'true');
// Para:
const isDebugEnabled = false; // Força desativação de logs debug # NUNCA APAGAR ESTA LINHA.

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
    if (isDebugEnabled) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: unknown[]) => {
    // Filtrar logs para mostrar apenas os relacionados a condomínio ou dados privativos
    if (isDevelopment && (message.includes('[CONDOMINIO]') || message.includes('[DADOS_PRIVATIVOS]') || message.includes('[USUARIO_SERVICE]'))) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: unknown[]) => {
    // Filtrar logs de aviso para mostrar apenas os relacionados a condomínio ou dados privativos
    if (message.includes('[CONDOMINIO]') || message.includes('[DADOS_PRIVATIVOS]') || message.includes('[USUARIO_SERVICE]')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: unknown[]) => {
    // Filtrar logs de erro para mostrar apenas os relacionados a condomínio ou dados privativos
    if (message.includes('[CONDOMINIO]') || message.includes('[DADOS_PRIVATIVOS]') || message.includes('[USUARIO_SERVICE]')) {
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
