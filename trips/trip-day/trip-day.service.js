const db = require('../../db');
const auth = require('../../auth/auth.service');
const tripsService = require('../trips.service');

module.exports = {
    createTripDay
}

async function createTripDay(tripDay, tripId, accountId){
    const account = await auth.getAccountById(accountId);
    await tripsService.userOwnsTrip(account, tripId);

    const trip = await tripsService.getTripById(tripId);

    const newTripDay = await db.TripDay.create(tripDay);

    await newTripDay.setTrip(trip);
 
    const tripResponse = await tripsService.getTripByIdWithDetails(tripId);
 
    return tripResponse;
 }

