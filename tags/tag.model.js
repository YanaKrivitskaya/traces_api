const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('tag', {
        id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
        name:{type:DataTypes.STRING(100)},        
        createdDate:{type:DataTypes.DATE, allowNull: false},
        updatedDate:{type:DataTypes.DATE},
        deleted:{type:DataTypes.BOOLEAN, defaultValue: 0},
        deletedDate:{type:DataTypes.DATE},
    },{
        createdAt: 'createdDate',
        updatedAt: 'updatedDate'
    });
}