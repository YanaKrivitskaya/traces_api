const { DataTypes } = require('sequelize');

module.exports = (sequelize, type) => {
    return sequelize.define('otp',{
            id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},            
            isVerified:{type:DataTypes.BOOLEAN, defaultValue: 0},
            otp:{type:DataTypes.STRING(50), allowNull: false},  
            expirationDate:{type:DataTypes.DATE, allowNull: false},          
            createdDate:{type:DataTypes.DATE, allowNull: false},
            updatedDate:{type:DataTypes.DATE},
            isExpired: {
                type: DataTypes.VIRTUAL,
                get() { return Date.now() >= this.expirationDate; }
            },
        },
        {            
            createdAt: 'createdDate',
            updatedAt: 'updatedDate'
        }, {
			tableName: 'otp'
		}    
    );
}