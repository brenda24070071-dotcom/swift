// backend/tests/unit/validation.service.test.js
const { validate } = require('../../src/services/validation.service');

// Helper: captura o status do erro lançado pela validação.
function statusOf(schema, data) {
  try {
    validate(schema, data);
    return null; // não lançou
  } catch (err) {
    return err.status;
  }
}

describe('validate("avaliacao")', () => {
  const base = { idProduto: 1, nota: 4, comentario: 'Bom produto' };

  it('aceita uma avaliação válida (nota 1–5)', () => {
    expect(statusOf('avaliacao', base)).toBeNull();
    expect(statusOf('avaliacao', { idProduto: 2, nota: 1 })).toBeNull();
    expect(statusOf('avaliacao', { idProduto: 2, nota: 5 })).toBeNull();
  });

  it('rejeita nota acima de 5 (400)', () => {
    expect(statusOf('avaliacao', { ...base, nota: 6 })).toBe(400);
  });

  it('rejeita nota abaixo de 1 (400)', () => {
    expect(statusOf('avaliacao', { ...base, nota: 0 })).toBe(400);
  });

  it('rejeita nota fracionária (400)', () => {
    expect(statusOf('avaliacao', { ...base, nota: 3.5 })).toBe(400);
  });

  it('rejeita nota ausente (400)', () => {
    expect(statusOf('avaliacao', { idProduto: 1, comentario: 'sem nota' })).toBe(400);
  });

  it('rejeita idProduto ausente (400)', () => {
    expect(statusOf('avaliacao', { nota: 4 })).toBe(400);
  });

  it('rejeita comentário acima de 1000 caracteres (400)', () => {
    expect(statusOf('avaliacao', { ...base, comentario: 'x'.repeat(1001) })).toBe(400);
  });
});

describe('validate("avaliacaoUpdate")', () => {
  it('aceita atualização só de nota', () => {
    expect(statusOf('avaliacaoUpdate', { nota: 2 })).toBeNull();
  });

  it('rejeita atualização vazia (400)', () => {
    expect(statusOf('avaliacaoUpdate', {})).toBe(400);
  });

  it('rejeita nota fora do intervalo na atualização (400)', () => {
    expect(statusOf('avaliacaoUpdate', { nota: 9 })).toBe(400);
  });
});
