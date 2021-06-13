const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize(){
    const sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {            
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            dialect: "mysql"
        }
    );

    //init User model
    db.User = require('./auth/user.model')(sequelize);
    db.RefreshToken = require('./auth/refreshToken.model')(sequelize);

    //relations
    db.User.hasMany(db.RefreshToken, {onDelete: 'CASCADE'});
    db.RefreshToken.belongsTo(db.User);

    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}