const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('visa_entry', {
        id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
        entryCountry:{type:DataTypes.STRING(100), allowNull: false},
        entryCity:{type:DataTypes.STRING(100)},
        entryTransport:{type:DataTypes.STRING(100), allowNull: false},
        entryDate:{type:DataTypes.DATE, allowNull: false},
        hasExit:{type:DataTypes.BOOLEAN, defaultValue: 0},
        exitCountry:{type:DataTypes.STRING(100)},
        exitCity:{type:DataTypes.STRING(100)},
        exitTransport:{type:DataTypes.STRING(100)},
        exitDate:{type:DataTypes.DATE},
        createdDate:{type:DataTypes.DATE, allowNull: false},
        updatedDate:{type:DataTypes.DATE}
    },{
        createdAt: 'createdDate',
        updatedAt: 'updatedDate'
    });
}