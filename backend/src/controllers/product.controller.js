const prisma = require('../models');
const { validate } = require('../services/validation.service');
const { removeNullish } = require('../utils/helpers');

/**
 * UC08 — Listar/Buscar Produtos
 * GET /api/products?search=&categoria=&page=&limit=
 */
async function listProducts(req, res, next) {
  try {
    const { search, categoria, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    // SQLite não suporta mode:'insensitive' — usa contains simples
    if (search) {
      where.nome = { contains: search };
    }
    if (categoria) {
      where.categoria = { slug: categoria };
    }

    const [produtos, total] = await Promise.all([
      prisma.produto.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: { categoria: { select: { id: true, nome: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.produto.count({ where }),
    ]);

    return res.json({
      data: produtos,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/products/:id */
async function getProduct(req, res, next) {
  try {
    const produto = await prisma.produto.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { categoria: true },
    });
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado.' });
    return res.json(produto);
  } catch (err) {
    next(err);
  }
}

/**
 * UC05 — Cadastrar Produto (Admin)
 * POST /api/products
 */
async function createProduct(req, res, next) {
  try {
    validate('produto', req.body);
    const { nome, descricao, preco, estoque, imagemUrl, idCategoria } = req.body;
    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao: descricao || null,
        preco: parseFloat(preco),
        estoque: parseInt(estoque),
        imagemUrl: imagemUrl || null,
        idCategoria: idCategoria ? parseInt(idCategoria) : null,
      },
      include: { categoria: true },
    });
    return res.status(201).json(produto);
  } catch (err) {
    next(err);
  }
}

/**
 * UC06 — Editar Produto (Admin)
 * PUT /api/products/:id
 */
async function updateProduct(req, res, next) {
  try {
    const { nome, descricao, preco, estoque, imagemUrl, idCategoria } = req.body;
    const data = removeNullish({
      nome,
      descricao,
      preco:       preco       !== undefined ? parseFloat(preco)       : undefined,
      estoque:     estoque     !== undefined ? parseInt(estoque)       : undefined,
      imagemUrl:   imagemUrl   !== undefined ? imagemUrl               : undefined,
      idCategoria: idCategoria !== undefined ? (idCategoria ? parseInt(idCategoria) : null) : undefined,
    });

    const produto = await prisma.produto.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: { categoria: true },
    });
    return res.json(produto);
  } catch (err) {
    next(err);
  }
}

/**
 * UC07 — Excluir Produto (Admin)
 * DELETE /api/products/:id
 */
async function deleteProduct(req, res, next) {
  try {
    await prisma.produto.delete({ where: { id: parseInt(req.params.id) } });
    return res.json({ message: 'Produto excluído com sucesso.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
