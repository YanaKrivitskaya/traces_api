const db = require('../db');
const auth = require('../auth/auth.service');
const fs = require('fs');
const { Op, where } = require("sequelize");
var moment = require('moment'); // require
moment().format(); 

module.exports = {
    getTrips,
    getTrip,
    createTrip,
    updateTrip,
    deleteTrip,
    updateTripUsers,
    getTripById,
    userOwnsTrip,    
    updateTripImage,
    getTripDay,
    getTripsList,
    getCurrentTrip
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

 async function getCurrentTrip(accountId){
    const account = await auth.getAccountById(accountId);

    var today = new Date();
    var date = moment(today);

    var tripsResponse = await db.Trip.findOne({
        attributes: ["id", "createdBy", "name", "description", "coverImage", "startDate", "endDate"], 
        where: {
            [Op.and]:[
                {
                    startDate: {
                        [Op.lt]: date                        
                    },
                    endDate: {                        
                        [Op.gt]: date
                    },
                    createdBy: accountId
                }
               ]
           },
        include:[
            {
                model: db.User,
                as: "users",
                attributes: ["id", "accountId", "name"],
                through: {attributes: []},
            }
        ]  
    });

    var tripDay = null;
    
    if (tripsResponse == null) {
        tripsResponse = await db.Trip.findOne({
            order: [['startDate', 'ASC']],
            attributes: ["id", "createdBy", "name", "description", "coverImage", "startDate", "endDate"], 
            where: {
                [Op.and]:[
                    {
                        startDate: {
                            [Op.gt]: date                        
                        },
                        createdBy: accountId
                    }
                   ]
               },
            include:[
                {
                    model: db.User,
                    as: "users",
                    attributes: ["id", "accountId", "name"],
                    through: {attributes: []},
                }
            ]  
        });

        if(tripsResponse == null) {return {tripsResponse, tripDay};}
    }

    tripDay = await getTripDay(tripsResponse.id, date, accountId);
          
    return {tripsResponse, tripDay};
 }

 async function getTripsList(accountId){
    const account = await auth.getAccountById(accountId);
 
    const tripsResponse = await account.getTrips({
        attributes: ["id", "createdBy", "name", "startDate", "createdDate"], 
        where: {deleted: 0}/*,
        include:[
            {
                model: db.User,
                as: "users",
                attributes: ["id", "accountId", "name"],
                through: {attributes: []},
            }
        ]*/
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
 
    const tripResponse = await getTripByIdWithDetails(newTrip.id);
 
    return tripResponse;
 }

 async function updateTrip(updTrip, accountId){
    const account = await auth.getAccountById(accountId);    

    const trip = await getTripById(updTrip.id);

    updTrip.coverImage = trip.coverImage;

    await userOwnsTrip(account, trip.id);

    await trip.update(updTrip);
 
    const tripResponse = await getTripByIdWithDetails(trip.id);
 
    return tripResponse;
 }

 async function updateTripImage(tripId, image, accountId){
    const account = await auth.getAccountById(accountId);    

    const trip = await getTripById(tripId);

    await userOwnsTrip(account, trip.id);

    trip.coverImage = image.buffer;

    await trip.save();
 
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

    await userOwnsTrip(account, tripId);

    /*const tripUsers = await trip.getUsers();
    for (const tripUser of tripUsers){
        await trip.removeUser(tripUser);
    }*/

    await db.Trip.update({ 
        deleted: 1,
        deletedDate: Date.now()
     }, {
        where: {
          id: tripId
        }
      });

    //await db.Trip.destroy({where:{id: tripId}});
 
   return "Ok";
 }

 async function getTripByIdWithDetails(tripId){
    var tripResponse = await getTripByIdBasic(tripId); 

    var res = tripResponse.get({plain: true});    

    res.bookings = await getTripBookingsBasicInfo(tripId);
    res.expenses = await getTripExpensesBasicInfo(tripId);
    res.tickets = await getTripTicketsBasicInfo(tripId);
    res.activities = await getTripActivitiesBasicInfo(tripId);
    res.notes = await getTripNotesBasicInfo(tripId);

    return res ;
 }

 async function getTripDay(tripId, date, accountId){
    const account = await auth.getAccountById(accountId);    

    const trip = await getTripById(tripId);

    await userOwnsTrip(account, trip.id);

    var dateFrom = moment(date);
    var dateTo = moment(date).add(1, 'd');

    const activities = await trip.getActivities({ where: {date: {
        [Op.between]: [dateFrom, dateTo],
        }},
        attributes: [
            "id", 
            "expenseId",
            "name",
            "location",
            "description",         
            "date",
            "image",        
            "isPlanned",
            "isCompleted",        
            "createdDate",
            "updatedDate"
    ],
    include:[
        {
            model: db.Category,
            as: "activityCategory",
            attributes: ["id", "name"]
        }
    ]
});

    const bookings = await trip.getBookings({
        where: {
           [Op.or]:{
               [Op.or]:[
                {entryDate: {
                    [Op.between]: [dateFrom, dateTo],
                }},
                {exitDate: {
                    [Op.between]: [dateFrom, dateTo],
                }}
               ],
               [Op.and]:[
                {
                    entryDate: {
                        [Op.lt]: dateTo                        
                    },
                    exitDate: {                        
                        [Op.gt]: dateFrom
                    }
                }
               ]
           }
          },
          attributes: [
            "id", 
            "expenseId",
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
        ]
    });

    const tickets = await trip.getTickets({
        where:{
            [Op.or]:{
                [Op.or]:[
                 {departureDatetime: {
                     [Op.between]: [dateFrom, dateTo],
                 }},
                 {arrivalDatetime: {
                     [Op.between]: [dateFrom, dateTo],
                 }}
                ],
                [Op.and]:[
                 {
                    departureDatetime: {
                         [Op.lt]: dateTo                        
                     },
                    arrivalDatetime: {                        
                         [Op.gt]: dateFrom
                     }
                 }
                ]
            },
        },
        attributes: [
            "id", 
            "expenseId",
            "departureLocation", 
            "arrivalLocation", 
            "type", 
            "departureDatetime", 
            "arrivalDatetime", 
            "carrier", 
            "carrierNumber", 
            "quantity",
            "seats",
            "details",
            "reservationNumber",
            "reservationUrl",
            "createdDate",
            "updatedDate"
        ] 
    }
    );

    const expenses = trip.getExpenses({
        where:{date: {
            [Op.between]: [dateFrom, dateTo],
        }},
        attributes: [
            "id",                     
            "date", 
            "description",                    
            "amount", 
            "currency",
            "amountUSD",
            "amountDTC",
            "isPaid",
            "createdDate",
            "updatedDate"
        ]
    });
   
    return {
        "activities": activities.length > 0 ? activities : null,
        "tickets": tickets.length > 0 ? tickets : null,
        "bookings" : bookings.length > 0 ? bookings : null,
        "expenses": expenses.length > 0 ? expenses : null,
        "tripId": tripId
    };
 }

 async function getTripById(tripId){
    const trip = await db.Trip.findByPk(tripId);
    if(!trip) throw 'Trip not found';
    return trip;
}

async function getTripByIdBasic(tripId){
    const tripResponse = await db.Trip.findByPk(tripId, {
        attributes: ["id", "createdBy", "name", "description", "coverImage", "startDate", "endDate", "defaultCurrency"], 
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

async function getTripNotesBasicInfo(tripId){
    const notesResponse = await db.Note.findAll(
        {  attributes: [
            "id",
            "userId",
            "title",
            "content",
            "image",
            "createdDate",
            "updatedDate"
        ],                 
        include: [
            {
                model: db.Tag,
                attributes: ["id", "name"],
                as: "tags",
                through: {attributes: []}
            }
        ],
        where: {[Op.and]:[
            {
                tripId: tripId,
                deleted: 0
            }
           ]}        
    });
 
    return notesResponse;
}

async function getTripActivitiesBasicInfo(tripId){
    const activityResponse = await db.Activity.findAll(
        {   attributes: [
            "id", 
            "name",                          
            "date",
            "image",        
            "isPlanned",
            "isCompleted",        
            "createdDate",
            "updatedDate"
        ],
        include: [
            {
                model: db.Category,
                as: "activityCategory",
                attributes: ["id", "name", "icon", "color"]
            }
        ],
        where: {tripId: tripId}        
    });
 
    return activityResponse;
}

async function getTripTicketsBasicInfo(tripId){
    const ticketResponse = await db.Ticket.findAll(
        {   attributes: [
                "id",
                "type", 
                "departureDatetime", 
                "arrivalDatetime"
        ], 
        where: {tripId: tripId}
    });
 
    return ticketResponse;
}

async function getTripExpensesBasicInfo(tripId){
    const expenseResponse = await db.Expense.findAll(
    {   attributes: [
        "id", 
        "date", 
        "description",
        "amount", 
        "currency",        
        "amountDTC",
        "isPaid",
        "createdDate",
        "updatedDate"],
        include: [
            {
                model: db.Category,
                as: "expenseCategory",
                attributes: ["id", "name", "icon", "color"]
            }
        ],       
        where: {tripId: tripId}
    });
 
    return expenseResponse;
}

async function getTripBookingsBasicInfo(tripId){
    const bookingResponse = await db.Booking.findAll(
        {   attributes: [
                "id",                   
                "entryDate",
                "exitDate"
        ], 
        where: {tripId: tripId}
    });
 
    return bookingResponse;
}

 async function userOwnsTrip(account, tripId){
    const accounttrips = await account.getTrips({ where: {deleted: 0, id: tripId}});

    if(accounttrips.length == 0) throw "No permissions for this trip";
    return true;
}