const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('group',{
            id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},            
            name:{type:DataTypes.STRING(50), allowNull: false},            
            createdDate:{type:DataTypes.DATE, allowNull: false},
            updatedDate:{type:DataTypes.DATE}
        },
        {            
            createdAt: 'createdDate',
            updatedAt: 'updatedDate'
        }    
    );
}
