// backend/tests/unit/regression_oracle.test.js
// Testes de Regressão e Oráculo de Comportamento para APA (CESUPA 2026/2)
// Compatível com Jest e com o runner nativo do Node.js

const assert = require('assert');
const { describe, it } = typeof global.describe === 'function' ? global : require('node:test');
const {
  enrichProductsBaseline,
  deduplicateCartItemsBaseline,
  validateStockCrossBaseline,
  simulateSeedCategoriesBaseline,
  getResumoBatchBaseline,
  generateSlugBaseline,
  removeNullishBaseline,
  simulateCepLookupDispatchBaseline,
} = require('../../src/utils/algorithms_baseline');

describe('Oráculo de Regressão — Fase 2 (APA)', () => {
  describe('F1: enrichProductsBaseline', () => {
    it('calcula médias e totais com precisão', () => {
      const prods = [{ id: 1, nome: 'GPU', preco: 1000 }];
      const revs = [
        { id: 10, idProduto: 1, nota: 5 },
        { id: 11, idProduto: 1, nota: 4 },
      ];
      const res = enrichProductsBaseline(prods, revs);
      assert.strictEqual(res[0].media, 4.5);
      assert.strictEqual(res[0].totalAvaliacoes, 2);
    });

    it('trata lista vazia de produtos e avaliações', () => {
      assert.deepStrictEqual(enrichProductsBaseline([], []), []);
    });
  });

  describe('F2: deduplicateCartItemsBaseline', () => {
    it('elimina itens repetidos preservando a ordem do primeiro', () => {
      const items = [
        { id: 1, idProduto: 10 },
        { id: 2, idProduto: 20 },
        { id: 3, idProduto: 10 },
      ];
      const res = deduplicateCartItemsBaseline(items);
      assert.strictEqual(res.length, 2);
      assert.strictEqual(res[0].idProduto, 10);
      assert.strictEqual(res[1].idProduto, 20);
    });
  });

  describe('F3: validateStockCrossBaseline', () => {
    it('valida limites de estoque e dispara exceção se exceder', () => {
      const cat = [{ id: 1, estoque: 5 }];
      assert.strictEqual(validateStockCrossBaseline([{ idProduto: 1, quantidade: 5 }], cat), true);
      assert.throws(() => validateStockCrossBaseline([{ idProduto: 1, quantidade: 6 }], cat));
    });
  });

  describe('F4: simulateSeedCategoriesBaseline', () => {
    it('insere todas as categorias fornecidas', () => {
      const ops = [];
      const res = simulateSeedCategoriesBaseline([{ nome: 'A', slug: 'a' }], {
        insertSingle: (x) => ops.push(x),
      });
      assert.strictEqual(res.length, 1);
      assert.strictEqual(ops.length, 1);
    });
  });

  describe('F5: getResumoBatchBaseline', () => {
    it('agrega avaliações corretamente', () => {
      const prods = [{ id: 1 }, { id: 2 }];
      const revs = [{ idProduto: 1, nota: 4 }];
      const res = getResumoBatchBaseline(prods, revs);
      assert.strictEqual(res[0].media, 4.0);
      assert.strictEqual(res[1].media, 0);
    });
  });

  describe('F6: generateSlugBaseline', () => {
    it('trata diacríticos, pontuação e casos de borda', () => {
      assert.strictEqual(generateSlugBaseline('Placas de Vídeo!'), 'placas-de-video');
      assert.strictEqual(generateSlugBaseline(''), '');
      assert.strictEqual(generateSlugBaseline('   '), '');
    });
  });

  describe('F7: removeNullishBaseline', () => {
    it('remove nullish preservando falsy válidos', () => {
      const res = removeNullishBaseline({ a: 0, b: null, c: undefined, d: false });
      assert.deepStrictEqual(res, { a: 0, d: false });
    });
  });

  describe('F8: simulateCepLookupDispatchBaseline', () => {
    it('simula duplo disparo de eventos de CEP', () => {
      const logs = [];
      const count = simulateCepLookupDispatchBaseline(
        [
          { type: 'change', value: '01310-100' },
          { type: 'blur', value: '01310-100' },
        ],
        (c) => logs.push(c)
      );
      assert.strictEqual(count, 2);
      assert.strictEqual(logs.length, 2);
    });
  });
});
