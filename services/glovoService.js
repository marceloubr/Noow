const db = require('../models');

function start() {
  setInterval(async () => {
    const restaurant = await db.Restaurant.findOne(); // Em um app real, buscaria o restaurante correto
    if (restaurant) {
      await db.Delivery.create({
        orderId: `GLO-${Date.now()}`,
        pickupAddress: restaurant.address,
        deliveryAddress: 'Avenida Inventada, 456',
        status: 'Pendente',
        RestaurantId: restaurant.id,
      });
      console.log('Novo pedido da Glovo criado');
    }
  }, 45000);
}

module.exports = { start };
