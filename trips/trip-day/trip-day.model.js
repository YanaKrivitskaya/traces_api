const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('trip_day', {
        id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
        date:{type:DataTypes.DATE, allowNull: false},
        name:{type:DataTypes.STRING(50), allowNull: false},
        description:{type:DataTypes.TEXT},
        image:{type:DataTypes.BLOB},
        dayNumber:{type: DataTypes.INTEGER},        
        createdDate:{type:DataTypes.DATE},
        updatedDate:{type:DataTypes.DATE}        
    },{
        createdAt: 'createdDate',
        updatedAt: 'updatedDate'
    });
}