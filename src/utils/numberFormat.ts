/**
 * Converte número ou string numérica para formato de exibição com vírgula
 */
export const formatNumberToDisplay = (value: number | string | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;

  if (isNaN(numValue)) {
    return '';
  }

  return Number(numValue).toFixed(decimals).replace('.', ',');
};

/**
 * Converte string de entrada (com vírgula) para número
 */
export const parseInputToNumber = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const normalizedValue = value.replace(/\./g, '').replace(',', '.');
  const numValue = parseFloat(normalizedValue);
  return isNaN(numValue) ? null : numValue;
};

/**
 * Sanitiza o input para aceitar apenas números e uma vírgula
 */
export const sanitizeNumericInput = (value: string, allowNegative: boolean = false): string => {
  if (!value) return '';
  // Remove caracteres inválidos, mantendo dígitos, vírgula e opcionalmente um negativo no início
  let sanitized = value.replace(/[^0-9,\-]/g, '');
  if (!allowNegative) {
    sanitized = sanitized.replace(/\-/g, '');
  } else {
    // Manter apenas um '-' no início
    sanitized = sanitized.replace(/(?!^)-/g, '');
  }
  // Manter apenas a primeira vírgula
  const firstComma = sanitized.indexOf(',');
  if (firstComma !== -1) {
    const sign = allowNegative && sanitized.startsWith('-') ? '-' : '';
    const body = sanitized.replace(/^-/, '');
    const intPart = body.slice(0, firstComma).replace(/,/g, '');
    let decPart = body.slice(firstComma + 1).replace(/,/g, '');
    decPart = decPart.slice(0, 2);
    sanitized = sign + (decPart.length > 0 ? `${intPart},${decPart}` : intPart + (value.endsWith(',') ? ',' : ''));
  } else {
    sanitized = sanitized.replace(/,/g, '');
  }
  return sanitized;
};

/**
 * Bloqueia ponto e permite inserir vírgula facilmente
 */
export const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
  if (e.key === '.') {
    e.preventDefault();
    const input = e.target as HTMLInputElement;
    const value = input.value;
    if (!value.includes(',')) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      input.value = value.substring(0, start) + ',' + value.substring(end);
      setTimeout(() => {
        input.selectionStart = input.selectionEnd = start + 1;
      }, 0);
    }
  }
};


