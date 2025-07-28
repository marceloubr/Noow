const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../controllers/authMiddleware');

router.get('/users', authMiddleware, adminController.getAllUsers);
router.get('/restaurants', authMiddleware, adminController.getAllRestaurants);
router.get('/deliveries', authMiddleware, adminController.getAllDeliveries);

module.exports = router;
