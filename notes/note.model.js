const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('note', {
        id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
        title:{type:DataTypes.STRING(100)},
        content:{type:DataTypes.TEXT},
        createdDate:{type:DataTypes.DATE, allowNull: false},
        updatedDate:{type:DataTypes.DATE},
        deleted:{type:DataTypes.BOOLEAN, defaultValue: 0},
        deletedDate:{type:DataTypes.DATE},
    },{
        createdAt: 'createdDate',
        updatedAt: 'updatedDate'
    });
}