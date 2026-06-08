// backend/tests/unit/viaCep.service.test.js
const axios = require('axios');
jest.mock('axios');

const viaCepService = require('../../src/services/viaCep.service');

describe('ViaCepService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

      expect(result).toMatchObject({
        cep: '01001000',
        logradouro: 'Praça da Sé',
        bairro: 'Sé',
        cidade: 'São Paulo',
        uf: 'SP',
      });
    });

    it('deve lançar erro 404 para CEP não encontrado (campo erro=true)', async () => {
      axios.get.mockResolvedValueOnce({ data: { erro: true } });

      await expect(viaCepService.getAddress('99999999')).rejects.toMatchObject({
        status: 404,
        message: 'CEP não encontrado.',
      });
    });

    it('deve lançar erro 400 para CEP com formato inválido', async () => {
      await expect(viaCepService.getAddress('123')).rejects.toMatchObject({
        status: 400,
      });
    });

    it('deve lançar erro 503 quando a API externa falha (timeout/rede)', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network Error'));

      await expect(viaCepService.getAddress('01001000')).rejects.toMatchObject({
        status: 503,
      });
    });

    it('deve aceitar CEP formatado com hífen e normalizar', async () => {
      axios.get.mockResolvedValueOnce({
        data: { cep: '01001-000', logradouro: 'Praça da Sé', bairro: 'Sé', localidade: 'SP', uf: 'SP' },
      });

      const result = await viaCepService.getAddress('01001-000');
      expect(result.cep).toBe('01001000');
    });
  });
});
