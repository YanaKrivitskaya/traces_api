const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('note_tag', {
        id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},        
        createdDate:{type:DataTypes.DATE},
        updatedDate:{type:DataTypes.DATE},       
    },{
        createdAt: 'createdDate',
        updatedAt: 'updatedDate'
    });
}