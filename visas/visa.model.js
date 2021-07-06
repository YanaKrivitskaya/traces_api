const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('visa', {
        id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
        country:{type:DataTypes.STRING(100), allowNull: false},
        type:{type:DataTypes.STRING(50), allowNull: false},
        entriesType:{type:DataTypes.STRING(50), allowNull: false},
        durationOfStay:{type:DataTypes.INTEGER},
        startDate:{type:DataTypes.DATE, allowNull: false},
        endDate:{type:DataTypes.DATE, allowNull: false},
        createdDate:{type:DataTypes.DATE, allowNull: false},
        updatedDate:{type:DataTypes.DATE},
        deleted:{type:DataTypes.BOOLEAN, defaultValue: 0},
        deletedDate:{type:DataTypes.DATE},
    },{
        createdAt: 'createdDate',
        updatedAt: 'updatedDate'
    });
}