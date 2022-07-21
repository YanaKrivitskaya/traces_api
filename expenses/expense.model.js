const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('expense', {
        id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
        date:{type:DataTypes.DATE, allowNull: false},        
        description:{type:DataTypes.TEXT},
        amount:{type:DataTypes.DECIMAL, allowNull: false},
        currency:{type:DataTypes.STRING(3)},        
        amountDTC:{type:DataTypes.DECIMAL},
        isPaid:{type:DataTypes.BOOLEAN},
        createdDate:{type:DataTypes.DATE},
        updatedDate:{type:DataTypes.DATE}
    },{
        createdAt: 'createdDate',
        updatedAt: 'updatedDate'
    });
}