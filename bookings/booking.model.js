const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('booking', {
        id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},        
        name:{type:DataTypes.STRING(100), allowNull: false},
        details:{type:DataTypes.TEXT},        
        entryDate:{type:DataTypes.DATE},
        exitDate:{type:DataTypes.DATE},       
        questsQuantity:{type:DataTypes.INTEGER},
        image:{type:DataTypes.BLOB},       
        reservationNumber:{type:DataTypes.STRING(100)},
        reservationUrl:{type:DataTypes.STRING(200)},
        createdDate:{type:DataTypes.DATE},
        updatedDate:{type:DataTypes.DATE}
    },{
        createdAt: 'createdDate',
        updatedAt: 'updatedDate'
    });
}