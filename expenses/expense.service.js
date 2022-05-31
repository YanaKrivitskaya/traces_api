const db = require('../db');
const auth = require('../auth/auth.service');
const tripsService = require('../trips/trips.service');
const categoriesService = require('../categories/categories.service');

module.exports = {
    getTripExpenses,
    getExpense,
    createExpense,
    updateExpense,
    deleteExpense,    
    getExpenseById,
    getExpenseByIdResponse
}

async function getTripExpenses(accountId, tripId){
    const account = await auth.getAccountById(accountId);

    await tripsService.userOwnsTrip(account, tripId);

    const expenseResponse = await getTripExpensesResponse(tripId);
 
    return expenseResponse;
 }

 async function getExpense(expenseId, accountId){
    const account = await auth.getAccountById(accountId);

    /*const expense = await getExpenseById(expenseId);

    const trip = expense.getTrip();

    await userOwnsTrip(account, trip.id);*/
 
    const expenseResponse = await getExpenseByIdResponse(expenseId);
    return expenseResponse;
 }

async function createExpense(expense, tripId, categoryId, accountId){
    const account = await auth.getAccountById(accountId);

    await tripsService.userOwnsTrip(account, tripId);

    const expenseCategory = await categoriesService.getCategoryById(categoryId);

    const newExpense = await db.Expense.create(expense);

    const trip = await tripsService.getTripById(tripId);

    await newExpense.setTrip(trip);
    await newExpense.setExpenseCategory(expenseCategory);
 
    const expenseResponse = await getExpenseByIdResponse(newExpense.id);
 
    return expenseResponse;
 }

 async function updateExpense(updExpense, categoryId, accountId){
    const account = await auth.getAccountById(accountId);    

    const expense = await getExpenseById(updExpense.id);

    const trip = await expense.getTrip();

    await tripsService.userOwnsTrip(account, trip.id);

    if(categoryId != null){
        const expenseCategory = await categoriesService.getCategoryById(categoryId);
        await expense.setExpenseCategory(expenseCategory);
    }

    await expense.update(updExpense);
 
    const expenseResponse = await getExpenseByIdResponse(expense.id);
 
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
            "date", 
            "description",
            "amount", 
            "currency",
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
        });
     
        return expenseResponse;
}

async function getTripExpensesResponse(tripId){
    const expenseResponse = await db.Expense.findAll(
    {   attributes: [
        "id",        
        "date", 
        "description",       
        "amount", 
        "currency",
        "isPaid",
        "createdDate",
        "updatedDate"],        
        where: {tripId: tripId},
        include: [{
            model: db.Category,
                as: "expenseCategory",
                attributes: ["id", "name", "icon", "color"]                
        }]
    });
 
    return expenseResponse;
}