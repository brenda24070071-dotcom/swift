// backend/tests/unit/helpers.test.js
const { generateSlug, formatCurrencyBRL, removeNullish } = require('../../src/utils/helpers');

describe('generateSlug()', () => {
  it('deve converter texto com acentos e espaços', () => {
    expect(generateSlug('Placas de Vídeo')).toBe('placas-de-video');
  });

  it('deve converter para minúsculas', () => {
    expect(generateSlug('GPUs RTX')).toBe('gpus-rtx');
  });

  it('deve remover caracteres especiais', () => {
    expect(generateSlug('Periféricos & Acessórios!')).toBe('perifericos-acessorios');
  });

  it('deve remover hifens duplicados', () => {
    expect(generateSlug('teste--duplo')).toBe('teste-duplo');
  });
});

describe('removeNullish()', () => {
  it('deve remover chaves null e undefined', () => {
    const result = removeNullish({ a: 1, b: null, c: undefined, d: 'ok' });
    expect(result).toEqual({ a: 1, d: 'ok' });
  });

  it('deve preservar 0 e strings vazias', () => {
    const result = removeNullish({ a: 0, b: '', c: false });
    expect(result).toEqual({ a: 0, b: '', c: false });
  });
});

describe('formatCurrencyBRL()', () => {
  it('deve formatar número como moeda BRL', () => {
    const result = formatCurrencyBRL(1234.5);
    expect(result).toContain('1.234,50');
  });
});
