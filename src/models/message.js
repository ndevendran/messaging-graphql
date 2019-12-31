const message = (sequelize, DataTypes) => {
  const Message = sequelize.define('message', {
    text: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'A message must have text',
        },
      },
    },
  });

  Message.associate = models => {
    Message.belongsTo(models.User);
    Message.hasMany(models.Comment, { onDelete: 'CASCADE' });
    Message.hasMany(models.Like, { onDelete: 'CASCADE' });
  };

  return Message;
};

export default message;
