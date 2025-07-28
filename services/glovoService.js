const db = require('../models');

function start() {
  setInterval(async () => {
    const restaurant = await db.Restaurant.findOne(); // Em um app real, buscaria o restaurante correto
    if (restaurant) {
      await db.Delivery.create({
        platform: 'Glovo',
        pickupAddress: restaurant.address,
        deliveryAddress: 'Avenida Inventada, 456',
        value: 6.0,
        estimatedTime: 15,
        RestaurantId: restaurant.id,
      });
      console.log('Novo pedido da Glovo recebido');
    }
  }, 45000);
}

module.exports = { start };
