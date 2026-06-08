const bcrypt = require('bcryptjs');
const prisma = require('../models');
const viaCepService = require('../services/viaCep.service');
const { removeNullish } = require('../utils/helpers');

/**
 * UC03 — Editar Perfil
 * PUT /api/users/me
 */
async function updateProfile(req, res, next) {
  try {
    const { id } = req.user;
    const { nome, cep, numero, complemento } = req.body;

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
        console.warn('[updateProfile] CEP inválido ignorado.');
      }
    }

    const updated = await prisma.usuario.update({
      where: { id },
      data: removeNullish({ nome, numero, complemento, ...addressData }),
      select: { id: true, nome: true, email: true, cep: true, logradouro: true,
                bairro: true, cidade: true, uf: true, numero: true, complemento: true },
    });

    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * UC04 — Excluir Conta
 * DELETE /api/users/me
 */
async function deleteAccount(req, res, next) {
  try {
    const { id } = req.user;
    await prisma.usuario.delete({ where: { id } });
    return res.json({ message: 'Conta excluída com sucesso.' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users/me — Perfil atual
 */
async function getProfile(req, res, next) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: { id: true, nome: true, email: true, cep: true, logradouro: true,
                bairro: true, cidade: true, uf: true, numero: true, complemento: true,
                tipoAcesso: true, createdAt: true },
    });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });
    return res.json(usuario);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users/cep/:cep — Proxy para ViaCEP
 */
async function getCep(req, res, next) {
  try {
    const data = await viaCepService.getAddress(req.params.cep);
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { updateProfile, deleteAccount, getProfile, getCep };
