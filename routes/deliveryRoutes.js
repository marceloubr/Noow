const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/available', authMiddleware, deliveryController.getAvailableDeliveries);
router.post('/:id/accept', authMiddleware, deliveryController.acceptDelivery);
router.put('/:id/status', authMiddleware, deliveryController.updateDeliveryStatus);
router.get('/history', authMiddleware, deliveryController.getDeliveryHistory);

module.exports = router;
