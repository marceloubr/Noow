const db = require('../models');

function start() {
  setInterval(async () => {
    const restaurant = await db.Restaurant.findOne(); // Em um app real, buscaria o restaurante correto
    if (restaurant) {
      await db.Delivery.create({
        platform: 'UberEats',
        pickupAddress: restaurant.address,
        deliveryAddress: 'Rua Fictícia, 123',
        value: 7.5,
        estimatedTime: 20,
        RestaurantId: restaurant.id,
      });
      console.log('Novo pedido do UberEats recebido');
    }
  }, 30000);
}

module.exports = { start };
