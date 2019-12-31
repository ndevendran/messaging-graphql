import Sequelize from 'sequelize';

const comment = (sequelize, DataTypes) => {
  const Comment = sequelize.define('comment', {
    text: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: "Comments must have text",
        },
      },
    },
  });

  Comment.associate = models => {
    Comment.belongsTo(models.User);
    Comment.belongsTo(models.Message);
    Comment.hasMany(models.Like, { onDelete:'CASCADE' });
  };

  return Comment;
};

export default comment;
