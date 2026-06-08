const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../models');
const { validate } = require('../services/validation.service');
const viaCepService = require('../services/viaCep.service');
const emailService = require('../services/email.service');

/**
 * UC01 — Cadastrar Usuário
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    validate('register', req.body);

    const { nome, email, senha, cep } = req.body;

    // Verifica e-mail duplicado
    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'E-mail já cadastrado.' });
    }

    // Consulta endereço via ViaCEP (se CEP fornecido)
    let addressData = {};
    if (cep) {
      try {
        const addr = await viaCepService.getAddress(cep);
        addressData = {
          cep:        addr.cep,
          logradouro: addr.logradouro,
          bairro:     addr.bairro,
          cidade:     addr.cidade,
          uf:         addr.uf,
        };
      } catch {
        // CEP inválido não bloqueia o cadastro — fluxo alternativo UC01-A1
        console.warn('[register] CEP inválido, cadastro prossegue sem endereço.');
      }
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: senhaHash, ...addressData },
      select: { id: true, nome: true, email: true, tipoAcesso: true, createdAt: true },
    });

    await emailService.sendWelcome(email, nome);

    return res.status(201).json({ message: 'Usuário cadastrado com sucesso.', usuario });
  } catch (err) {
    next(err);
  }
}

/**
 * UC02 — Efetuar Login
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    validate('login', req.body);

    const { email, senha } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas.' }); // mensagem genérica
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipoAcesso: usuario.tipoAcesso },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipoAcesso: usuario.tipoAcesso,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
