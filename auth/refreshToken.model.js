const { DataTypes } = require('sequelize');

module.exports = (sequilize, type) => {
    return sequilize.define('user_token', {
        id:{type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
        //UserId:{type: DataTypes.INTEGER}
        token:{type:DataTypes.STRING(250), allowNull: false},
        createdDate:{type:DataTypes.DATE, allowNull: false},
        expirationDate:{type:DataTypes.DATE, allowNull: false},
        revokedDate:{type:DataTypes.DATE},
        replacedByToken: {type:DataTypes.STRING(250)},
        isExpired: {
            type: DataTypes.VIRTUAL,
            get() { return Date.now() >= this.ExpirationDate; }
        },
        isRevoked: {
            type: DataTypes.VIRTUAL,
            get() { return this.RevokedDate != null; }
        },
        isActive: {
            type: DataTypes.VIRTUAL,
            get() { return !this.isRevoked && !this.isExpired; }
        }
    },{
        createdAt: 'createdDate',
        updatedAt: false
    });
}