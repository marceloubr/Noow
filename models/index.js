const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('delivery_app', 'user', 'password', {
  host: 'localhost',
  dialect: 'postgres'
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user')(sequelize, Sequelize);
db.Restaurant = require('./restaurant')(sequelize, Sequelize);
db.Delivery = require('./delivery')(sequelize, Sequelize);
db.Document = require('./document')(sequelize, Sequelize);

db.User.hasMany(db.Document);
db.Document.belongsTo(db.User);

db.Restaurant.hasMany(db.Delivery);
db.Delivery.belongsTo(db.Restaurant);

db.User.hasMany(db.Delivery);
db.Delivery.belongsTo(db.User);

module.exports = db;
