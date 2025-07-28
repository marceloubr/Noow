const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const authMiddleware = require('../controllers/authMiddleware');

router.get('/deliverers', authMiddleware, restaurantController.getDeliverers);

module.exports = router;
