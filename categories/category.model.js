const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('category', {
        id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},        
        name:{type:DataTypes.STRING(50), allowNull: false},        
        createdDate:{type:DataTypes.DATE},
        updatedDate:{type:DataTypes.DATE}
    },{
        createdAt: 'createdDate',
        updatedAt: 'updatedDate'
    });
}