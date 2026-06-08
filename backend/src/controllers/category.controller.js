const prisma = require('../models');
const { validate } = require('../services/validation.service');
const { generateSlug } = require('../utils/helpers');

/** GET /api/categories */
async function listCategories(req, res, next) {
  try {
    const categorias = await prisma.categoria.findMany({
      include: { _count: { select: { produtos: true } } },
      orderBy: { nome: 'asc' },
    });
    return res.json(categorias);
  } catch (err) {
    next(err);
  }
}

/** GET /api/categories/:id */
async function getCategory(req, res, next) {
  try {
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { _count: { select: { produtos: true } } },
    });
    if (!categoria) return res.status(404).json({ error: 'Categoria não encontrada.' });
    return res.json(categoria);
  } catch (err) {
    next(err);
  }
}

/**
 * UC12 — Criar Categoria (Admin)
 * POST /api/categories
 */
async function createCategory(req, res, next) {
  try {
    validate('categoria', req.body);
    const { nome, slug } = req.body;
    const slugFinal = slug || generateSlug(nome);

    const categoria = await prisma.categoria.create({ data: { nome, slug: slugFinal } });
    return res.status(201).json(categoria);
  } catch (err) {
    next(err);
  }
}

/** PUT /api/categories/:id */
async function updateCategory(req, res, next) {
  try {
    const { nome, slug } = req.body;
    const data = { nome };
    if (slug) data.slug = slug;
    else if (nome) data.slug = generateSlug(nome);

    const categoria = await prisma.categoria.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    return res.json(categoria);
  } catch (err) {
    next(err);
  }
}

/**
 * UC13 — Remover Categoria (Admin)
 * DELETE /api/categories/:id
 */
async function deleteCategory(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    // Verifica produtos vinculados — fluxo alternativo UC13-A1
    const count = await prisma.produto.count({ where: { idCategoria: id } });
    if (count > 0) {
      return res.status(409).json({
        error: `Não é possível excluir: existem produtos vinculados a esta categoria.`,
      });
    }

    await prisma.categoria.delete({ where: { id } });
    return res.json({ message: 'Categoria removida com sucesso.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, getCategory, createCategory, updateCategory, deleteCategory };
