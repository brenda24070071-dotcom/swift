const express = require('express');
const { getProfile, updateProfile, deleteAccount, getCep } = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

router.get('/me', authMiddleware, getProfile);
router.put('/me', authMiddleware, updateProfile);
router.delete('/me', authMiddleware, deleteAccount);

// Proxy ViaCEP — acessível sem autenticação para o form de cadastro
router.get('/cep/:cep', getCep);

module.exports = router;
