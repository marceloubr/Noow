module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    type: {
      type: DataTypes.STRING, // 'RG', 'CNH', 'Bank'
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  return Document;
};
