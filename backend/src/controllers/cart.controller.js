const prisma = require('../models');
const { validate } = require('../services/validation.service');

/** UC09 — Ver Carrinho | GET /api/cart */
async function getCart(req, res, next) {
  try {
    const itens = await prisma.carrinhoItem.findMany({
      where: { idUsuario: req.user.id },
      include: { produto: { include: { categoria: { select: { nome: true } } } } },
    });

    const total = itens.reduce(
      (acc, item) => acc + Number(item.produto.preco) * item.quantidade,
      0
    );

    return res.json({ itens, total: parseFloat(total.toFixed(2)) });
  } catch (err) {
    next(err);
  }
}

/** UC09 — Adicionar ao Carrinho | POST /api/cart */
async function addToCart(req, res, next) {
  try {
    validate('carrinhoItem', req.body);
    const { idProduto, quantidade } = req.body;
    const idUsuario = req.user.id;

    // Valida estoque
    const produto = await prisma.produto.findUnique({ where: { id: idProduto } });
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado.' });
    if (produto.estoque === 0) return res.status(400).json({ error: 'Produto indisponível no estoque.' });
    if (quantidade > produto.estoque) {
      return res.status(400).json({ error: `Quantidade solicitada excede o estoque (${produto.estoque} unidades).` });
    }

    // Upsert: soma se já existe, cria se não existe
    const item = await prisma.carrinhoItem.upsert({
      where: { idUsuario_idProduto: { idUsuario, idProduto } },
      create: { idUsuario, idProduto, quantidade },
      update: { quantidade: { increment: quantidade } },
      include: { produto: true },
    });

    return res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

/** UC10 — Atualizar Quantidade | PUT /api/cart/:id */
async function updateCartItem(req, res, next) {
  try {
    const { quantidade } = req.body;
    const id = parseInt(req.params.id);

    const existing = await prisma.carrinhoItem.findFirst({
      where: { id, idUsuario: req.user.id },
      include: { produto: true },
    });
    if (!existing) return res.status(404).json({ error: 'Item não encontrado no carrinho.' });

    // Ajusta para o máximo disponível se necessário — fluxo alternativo UC10-A1
    const qtdFinal = Math.min(quantidade, existing.produto.estoque);

    const item = await prisma.carrinhoItem.update({
      where: { id },
      data: { quantidade: qtdFinal },
      include: { produto: true },
    });

    const aviso = qtdFinal < quantidade
      ? `Quantidade ajustada para o máximo disponível (${qtdFinal}).`
      : undefined;

    return res.json({ item, aviso });
  } catch (err) {
    next(err);
  }
}

/** UC11 — Remover do Carrinho | DELETE /api/cart/:id */
async function removeFromCart(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.carrinhoItem.findFirst({ where: { id, idUsuario: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Item não encontrado no carrinho.' });

    await prisma.carrinhoItem.delete({ where: { id } });
    return res.json({ message: 'Item removido do carrinho.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
