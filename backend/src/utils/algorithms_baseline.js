const { removeNullish } = require('./helpers');

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
  validateStockCrossBaseline,
  getResumoBatchBaseline,
  removeNullishBaseline,
  simulateCepLookupDispatchBaseline,
};
