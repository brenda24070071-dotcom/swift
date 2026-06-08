const prisma = require('../models');
const emailService = require('../services/email.service');

/** GET /api/wishlist */
async function getWishlist(req, res, next) {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { idUsuario: req.user.id },
      include: { produto: { include: { categoria: { select: { nome: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(wishlist);
  } catch (err) {
    next(err);
  }
}

/**
 * UC14 — Favoritar/Desfavoritar (toggle)
 * POST /api/wishlist
 */
async function toggleWishlist(req, res, next) {
  try {
    const { idProduto } = req.body;
    const idUsuario = req.user.id;

    if (!idProduto) return res.status(400).json({ error: 'idProduto é obrigatório.' });

    const existing = await prisma.wishlist.findUnique({
      where: { idUsuario_idProduto: { idUsuario, idProduto: parseInt(idProduto) } },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return res.json({ action: 'removed', message: 'Produto removido dos favoritos.' });
    }

    const item = await prisma.wishlist.create({
      data: { idUsuario, idProduto: parseInt(idProduto) },
      include: { produto: { select: { id: true, nome: true } } },
    });
    return res.status(201).json({ action: 'added', item });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/wishlist/:id */
async function removeFromWishlist(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    await prisma.wishlist.deleteMany({ where: { id, idUsuario: req.user.id } });
    return res.json({ message: 'Produto removido dos favoritos.' });
  } catch (err) {
    next(err);
  }
}

/**
 * UC15 — Finalizar Pedido (Checkout Simulado)
 * POST /api/cart/checkout
 */
async function checkout(req, res, next) {
  try {
    const idUsuario = req.user.id;

    const itens = await prisma.carrinhoItem.findMany({
      where: { idUsuario },
      include: { produto: true },
    });

    if (itens.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio. Adicione produtos antes de finalizar.' });
    }

    // Revalida estoque — UC15-A2
    for (const item of itens) {
      if (item.produto.estoque < item.quantidade) {
        return res.status(409).json({
          error: `Estoque insuficiente para "${item.produto.nome}". Disponível: ${item.produto.estoque}.`,
        });
      }
    }

    const total = itens.reduce(
      (acc, item) => acc + item.produto.preco * item.quantidade,
      0
    );

    // Transação: cria pedido + limpa carrinho
    // SQLite suporta transações Prisma normalmente
    const pedido = await prisma.$transaction(async (tx) => {
      const novoPedido = await tx.pedido.create({
        data: { idUsuario, status: 'PENDENTE', total },
      });
      await tx.carrinhoItem.deleteMany({ where: { idUsuario } });
      return novoPedido;
    });

    await emailService.sendOrderConfirmation(req.user.email, pedido.id, total);

    return res.status(201).json({
      message: 'Pedido realizado com sucesso!',
      pedido: {
        id:     pedido.id,
        status: pedido.status,
        total:  parseFloat(total.toFixed(2)),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getWishlist, toggleWishlist, removeFromWishlist, checkout };
