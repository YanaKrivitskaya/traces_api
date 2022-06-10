const db = require('../db');
const auth = require('../auth/auth.service');
const tripsService = require('../trips/trips.service');
const expenseService = require('../expenses/expense.service');
const categoriesService = require('../categories/categories.service');

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

    const trip = await booking.getTrip();

    await tripsService.userOwnsTrip(account, trip.id);
 
    const bookingResponse = await getBookingByIdResponse(bookingId);
    return bookingResponse;
 }

async function createBooking(booking, expense, tripId, accountId){
    const account = await auth.getAccountById(accountId);

    await tripsService.userOwnsTrip(account, tripId);

    const newBooking = await db.Booking.create(booking);

    const trip = await tripsService.getTripById(tripId);

    await newBooking.setTrip(trip);   

    if(expense != null){
        var category = expense.category;
        if(category != null){
            category = await categoriesService.getCategoryByName(expense.category.name);
            if(category == null){
                category = await categoriesService.createCategory(expense.category, accountId)
            }
        }
        const newExpense = await expenseService.createExpense(expense, tripId, category.id, accountId);
        await newBooking.setExpense(newExpense);
    }
 
    const bookingResponse = await getBookingByIdResponse(newBooking.id);
 
    return bookingResponse;
 }

 async function updateBooking(updBooking, expense, tripId, accountId){
    const account = await auth.getAccountById(accountId);    

    const booking = await getBookingById(updBooking.id);

    const trip = await booking.getTrip();

    await tripsService.userOwnsTrip(account, trip.id);

    await booking.update(updBooking);

    if(expense != null){
        var category = expense.category;
        if(category != null){
            category = await categoriesService.getCategoryByName(expense.category.name);
            if(category == null){
                category = await categoriesService.createCategory(expense.category, accountId)
            }
        }
        if(expense == null){
            const newExpense = await expenseService.createExpense(ticketExpense, tripId, category.id, accountId);
            await booking.setExpense(newExpense);
        }else{
            await expenseService.updateExpense(expense, category.id, accountId);
        }
    }
 
    const bookingResponse = await getBookingByIdResponse(booking.id);
 
    return bookingResponse;
 }

 async function deleteBooking(bookingId, accountId){
    const account = await auth.getAccountById(accountId);   
    
    const booking = await getBookingById(bookingId);

    const trip = await booking.getTrip();

    await tripsService.userOwnsTrip(account, trip.id);
    
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
        "location",
        "details",        
        "reservationNumber",
        "reservationUrl",
        "entryDate",
        "exitDate",
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
             "date", 
             "isPaid",
             "description",            
             "amount", 
             "currency"
         ],
         include: [
            {
                model: db.Category,
                as: "expenseCategory",
                attributes: ["id", "name"]
            }
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
            "location",
            "details",
            "reservationNumber",
            "reservationUrl",
            "entryDate",
            "exitDate",
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
                 "date", 
                 "description",                
                 "amount", 
                 "currency",
                 "isPaid"
             ],
             include: [
                {
                    model: db.Category,
                    as: "expenseCategory",
                    attributes: ["id", "name"]
                }
            ],
         }
        ]
    });
 
    return bookingResponse;
}