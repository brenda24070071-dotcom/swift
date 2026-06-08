// backend/tests/unit/viaCep.service.test.js
const axios = require('axios');
jest.mock('axios');

const viaCepService = require('../../src/services/viaCep.service');

describe('ViaCepService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Cache zerado a cada teste — assim o mock do axios SEMPRE é exercitado
    // e o cache de um teste não mascara o comportamento de outro.
    viaCepService.clearCache();
  });

  describe('getAddress()', () => {
    it('deve retornar dados de endereço para CEP válido', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          cep: '01001-000',
          logradouro: 'Praça da Sé',
          complemento: 'lado ímpar',
          bairro: 'Sé',
          localidade: 'São Paulo',
          uf: 'SP',
          ibge: '3550308',
          erro: undefined,
        },
      });

      const result = await viaCepService.getAddress('01001000');

      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({
        cep: '01001000',
        logradouro: 'Praça da Sé',
        bairro: 'Sé',
        cidade: 'São Paulo',
        uf: 'SP',
      });
    });

    it('deve usar o cache na segunda consulta do mesmo CEP (sem nova requisição)', async () => {
      axios.get.mockResolvedValueOnce({
        data: { cep: '20040-002', logradouro: 'Rua A', bairro: 'Centro', localidade: 'RJ', uf: 'RJ' },
      });

      await viaCepService.getAddress('20040002');
      await viaCepService.getAddress('20040002'); // deve vir do cache

      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro 404 para CEP não encontrado (campo erro=true)', async () => {
      axios.get.mockResolvedValueOnce({ data: { erro: true } });

      await expect(viaCepService.getAddress('99999999')).rejects.toMatchObject({
        status: 404,
        message: 'CEP não encontrado.',
      });
    });

    it('deve lançar erro 400 para CEP com formato inválido (sem chamar a API)', async () => {
      await expect(viaCepService.getAddress('123')).rejects.toMatchObject({
        status: 400,
      });
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('deve lançar erro 503 quando a API externa falha (timeout/rede)', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network Error'));

      // CEP distinto dos demais testes: garante que a falha de rede é
      // realmente propagada e não há cache prévio resolvendo a promise.
      await expect(viaCepService.getAddress('80010000')).rejects.toMatchObject({
        status: 503,
      });
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('deve aceitar CEP formatado com hífen e normalizar', async () => {
      axios.get.mockResolvedValueOnce({
        data: { cep: '70040-010', logradouro: 'Eixo', bairro: 'Asa Sul', localidade: 'Brasília', uf: 'DF' },
      });

      const result = await viaCepService.getAddress('70040-010');
      expect(result.cep).toBe('70040010');
    });
  });
});
