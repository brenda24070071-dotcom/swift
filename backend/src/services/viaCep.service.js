const axios = require('axios');

const VIACEP_BASE_URL = process.env.VIACEP_BASE_URL || 'https://viacep.com.br/ws';

// Cache simples em memória (TTL configurável via env)
const cache = new Map();
const CACHE_TTL = parseInt(process.env.VIACEP_CACHE_TTL || '300', 10) * 1000; // ms

class ViaCepService {
  /**
   * Limpa o cache em memória. Útil para garantir isolamento entre testes
   * (evita que um CEP consultado anteriormente mascare uma nova requisição).
   */
  clearCache() {
    cache.clear();
  }

  /**
   * Consulta um CEP e retorna os dados de endereço.
   * Utiliza cache em memória para evitar requisições repetidas.
   * @param {string} cep - CEP com 8 dígitos (apenas números)
   * @returns {Promise<object>} Dados de endereço sanitizados
   */
  async getAddress(cep) {
    const cleanCep = cep.replace(/\D/g, '');

    if (!/^\d{8}$/.test(cleanCep)) {
      throw Object.assign(new Error('CEP deve conter exatamente 8 dígitos numéricos.'), { status: 400 });
    }

    // Verifica cache
    const cached = cache.get(cleanCep);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await axios.get(`${VIACEP_BASE_URL}/${cleanCep}/json/`, {
        timeout: 5000,
        headers: { 'User-Agent': 'SwiftCart/1.0 (Projeto Acadêmico)' },
      });

      const data = response.data;

      if (data.erro) {
        throw Object.assign(new Error('CEP não encontrado.'), { status: 404 });
      }

      const sanitized = {
        cep:         data.cep?.replace('-', '') || cleanCep,
        logradouro:  data.logradouro?.trim() || null,
        complemento: data.complemento?.trim() || null,
        bairro:      data.bairro?.trim() || null,
        cidade:      data.localidade?.trim() || null,
        uf:          data.uf?.trim() || null,
        ibge:        data.ibge || null,
      };

      // Salva no cache
      cache.set(cleanCep, { data: sanitized, timestamp: Date.now() });

      return sanitized;
    } catch (error) {
      if (error.status) throw error; // re-throw dos erros já tratados
      if (process.env.NODE_ENV !== 'test') {
        console.error('[ViaCepService] Erro na requisição:', error.message);
      }
      throw Object.assign(
        new Error('Não foi possível consultar o CEP. Tente novamente ou preencha o endereço manualmente.'),
        { status: 503 }
      );
    }
  }
}

module.exports = new ViaCepService();
