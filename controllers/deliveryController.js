const db = require('../models');

exports.getAvailableDeliveries = async (req, res) => {
  const deliveries = await db.Delivery.findAll({ where: { status: 'Pendente' } });
  res.json(deliveries);
};

exports.acceptDelivery = async (req, res) => {
  const delivery = await db.Delivery.findByPk(req.params.id);
  if (delivery && delivery.status === 'Pendente') {
    delivery.status = 'Aceito';
    delivery.UserId = req.session.userId;
    await delivery.save();
    res.json(delivery);
  } else {
    res.status(400).json({ error: 'Entrega não disponível' });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  const { status } = req.body;
  const delivery = await db.Delivery.findByPk(req.params.id);
  if (delivery && delivery.UserId === req.session.userId) {
    delivery.status = status;
    await delivery.save();
    res.json(delivery);
  } else {
    res.status(401).json({ error: 'Não autorizado' });
  }
};

exports.getDeliveryHistory = async (req, res) => {
  const deliveries = await db.Delivery.findAll({ where: { UserId: req.session.userId } });
  res.json(deliveries);
};
