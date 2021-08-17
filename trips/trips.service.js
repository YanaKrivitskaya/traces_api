const db = require('../db');
const auth = require('../auth/auth.service');

module.exports = {
    getTrips,
    getTrip,
    createTrip,
    updateTrip,
    deleteTrip,
    updateTripUsers,
    getTripById,
    userOwnsTrip,
    getTripByIdWithDetails
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
            },
            {
                model: db.TripDay,
                as: "days",
                attributes: [
                    "id", 
                    "date",
                    "name", 
                    "description",
                    "dayNumber",
                    "image"
                ],
            }
        ]
    });
 
    return tripsResponse;
 }

 async function getTrip(tripId, accountId){
    const account = await auth.getAccountById(accountId);

    await getTripById(tripId);

    await userOwnsTrip(account, tripId);
 
    const tripResponse = await getTripByIdWithDetails(tripId);
 
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
 
    const tripResponse = await getTripByIdWithDetails(tripId);
 
    return tripResponse;
 }

 async function updateTrip(updTrip, accountId){
    const account = await auth.getAccountById(accountId);    

    const trip = await getTripById(updTrip.id);

    await userOwnsTrip(account, trip.id);

    await trip.update(updTrip);
 
    const tripResponse = await getTripByIdWithDetails(tripId);
 
    return tripResponse;
 }

 async function updateTripUsers(tripId, accountId, userIds){
    const account = await auth.getAccountById(accountId);    

    const trip = await getTripById(tripId);

    await userOwnsTrip(account, trip.id);

    const tripUsers = await trip.getUsers();
    for (const tripUser of tripUsers){
        if(!userIds.includes(tripUser.id)){
            await trip.removeUser(tripUser);
        }
    }

    for (const userId of userIds) {
        var user = await auth.getUserById(userId);      

        const userTrip = await user.getTrips({ where: {deleted: 0, id: tripId}});

        if(userTrip.length == 0){
            await trip.addUser(user);
        }
    }

    const tripResponse = await getTripByIdWithDetails(tripId);
 
    return tripResponse;
 }

 async function deleteTrip(tripId, accountId){
    const account = await auth.getAccountById(accountId);    

    const trip = await getTripById(tripId);

    await userOwnsTrip(account, trip.id);

    const tripUsers = await trip.getUsers();
    for (const tripUser of tripUsers){
        await trip.removeUser(tripUser);
    }    

    await db.Trip.destroy({where:{id: tripId}});
 
   return "Ok";
 }

 async function getTripById(tripId){
    const trip = await db.Trip.findByPk(tripId);
    if(!trip) throw 'Trip not found';
    return trip;
}

async function getTripByIdWithDetails(tripId){
    const tripResponse = await db.Trip.findByPk(tripId, {
        attributes: ["id", "createdBy", "name", "description", "coverImage", "startDate", "endDate"], 
        where: {deleted: 0},
        include:[
            {               
                model: db.User,
                as: "users",
                attributes: ["id", "accountId", "name"],
                through: {attributes: []},
            },
            {
                model: db.TripDay,               
                attributes: [
                    "id", 
                    "date",
                    "name", 
                    "description",
                    "dayNumber",
                    "image"
                ],
            }
        ]
    });
    return tripResponse;
}

 async function userOwnsTrip(account, tripId){
    const accounttrips = await account.getTrips({ where: {deleted: 0, id: tripId}});

    if(accounttrips.length == 0) throw "No permissions for this trip";
    return true;
}