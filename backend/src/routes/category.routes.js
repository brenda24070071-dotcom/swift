const express = require('express');
const {
  listCategories, getCategory, createCategory, updateCategory, deleteCategory,
} = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const router = express.Router();

router.get('/', listCategories);
router.get('/:id', getCategory);
router.post('/', authMiddleware, roleMiddleware('ADMIN'), createCategory);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), updateCategory);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), deleteCategory);

module.exports = router;
