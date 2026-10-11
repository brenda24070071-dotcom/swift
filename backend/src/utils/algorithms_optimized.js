function validateStockCrossOptimized(itensCarrinho, catalogoEstoque) {
  const estoqueMap = new Map();
  for (let j = 0; j < catalogoEstoque.length; j++) {
    const p = catalogoEstoque[j];
    estoqueMap.set(p.id, p);
  }
  for (let i = 0; i < itensCarrinho.length; i++) {
    const item = itensCarrinho[i];
    const produto = estoqueMap.get(item.idProduto);
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

function getResumoBatchOptimized(produtos, avaliacoes) {
  if (produtos.length === 0) return [];
  const statsMap = new Map();
  for (let i = 0; i < avaliacoes.length; i++) {
    const av = avaliacoes[i];
    const stat = statsMap.get(av.idProduto);
    if (!stat) {
      statsMap.set(av.idProduto, { soma: av.nota, total: 1 });
    } else {
      stat.soma += av.nota;
      stat.total += 1;
    }
  }
  return produtos.map((prod) => {
    const stat = statsMap.get(prod.id);
    const total = stat ? stat.total : 0;
    const media = total > 0 ? parseFloat((stat.soma / total).toFixed(1)) : 0;
    return {
      id: prod.id,
      media,
      total,
    };
  });
}

function removeNullishOptimized(obj) {
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (val !== undefined && val !== null) {
        result[key] = val;
      }
    }
  }
  return result;
}

function simulateCepLookupDispatchOptimized(events, fetchAddressFn) {
  let callCount = 0;
  let lastDispatchedCep = '';
  for (const ev of events) {
    const clean = (ev.value || '').replace(/\D/g, '');
    if (clean.length === 8 && clean !== lastDispatchedCep) {
      lastDispatchedCep = clean;
      callCount++;
      fetchAddressFn(clean);
    }
  }
  return callCount;
}

module.exports = {
  validateStockCrossOptimized,
  getResumoBatchOptimized,
  removeNullishOptimized,
  simulateCepLookupDispatchOptimized,
};
