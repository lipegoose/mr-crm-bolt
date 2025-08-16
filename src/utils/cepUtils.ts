/**
 * Utilitários para busca e validação de CEP
 */

/**
 * Interface para resposta da API ViaCEP
 */
export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // cidade
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

/**
 * Interface para dados de endereço formatados para o sistema
 */
export interface EnderecoFormatado {
  cep: string;
  uf: string;
  cidade: string;
  bairro: string;
  logradouro: string;
}

/**
 * Valida se o CEP possui formato válido (8 dígitos)
 * @param cep CEP a ser validado
 * @returns true se o CEP for válido, false caso contrário
 */
export const validarCEP = (cep: string): boolean => {
  // Remove caracteres não numéricos
  const cepNumerico = cep.replace(/\D/g, '');
  // Verifica se possui 8 dígitos
  return cepNumerico.length === 8;
};

/**
 * Formata o CEP para o padrão 00000-000
 * @param cep CEP a ser formatado
 * @returns CEP formatado
 */
export const formatarCEP = (cep: string): string => {
  // Remove caracteres não numéricos
  const cepNumerico = cep.replace(/\D/g, '');
  
  // Verifica se possui 8 dígitos
  if (cepNumerico.length !== 8) {
    return cepNumerico;
  }
  
  // Formata para 00000-000
  return `${cepNumerico.substring(0, 5)}-${cepNumerico.substring(5)}`;
};

/**
 * Busca endereço pelo CEP utilizando a API ViaCEP
 * @param cep CEP a ser consultado (apenas números)
 * @returns Promise com os dados do endereço ou erro
 */
export const buscarCEP = async (cep: string): Promise<EnderecoFormatado> => {
  // Remove caracteres não numéricos
  const cepNumerico = cep.replace(/\D/g, '');
  
  // Valida o CEP
  if (!validarCEP(cepNumerico)) {
    throw new Error('CEP inválido. O CEP deve conter 8 dígitos numéricos.');
  }
  
  try {
    // Faz a requisição para a API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`);
    
    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      throw new Error(`Erro ao buscar CEP: ${response.status} ${response.statusText}`);
    }
    
    // Converte a resposta para JSON
    const data: ViaCEPResponse = await response.json();
    
    // Verifica se a API retornou erro
    if (data.erro) {
      throw new Error('CEP não encontrado.');
    }
    
    // Retorna os dados formatados para o padrão do sistema
    return {
      cep: data.cep.replace('-', ''),
      uf: data.uf,
      cidade: data.localidade,
      bairro: data.bairro,
      logradouro: data.logradouro
    };
  } catch (error) {
    // Captura erros de rede ou da API
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao buscar CEP.');
  }
};
