const db = require('../models');

async function processPayments() {
  const deliveriesToPay = await db.Delivery.findAll({
    where: {
      status: 'Entregue',
      paid: false, // Adicionaremos este campo ao modelo
    },
  });

  for (const delivery of deliveriesToPay) {
    console.log(`Pagando R$ ${delivery.paymentValue} pela entrega #${delivery.id} ao usuário #${delivery.UserId}`);
    delivery.paid = true;
    await delivery.save();
  }
}

function start() {
  setInterval(processPayments, 60000);
}

module.exports = { start };
