const like = (sequelize, DataTypes) => {
  const Like = sequelize.define('likes', {
    
  });

  Like.associate = models => {
    Like.belongsTo(models.User);
  };

  return Like;
};

export default like;
