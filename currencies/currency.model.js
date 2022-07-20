const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('currency',{
            id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},            
            code:{type:DataTypes.STRING(3), allowNull: false},      
            name:{type:DataTypes.STRING(100)},        
            createdDate:{type:DataTypes.DATE, allowNull: false},
            updatedDate:{type:DataTypes.DATE}
        },
        {            
            createdAt: 'createdDate',
            updatedAt: 'updatedDate'
        }    
    );
}