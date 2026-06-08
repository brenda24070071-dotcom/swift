const express = require('express');
const { getCart, addToCart, updateCartItem, removeFromCart } = require('../controllers/cart.controller');
const { checkout } = require('../controllers/wishlist.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(authMiddleware); // todas as rotas de carrinho exigem login

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeFromCart);
router.post('/checkout', checkout);

module.exports = router;
