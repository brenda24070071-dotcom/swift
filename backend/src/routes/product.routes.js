const express = require('express');
const {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
} = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const router = express.Router();

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', authMiddleware, roleMiddleware('ADMIN'), createProduct);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), deleteProduct);

module.exports = router;
