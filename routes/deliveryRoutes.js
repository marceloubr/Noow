const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const authMiddleware = require('../controllers/authMiddleware');

router.get('/', authMiddleware, deliveryController.getAllDeliveries);
router.put('/:id', authMiddleware, deliveryController.updateDelivery);

module.exports = router;
