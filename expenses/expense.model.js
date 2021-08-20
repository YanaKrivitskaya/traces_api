const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('expense', {
        id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
        date:{type:DataTypes.DATE, allowNull: false},
        name:{type:DataTypes.STRING(100)},
        category:{type:DataTypes.STRING(50)},
        description:{type:DataTypes.TEXT},
        amount:{type:DataTypes.DECIMAL, allowNull: false},
        currency:{type:DataTypes.STRING(3)},
        createdDate:{type:DataTypes.DATE},
        updatedDate:{type:DataTypes.DATE}
    },{
        createdAt: 'createdDate',
        updatedAt: 'updatedDate'
    });
}