const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('user',{
            id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
            createdBy:{type: DataTypes.INTEGER, allowNull: false},
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
