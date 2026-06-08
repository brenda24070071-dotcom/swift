const prisma = require('../models');
const { validate } = require('../services/validation.service');
const { removeNullish } = require('../utils/helpers');

const usuarioSelect = { select: { id: true, nome: true } };

/** Calcula média (1 casa) e total de avaliações de um produto. */
async function getResumo(idProduto) {
  const agg = await prisma.avaliacao.aggregate({
    where: { idProduto },
    _avg: { nota: true },
    _count: { _all: true },
  });
  return {
    total: agg._count._all,
    media: agg._avg.nota ? parseFloat(agg._avg.nota.toFixed(1)) : 0,
  };
}

/**
 * Listar avaliações de um produto.
 * GET /api/products/:productId/reviews   (público)
 */
async function listReviews(req, res, next) {
  try {
    const idProduto = parseInt(req.params.productId);
    if (Number.isNaN(idProduto)) {
      return res.status(400).json({ error: 'ID de produto inválido.' });
    }

    const [data, resumo] = await Promise.all([
      prisma.avaliacao.findMany({
        where: { idProduto },
        include: { usuario: usuarioSelect },
        orderBy: { createdAt: 'desc' },
      }),
      getResumo(idProduto),
    ]);

    return res.json({ data, ...resumo });
  } catch (err) {
    next(err);
  }
}

/**
 * Criar avaliação.
 * POST /api/products/:productId/reviews   (autenticado)
 */
async function createReview(req, res, next) {
  try {
    const idProduto = parseInt(req.params.productId);
    if (Number.isNaN(idProduto)) {
      return res.status(400).json({ error: 'ID de produto inválido.' });
    }

    validate('avaliacao', { idProduto, nota: req.body.nota, comentario: req.body.comentario });

    const produto = await prisma.produto.findUnique({ where: { id: idProduto } });
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado.' });

    const avaliacao = await prisma.avaliacao.create({
      data: {
        idProduto,
        idUsuario: req.user.id,
        nota: parseInt(req.body.nota),
        comentario: req.body.comentario?.trim() || null,
      },
      include: { usuario: usuarioSelect },
    });

    return res.status(201).json(avaliacao);
  } catch (err) {
    // Unicidade (idUsuario, idProduto) → já avaliou este produto
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Você já avaliou este produto.' });
    }
    next(err);
  }
}

/**
 * Atualizar a própria avaliação.
 * PUT /api/reviews/:id   (autenticado + dono)
 */
async function updateReview(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    validate('avaliacaoUpdate', req.body);

    const existing = await prisma.avaliacao.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Avaliação não encontrada.' });
    if (existing.idUsuario !== req.user.id) {
      return res.status(403).json({ error: 'Você só pode editar suas próprias avaliações.' });
    }

    const data = removeNullish({
      nota:       req.body.nota       !== undefined ? parseInt(req.body.nota) : undefined,
      comentario: req.body.comentario !== undefined ? (req.body.comentario?.trim() || null) : undefined,
    });

    const avaliacao = await prisma.avaliacao.update({
      where: { id },
      data,
      include: { usuario: usuarioSelect },
    });

    return res.json(avaliacao);
  } catch (err) {
    next(err);
  }
}

/**
 * Excluir avaliação (dono ou ADMIN).
 * DELETE /api/reviews/:id   (autenticado)
 */
async function deleteReview(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.avaliacao.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Avaliação não encontrada.' });

    const isOwner = existing.idUsuario === req.user.id;
    const isAdmin = req.user.tipoAcesso === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Sem permissão para excluir esta avaliação.' });
    }

    await prisma.avaliacao.delete({ where: { id } });
    return res.json({ message: 'Avaliação excluída com sucesso.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listReviews, createReview, updateReview, deleteReview, getResumo };
