const db = require('../db');
const auth = require('../auth/auth.service');

module.exports = {
    getTrips,
    getTrip,
    createTrip
    /*,
    updateTrip,    
    deleteTrip*/
}

async function getTrips(accountId){
    const account = await auth.getAccountById(accountId);
 
    const tripsResponse = await account.getTrips({
        attributes: ["id", "createdBy", "name", "description", "coverImage", "startDate", "endDate"], 
        where: {deleted: 0},
        include:[
            {
                model: db.User,
                as: "users",
                attributes: ["id", "accountId", "name"],
                through: {attributes: []},
            }
        ]
    });
 
    return tripsResponse;
 }

 async function getTrip(tripId, accountId){
    const account = await auth.getAccountById(accountId);

    await getTripById(tripId);

    await userOwnsTrip(account, tripId);
 
    const tripResponse = await db.Trip.findByPk(tripId, {
        attributes: ["id", "createdBy", "name", "description", "coverImage", "startDate", "endDate"], 
        where: {deleted: 0},
        include:[
            {               
                model: db.User,
                as: "users",
                attributes: ["id", "accountId", "name"],
                through: {attributes: []},
            }
        ]
    });
 
    return tripResponse;
 }

 async function createTrip(trip, accountId){
    const account = await auth.getAccountById(accountId);
    const user = await auth.getUserByAccountId(accountId);

    const newTrip = await db.Trip.create(trip);

    await newTrip.setAccount(account);
    await newTrip.addUser(user);

    const userTrip = await db.UserTrip.findOne({where: {tripId: newTrip.id, userid: user.id}});
    userTrip.isOwner = true;
    await userTrip.save();
 
    const tripResponse = await getTripById(newTrip.id);
 
    return tripResponse;
 }

 async function getTripById(tripId){
    const trip = await db.Trip.findByPk(tripId);
    if(!trip) throw 'Trip not found';
    return trip;
}


 async function userOwnsTrip(account, tripId){
    const accounttrips = await account.getTrips({ where: {deleted: 0, id: tripId}});

    if(accounttrips.length == 0) throw "No permissions for this trip";
    return true;
}