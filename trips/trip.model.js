const { DataTypes, MEDIUMINT } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('trip', {
        id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
        name:{type:DataTypes.STRING(50), allowNull: false},
        description:{type:DataTypes.TEXT},
        coverImage:{type:DataTypes.BLOB()},
        startDate:{type:DataTypes.DATE, allowNull: false},
        endDate:{type:DataTypes.DATE},
        createdDate:{type:DataTypes.DATE},
        updatedDate:{type:DataTypes.DATE},
        deleted:{type:DataTypes.BOOLEAN, defaultValue: 0},
        deletedDate:{type:DataTypes.DATE},
    },{
        createdAt: 'createdDate',
        updatedAt: 'updatedDate'
    });
}