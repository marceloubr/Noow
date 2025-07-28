const db = require('../models');
const notificationService = require('../services/notificationService');

exports.getAllDeliveries = async (req, res) => {
  const deliveries = await db.Delivery.findAll();
  res.json(deliveries);
};

exports.updateDelivery = async (req, res) => {
  const { status, assignedTo } = req.body;
  const delivery = await db.Delivery.findByPk(req.params.id);
  if (delivery) {
    delivery.status = status;
    if (assignedTo) {
      delivery.UserId = assignedTo;
      notificationService.sendNotification(
        assignedTo,
        'Nova entrega atribuída',
        `Você foi atribuído à entrega #${delivery.id}`
      );
    }
    await delivery.save();
    res.json(delivery);
  } else {
    res.status(404).send('Entrega não encontrada');
  }
};
