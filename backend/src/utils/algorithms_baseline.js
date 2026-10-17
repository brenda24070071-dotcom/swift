// backend/src/utils/algorithms_baseline.js
// Implementações de referência (Baseline Original) das 8 funções analisadas na Fase 1.
// Este arquivo serve como ORÁCULO DE REGRESSÃO para garantir que a saída
// permaneça estritamente idêntica após qualquer refatoração (Meta D).

let helpers;
try {
  helpers = require('./helpers');
} catch (e) {
  try {
    helpers = require('../../swift_repo/backend/src/utils/helpers');
  } catch (e2) {
    helpers = {};
  }
}
const { generateSlug, removeNullish } = helpers;

/**
 * F1: enrichProducts (Baseline Quadrático O(p * a))
 * Realiza join em memória de produtos e avaliações via busca linear filter() aninhada.
 */
function enrichProductsBaseline(produtos, avaliacoes) {
  return produtos.map((p) => {
    const revs = avaliacoes.filter((av) => av.idProduto === p.id);
    const total = revs.length;
    const soma = revs.reduce((acc, r) => acc + r.nota, 0);
    const media = total > 0 ? parseFloat((soma / total).toFixed(1)) : 0;
    return {
      ...p,
      media,
      totalAvaliacoes: total,
    };
  });
}

/**
 * F2: deduplicateCartItems (Baseline Quadrático O(n^2))
 * Remove itens com mesmo idProduto usando comparação todos-contra-todos via findIndex().
 */
function deduplicateCartItemsBaseline(items) {
  return items.filter((item, index, self) => {
    return self.findIndex((other) => other.idProduto === item.idProduto) === index;
  });
}

/**
 * F3: validateStockCross (Baseline Quadrático O(c * e))
 * Valida estoque de cada item do carrinho fazendo busca linear find() no catálogo.
 */
function validateStockCrossBaseline(itensCarrinho, catalogoEstoque) {
  for (let i = 0; i < itensCarrinho.length; i++) {
    const item = itensCarrinho[i];
    const produto = catalogoEstoque.find((p) => p.id === item.idProduto);
    if (!produto) {
      throw new Error(`Produto ${item.idProduto} não encontrado no catálogo.`);
    }
    if (produto.estoque < item.quantidade) {
      throw new Error(
        `Estoque insuficiente para "${produto.nome || item.idProduto}". Solicitado: ${item.quantidade}, Disponível: ${produto.estoque}.`
      );
    }
  }
  return true;
}

/**
 * F4: simulateSeedCategories (Baseline Sequencial O(N) operações I/O)
 * Simulação determinística de inserção sequencial vs em lote.
 */
function simulateSeedCategoriesBaseline(catsData, dbMock) {
  const inserted = [];
  for (const c of catsData) {
    dbMock.insertSingle(c);
    inserted.push(c);
  }
  return inserted;
}

/**
 * F5: getResumoBatch (Baseline N+1 queries O(p) operações)
 * Calcula médias e totais executando agregação por produto.
 */
function getResumoBatchBaseline(produtos, avaliacoes) {
  const result = [];
  for (const prod of produtos) {
    const revs = avaliacoes.filter((a) => a.idProduto === prod.id);
    const total = revs.length;
    const soma = revs.reduce((acc, r) => acc + r.nota, 0);
    const media = total > 0 ? parseFloat((soma / total).toFixed(1)) : 0;
    result.push({
      id: prod.id,
      media,
      total,
    });
  }
  return result;
}

/**
 * F6: generateSlug (Helpers Original - 7 passadas encadeadas)
 */
const generateSlugBaseline = generateSlug;

/**
 * F7: removeNullish (Helpers Original - Object.entries + filter + fromEntries)
 */
const removeNullishBaseline = removeNullish;

/**
 * F8: simulateCepLookupDispatch (Baseline com duplo disparo onChange + onBlur)
 * Simula o comportamento dos manipuladores de evento no frontend Register.jsx.
 */
function simulateCepLookupDispatchBaseline(events, fetchAddressFn) {
  let callCount = 0;
  for (const ev of events) {
    const clean = (ev.value || '').replace(/\D/g, '');
    if (clean.length === 8) {
      if (ev.type === 'change' || ev.type === 'blur') {
        callCount++;
        fetchAddressFn(clean);
      }
    }
  }
  return callCount;
}

module.exports = {
  enrichProductsBaseline,
  deduplicateCartItemsBaseline,
  validateStockCrossBaseline,
  simulateSeedCategoriesBaseline,
  getResumoBatchBaseline,
  generateSlugBaseline,
  removeNullishBaseline,
  simulateCepLookupDispatchBaseline,
};
