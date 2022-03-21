const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('account',{
            id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
            email:{type:DataTypes.STRING(100), allowNull: false},
            password:{type:DataTypes.STRING(50), allowNull: true},
            emailVerified:{type:DataTypes.BOOLEAN, defaultValue: 0},
            createdDate:{type:DataTypes.DATE, allowNull: false},
            updatedDate:{type:DataTypes.DATE},
            disabled:{type:DataTypes.BOOLEAN, defaultValue: 0},
            disabledDate:{type:DataTypes.DATE},
        },
        {
            defaultScope: {
                // exclude hash by default
                attributes: { exclude: ['password'] }
            },
            scopes: {
                // include hash with this scope
                withPass: { attributes: {}, }
            },
            createdAt: 'createdDate',
            updatedAt: 'updatedDate'
        }    
    );
}
