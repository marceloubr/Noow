module.exports = (sequelize, DataTypes) => {
  const Delivery = sequelize.define('Delivery', {
    orderId: {
      type: DataTypes.STRING,
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
      defaultValue: 'Pendente' // 'Pendente', 'Aceito', 'Coletado', 'Entregue'
    },
    paymentValue: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 5.0 // Valor padrão da entrega
    },
    paid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  });

  return Delivery;
};
