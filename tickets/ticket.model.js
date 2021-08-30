const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('ticket', {
        id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},        
        departureLocation:{type:DataTypes.STRING(100), allowNull: false},
        arrivalLocation:{type:DataTypes.STRING(100), allowNull: false},
        type:{type:DataTypes.STRING(50), allowNull: false},
        departureDatetime:{type:DataTypes.DATE},
        arrivalDatetime:{type:DataTypes.DATE},
        carrier:{type:DataTypes.STRING(100)},
        carrierNumber:{type:DataTypes.STRING(50)},
        quantity:{type:DataTypes.INTEGER},
        seats:{type:DataTypes.STRING(200)},
        details:{type:DataTypes.TEXT},
        reservationNumber:{type:DataTypes.STRING(100)},
        reservationUrl:{type:DataTypes.STRING(200)},
        createdDate:{type:DataTypes.DATE},
        updatedDate:{type:DataTypes.DATE}
    },{
        createdAt: 'createdDate',
        updatedAt: 'updatedDate'
    });
}