const db = require('../models');
const notificationService = require('./notificationService');

async function distributeOrders() {
  const pendingDeliveries = await db.Delivery.findAll({ where: { status: 'Pendente' } });
  const availableDeliverers = await db.User.findAll({ where: { status: 'verified' } });

  if (availableDeliverers.length === 0) {
    return;
  }

  for (const delivery of pendingDeliveries) {
    const randomDeliverer = availableDeliverers[Math.floor(Math.random() * availableDeliverers.length)];
    delivery.UserId = randomDeliverer.id;
    delivery.status = 'Aceito'; // Atribuir automaticamente por enquanto
    await delivery.save();
    notificationService.sendNotification(
      randomDeliverer.id,
      'Nova entrega disponível',
      `A entrega #${delivery.id} está disponível para você.`
    );
  }
}

function start() {
  setInterval(distributeOrders, 10000); // Executa a cada 10 segundos
}

module.exports = { start };
