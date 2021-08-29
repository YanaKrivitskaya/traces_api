const db = require('../db');
const auth = require('../auth/auth.service');
const tripsService = require('../trips/trips.service');

module.exports = {
    getTripExpenses,
    getExpense,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseCategories,
    createExpenseCategory
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

async function createExpense(expense, tripId, categoryId, accountId){
    const account = await auth.getAccountById(accountId);

    await tripsService.userOwnsTrip(account, tripId);

    const expenseCategory = await getExpenseCategoryById(categoryId);

    const newExpense = await db.Expense.create(expense);

    const trip = await tripsService.getTripById(tripId);

    await newExpense.setTrip(trip);
    await newExpense.setCategory(expenseCategory);
 
    const expenseResponse = await getExpenseByIdResponse(newExpense.id);
 
    return expenseResponse;
 }

 async function updateExpense(updExpense, categoryId, accountId){
    const account = await auth.getAccountById(accountId);    

    const expense = await getExpenseById(updExpense.id);

    const trip = expense.getTrip();

    await userOwnsTrip(account, trip.id);

    if(categoryId != null){
        const expenseCategory = await getExpenseCategroyById(categoryId);
        await expense.setCategory(expenseCategory);
    }

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

 async function getExpenseCategories(accountId){
    const account = await auth.getAccountById(accountId);
    const user = await auth.getUserByAccountId(account.id);

    const categoriesResponse = db.ExpenseCategory.findAll(
        {
            where: {userId: user.id},
            attributes: ["id", "name"]
        }        
    );
    return categoriesResponse;
 }

 async function createExpenseCategory(category, accountId){    
    const user = await auth.getUserByAccountId(accountId);

    const newCategory = await db.ExpenseCategory.create(category);   

    await newCategory.setUser(user);
     
    const categoriesResponse = db.ExpenseCategory.findByPk(newCategory.id, 
        {           
            attributes: ["id", "name"]
        }        
    );
    return categoriesResponse;
 }

 async function getExpenseById(id){
    const expense = await db.Expense.findByPk(id);
    if(!expense) throw 'Expense not found';
    return expense;
}

async function getExpenseCategoryById(id){
    const expenseCategory = await db.ExpenseCategory.findByPk(id);
    if(!expenseCategory) throw 'Expense category not found';
    return expenseCategory;
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
                    model: db.ExpenseCategory,
                    as: "category",
                    attributes: ["id", "name"]
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
            model: db.ExpenseCategory,
                as: "category",
                attributes: ["id", "name"]                
        }]
    });
 
    return expenseResponse;
}