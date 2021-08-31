const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('activity', {
        id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},        
        name:{type:DataTypes.STRING(100), allowNull: false},
        location:{type:DataTypes.STRING(100)}, 
        description:{type:DataTypes.TEXT},
        date:{type:DataTypes.DATE},
        image:{type:DataTypes.BLOB},
        isPlanned:{type:DataTypes.BOOLEAN},
        isCompleted:{type:DataTypes.BOOLEAN},
        createdDate:{type:DataTypes.DATE},
        updatedDate:{type:DataTypes.DATE}
    },{
        createdAt: 'createdDate',
        updatedAt: 'updatedDate'
    });
}