const db = require('../db');
const auth = require('../auth/auth.service');
const tripsService = require('../trips/trips.service');
const expenseService = require('../expenses/expense.service');

module.exports = {
    getTripTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket
}

async function getTripTickets(accountId, tripId){
    const account = await auth.getAccountById(accountId);

    await tripsService.userOwnsTrip(account, tripId);

    const ticketResponse = await getTripTicketsResponse(tripId);
 
    return ticketResponse;
 }

 async function getTicket(ticketId, accountId){
    const account = await auth.getAccountById(accountId);

    const ticket = await getTicketById(ticketId);

    const trip = ticket.getTrip();

    await userOwnsTrip(account, trip.id);
 
    const ticketResponse = await db.Ticket.findByPk(ticketId);
    return ticketResponse;
 }

async function createTicket(ticket, expense, tripId, userId, accountId){
    const account = await auth.getAccountById(accountId);

    await tripsService.userOwnsTrip(account, tripId);

    const newTicket = await db.Ticket.create(ticket);

    const trip = await tripsService.getTripById(tripId);

    await newTicket.setTrip(trip);

    if(userId != null){
        const user = await auth.getUserById(userId);
        await newTicket.setUser(user);
    }

    if(expense != null){
       const newExpense = await expenseService.createExpense(expense, tripId, accountId);
       await newTicket.setExpense(newExpense);
    }
 
    const ticketResponse = await getTicketByIdResponse(newTicket.id);
 
    return ticketResponse;
 }

 async function updateTicket(updTicket, accountId){
    const account = await auth.getAccountById(accountId);    

    const ticket = await getTicketById(updTicket.id);

    const trip = ticket.getTrip();

    await userOwnsTrip(account, trip.id);

    await ticket.update(updTicket);
 
    const ticketResponse = await getTripTicketsResponse(trip.id);
 
    return ticketResponse;
 }

 async function deleteTicket(ticketId, accountId){
    const account = await auth.getAccountById(accountId);   
    
    const ticket = await getTicketById(ticketId);

    const trip = ticket.getTrip();

    await userOwnsTrip(account, trip.id);
    
    await db.Ticket.destroy({where:{id: ticketId}});
 
   return "Ok";
 }

async function getTicketById(id){
    const ticket = await db.Ticket.findByPk(id);
    if(!ticket) throw 'Ticket not found';
    return ticket;
}

async function getTicketByIdResponse(id){
    const ticket = await db.Ticket.findByPk(id, {   
        attributes: [
        "id", 
        "departureLocation", 
        "arrivalLocation", 
        "type", 
        "departureDatetime", 
        "arrivalDatetime", 
        "carrier", 
        "carrierNumber", 
        "quantity",
        "seats",
        "reservationDate",
        "reservationNumber",
        "reservationUrl",
        "createdDate",
        "updatedDate"
    ],
    include:[
        {
         model: db.User,
         attributes: ["id", "accountId", "name"],
        },
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
             "isPaid",
             "createdDate",
             "updatedDate"
         ],
     }
    ]
});
    
    return ticket;
}

async function getTripTicketsResponse(tripId){
    const ticketResponse = await db.Ticket.findAll(
        {   attributes: [
            "id", 
            "departureLocation", 
            "arrivalLocation", 
            "type", 
            "departureDatetime", 
            "arrivalDatetime", 
            "carrier", 
            "carrierNumber", 
            "quantity",
            "seats",
            "reservationDate",
            "reservationNumber",
            "reservationUrl",
            "createdDate",
            "updatedDate"
        ], 
        where: {tripId: tripId},
        include:[
            {
             model: db.User,
             attributes: ["id", "accountId", "name"],
            },
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
 
    return ticketResponse;
}