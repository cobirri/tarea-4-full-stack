const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Rutas accesibles para usuarios autenticados
router.get('/', verifyToken, productController.getProducts);
router.get('/:id', verifyToken, productController.getProductById);

// Rutas protegidas exclusivamente para rol Admin
router.post('/', verifyToken, requireAdmin, productController.createProduct);
router.put('/:id', verifyToken, requireAdmin, productController.updateProduct);
router.delete('/:id', verifyToken, requireAdmin, productController.deleteProduct);

module.exports = router;
