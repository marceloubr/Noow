const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user')(sequelize, Sequelize);
db.Restaurant = require('./restaurant')(sequelize, Sequelize);
db.Delivery = require('./delivery')(sequelize, Sequelize);

db.Restaurant.hasMany(db.Delivery);
db.Delivery.belongsTo(db.Restaurant);

db.User.hasMany(db.Delivery);
db.Delivery.belongsTo(db.User);

module.exports = db;
