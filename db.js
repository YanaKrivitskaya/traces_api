//const { Sequelize } = require('sequelize');
const Sequelize = require("sequelize").Sequelize

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

    //init Account model
    db.Account = require('./auth/account.model')(sequelize);
    db.User = require('./auth/user.model')(sequelize);
    db.Group = require('./profile/group.model')(sequelize);
    db.UserGroup = require('./profile/user-group.model')(sequelize);
    db.RefreshToken = require('./auth/refreshToken.model')(sequelize);
    db.Note = require('./notes/note.model')(sequelize);
    db.Tag = require('./tags/tag.model')(sequelize);
    db.NoteTag = require('./notes/note-tag.model')(sequelize);
    db.Visa = require('./visas/visa.model')(sequelize);
    db.VisaEntry = require('./visas/visa-entry.model')(sequelize);
    db.Trip = require('./trips/trip.model')(sequelize);
    db.UserTrip = require('./trips/user-trip.model')(sequelize);
    db.Expense = require('./expenses/expense.model')(sequelize);
    db.Ticket = require('./tickets/ticket.model')(sequelize);
    db.Booking = require('./bookings/booking.model')(sequelize);

    //relations
    db.Account.hasMany(db.RefreshToken, {onDelete: 'CASCADE'});
    db.RefreshToken.belongsTo(db.Account);

    db.Account.hasOne(db.User);
    db.User.belongsTo(db.Account);

    db.Account.hasMany(db.Group, {foreignKey: 'ownerAccountId'});
    db.Group.belongsTo(db.Account, {foreignKey: 'ownerAccountId'});

    db.Group.belongsToMany(db.User, {through: 'user_group', as: 'users', foreignKey: 'groupId'});
    db.User.belongsToMany(db.Group, {through: 'user_group', as: 'groups', foreignKey: 'userId'});

    db.User.hasMany(db.Note, {onDelete: 'CASCADE'});
    db.Note.belongsTo(db.User);

    db.User.hasMany(db.Tag, {onDelete: 'CASCADE'});
    db.Tag.belongsTo(db.User);

    db.Note.belongsToMany(db.Tag, {through: 'note_tag', as: 'tags', foreignKey: 'noteId' });
    db.Tag.belongsToMany(db.Note, {through: 'note_tag', as: 'notes', foreignKey: 'tagId'});

    db.User.hasMany(db.Visa);
    db.Visa.belongsTo(db.User);

    db.Account.hasMany(db.Visa, {foreignKey: 'createdBy'});
    db.Visa.belongsTo(db.Account, {foreignKey: 'createdBy'});

    db.Visa.hasMany(db.VisaEntry);
    db.VisaEntry.belongsTo(db.Visa);

    db.Account.hasMany(db.Trip, {foreignKey: 'createdBy'});
    db.Trip.belongsTo(db.Account, {foreignKey: 'createdBy'});

    db.Trip.belongsToMany(db.User, {through: 'user_trip', as: 'users', foreignKey: 'tripId'});
    db.User.belongsToMany(db.Trip, {through: 'user_trip', as: 'trips', foreignKey: 'userId'});

    db.Trip.hasMany(db.Expense);
    db.Expense.belongsTo(db.Trip);

    db.Trip.hasMany(db.Ticket);
    db.Ticket.belongsTo(db.Trip);

    db.User.hasMany(db.Ticket);
    db.Ticket.belongsTo(db.User);

    db.Expense.hasOne(db.Ticket);
    db.Ticket.belongsTo(db.Expense);

    db.Trip.hasMany(db.Booking);
    db.Booking.belongsTo(db.Trip);

    db.Expense.hasOne(db.Booking);
    db.Booking.belongsTo(db.Expense);

    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}