// frontend/src/services/viaCepService.js
const VIACEP_BASE = import.meta.env.VITE_VIACEP_BASE_URL || 'https://viacep.com.br/ws';

export const viaCepService = {
  async getAddress(cep) {
    const res = await fetch(`${VIACEP_BASE}/${cep}/json/`);
    if (!res.ok) throw new Error('Falha na requisição ao ViaCEP.');
    const data = await res.json();
    return data;
  },
};
