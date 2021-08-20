const db = require('../db');
const auth = require('../auth/auth.service');
const tripsService = require('../trips/trips.service');
const expenseService = require('../expenses/expense.service');

module.exports = {
    getTripBookings,
    getBooking,
    createBooking,
    updateBooking,
    deleteBooking
}

async function getTripBookings(accountId, tripId){
    const account = await auth.getAccountById(accountId);

    await tripsService.userOwnsTrip(account, tripId);

    const bookingResponse = await getTripBookingsResponse(tripId);
 
    return bookingResponse;
 }

 async function getBooking(bookingId, accountId){
    const account = await auth.getAccountById(accountId);

    const booking = await getBookingById(bookingId);

    const trip = booking.getTrip();

    await userOwnsTrip(account, trip.id);
 
    const bookingResponse = await db.Booking.findByPk(bookingId);
    return bookingResponse;
 }

async function createBooking(booking, expense, tripId, accountId){
    const account = await auth.getAccountById(accountId);

    await tripsService.userOwnsTrip(account, tripId);

    const newBooking = await db.Booking.create(booking);

    const trip = await tripsService.getTripById(tripId);

    await newBooking.setTrip(trip);   

    if(expense != null){
       const newExpense = await expenseService.createExpense(expense, tripId, accountId);
       await newBooking.setExpense(newExpense);
    }
 
    const bookingResponse = await getBookingByIdResponse(newBooking.id);
 
    return bookingResponse;
 }

 async function updateBooking(updBooking, accountId){
    const account = await auth.getAccountById(accountId);    

    const booking = await getBookingById(updBooking.id);

    const trip = booking.getTrip();

    await userOwnsTrip(account, trip.id);

    await booking.update(updBooking);
 
    const bookingResponse = await getTripBookingsResponse(trip.id);
 
    return bookingResponse;
 }

 async function deleteBooking(bookingId, accountId){
    const account = await auth.getAccountById(accountId);   
    
    const booking = await getBookingById(bookingId);

    const trip = booking.getTrip();

    await userOwnsTrip(account, trip.id);
    
    await db.Booking.destroy({where:{id: bookingId}});
 
   return "Ok";
 }

async function getBookingById(id){
    const booking = await db.Booking.findByPk(id);
    if(!booking) throw 'Booking not found';
    return booking;
}

async function getBookingByIdResponse(id){
    const booking = await db.Booking.findByPk(id, {   
        attributes: [
        "id", 
        "name", 
        "details", 
        "description",         
        "reservationDate",
        "reservationNumber",
        "reservationUrl",
        "entryDate",
        "exitdate",
        "guestsQuantity",
        "image",
        "createdDate",
        "updatedDate"
    ],
    include:[        
        {
         model: db.Expense,            
         attributes: [
             "id", 
             "name", 
             "date", 
             "description", 
             "category", 
             "amount", 
             "currency",
             "createdDate",
             "updatedDate"
         ],
     }
    ]
});
    
    return booking;
}

async function getTripBookingsResponse(tripId){
    const bookingResponse = await db.Booking.findAll(
        {   attributes: [
            "id", 
            "name", 
            "details", 
            "description",         
            "reservationDate",
            "reservationNumber",
            "reservationUrl",
            "entryDate",
            "exitdate",
            "guestsQuantity",
            "image",
            "createdDate",
            "updatedDate"
        ], 
        where: {tripId: tripId},
        include:[            
            {
             model: db.Expense,            
             attributes: [
                 "id", 
                 "name", 
                 "date", 
                 "description", 
                 "category", 
                 "amount", 
                 "currency",
                 "createdDate",
                 "updatedDate"
             ],
         }
        ]
    });
 
    return bookingResponse;
}