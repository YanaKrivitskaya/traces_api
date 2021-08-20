const db = require('../db');
const auth = require('../auth/auth.service');
const tripsService = require('../trips/trips.service');

module.exports = {
    getTripExpenses,
    getExpense,
    createExpense,
    updateExpense,
    deleteExpense
}

async function getTripExpenses(accountId, tripId){
    const account = await auth.getAccountById(accountId);

    await tripsService.userOwnsTrip(account, tripId);

    const expenseResponse = await getTripExpensesResponse(tripId);
 
    return expenseResponse;
 }

 async function getExpense(expenseId, accountId){
    const account = await auth.getAccountById(accountId);

    const expense = await getExpenseById(expenseId);

    const trip = expense.getTrip();

    await userOwnsTrip(account, trip.id);
 
    const expenseResponse = await db.Expense.findByPk(expenseId);
    return expenseResponse;
 }

async function createExpense(expense, tripId, accountId){
    const account = await auth.getAccountById(accountId);

    await tripsService.userOwnsTrip(account, tripId);

    const newExpense = await db.Expense.create(expense);

    const trip = await tripsService.getTripById(tripId);

    await newExpense.setTrip(trip);    
 
    const expenseResponse = await getExpenseByIdResponse(newExpense.id);
 
    return expenseResponse;
 }

 async function updateExpense(updExpense, accountId){
    const account = await auth.getAccountById(accountId);    

    const expense = await getExpenseById(updExpense.id);

    const trip = expense.getTrip();

    await userOwnsTrip(account, trip.id);

    await expense.update(updExpense);
 
    const expenseResponse = await getTripExpensesResponse(trip.id);
 
    return expenseResponse;
 }

 async function deleteExpense(expenseId, accountId){
    const account = await auth.getAccountById(accountId);   
    
    const expense = await getExpenseById(expenseId);

    const trip = expense.getTrip();

    await userOwnsTrip(account, trip.id);
    
    await db.Expense.destroy({where:{id: expenseId}});
 
   return "Ok";
 }

 async function getExpenseById(id){
    const expense = await db.Expense.findByPk(id);
    if(!expense) throw 'Expense not found';
    return expense;
}

async function getExpenseByIdResponse(id){
    const expenseResponse = await db.Expense.findByPk(id,
        {   attributes: [
            "id", 
            "name", 
            "date", 
            "description", 
            "category", 
            "amount", 
            "currency",
            "createdDate",
            "updatedDate"],           
        });
     
        return expenseResponse;
}

async function getTripExpensesResponse(tripId){
    const expenseResponse = await db.Expense.findAll(
    {   attributes: [
        "id", 
        "name", 
        "date", 
        "description", 
        "category", 
        "amount", 
        "currency",
        "createdDate",
        "updatedDate"], 
        where: {tripId: tripId}
    });
 
    return expenseResponse;
}