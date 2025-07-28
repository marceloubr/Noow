const db = require('../models');

exports.getAllUsers = async (req, res) => {
  const users = await db.User.findAll();
  res.json(users);
};

exports.getAllRestaurants = async (req, res) => {
  const restaurants = await db.Restaurant.findAll();
  res.json(restaurants);
};

exports.getAllDeliveries = async (req, res) => {
  const deliveries = await db.Delivery.findAll();
  res.json(deliveries);
};
