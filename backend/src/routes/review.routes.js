const express = require('express');
const { updateReview, deleteReview } = require('../controllers/review.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

// Edição/exclusão exigem login; a posse é validada no controller.
router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);

module.exports = router;
