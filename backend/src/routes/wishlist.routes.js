const express = require('express');
const { getWishlist, toggleWishlist, removeFromWishlist } = require('../controllers/wishlist.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(authMiddleware);

router.get('/', getWishlist);
router.post('/', toggleWishlist);
router.delete('/:id', removeFromWishlist);

module.exports = router;
