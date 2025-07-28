const db = require('../models');

function start() {
  setInterval(async () => {
    const restaurant = await db.Restaurant.findOne(); // Em um app real, buscaria o restaurante correto
    if (restaurant) {
      await db.Delivery.create({
        orderId: `UE-${Date.now()}`,
        pickupAddress: restaurant.address,
        deliveryAddress: 'Rua Fictícia, 123',
        status: 'Pendente',
        RestaurantId: restaurant.id,
      });
      console.log('Novo pedido do UberEats criado');
    }
  }, 30000);
}

module.exports = { start };
