module.exports = (sequelize, DataTypes) => {
  const Delivery = sequelize.define('Delivery', {
    platform: {
      type: DataTypes.STRING, // 'UberEats', 'Glovo'
      allowNull: false
    },
    pickupAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deliveryAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Pendente' // 'Pendente', 'Aceito', 'Coletado', 'Entregue', 'Cancelado'
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    estimatedTime: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: false
    }
  });

  return Delivery;
};
