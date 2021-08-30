const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('user_trip', {
        id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true}, 
        isOwner: {type: DataTypes.BOOLEAN},
        createdDate:{type:DataTypes.DATE},
        updatedDate:{type:DataTypes.DATE},       
    },{
        createdAt: 'createdDate',
        updatedAt: 'updatedDate'
    });
}