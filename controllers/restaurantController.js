const db = require('../models');

exports.getDeliverers = async (req, res) => {
  const deliverers = await db.User.findAll({ where: { role: 'deliverer' } });
  res.json(deliverers);
};
