const db = require('../db');
const auth = require('../auth/auth.service');
const tripsService = require('../trips/trips.service');
const expenseService = require('../expenses/expense.service');

module.exports = {
    getTripActivities,
    getActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    getActivityCategories,
    createActivityCategory
}

async function getTripActivities(accountId, tripId){
    const account = await auth.getAccountById(accountId);

    await tripsService.userOwnsTrip(account, tripId);

    const activityResponse = await getTripActivitiesResponse(tripId);
 
    return activityResponse;
 }

 async function getActivity(activityId, accountId){
    const account = await auth.getAccountById(accountId);

    const activity = await getActivityById(activityId);

    const trip = activity.getTrip();

    await userOwnsTrip(account, trip.id);
 
    const activityResponse = await db.Activity.findByPk(activityId);
    return activityResponse;
 }

async function createActivity(activity, expense, tripId, categoryId, accountId){
    const account = await auth.getAccountById(accountId);

    await tripsService.userOwnsTrip(account, tripId);

    const newActivity = await db.Activity.create(activity);

    if(categoryId != null){
        const category = await getActivityCategoryById(categoryId);
        await newActivity.setCategory(category);
    }

    const trip = await tripsService.getTripById(tripId);

    await newActivity.setTrip(trip);   

    if(expense != null){
        var category = expense.category;
        if(category != null){
            category = await expenseService.getExpenseCategoryByName(expense.category.name);
            if(category == null){
                category = await expenseService.createExpenseCategory(expense.category, accountId)
            }
        }
       const newExpense = await expenseService.createExpense(expense, tripId, category.id, accountId);
       await newActivity.setExpense(newExpense);
    }
 
    const activityResponse = await getActivityByIdResponse(newActivity.id);
 
    return activityResponse;
 }

 async function updateActivity(updActivity, categoryId, accountId){
    const account = await auth.getAccountById(accountId);    

    const activity = await getActivityById(updActivity.id);

    const trip = activity.getTrip();

    await userOwnsTrip(account, trip.id);

    await activity.update(updActivity);

    if(categoryId != null){
        const category = await getActivityCategoryById(categoryId);
        await newActivity.setCategory(category);
    }
 
    const activityResponse = await getTripActivitiesResponse(trip.id);
 
    return activityResponse;
 }

 async function deleteActivity(activityId, accountId){
    const account = await auth.getAccountById(accountId);   
    
    const activity = await getActivityById(activityId);

    const trip = activity.getTrip();

    await userOwnsTrip(account, trip.id);
    
    await db.Activity.destroy({where:{id: activityId}});
 
   return "Ok";
 }

 async function getActivityCategories(accountId){
    const account = await auth.getAccountById(accountId);
    const user = await auth.getUserByAccountId(account.id);

    const categoriesResponse = db.ActivityCategory.findAll(
        {
            where: {userId: user.id},
            attributes: ["id", "name"]
        }        
    );
    return categoriesResponse;
 }

 async function createActivityCategory(category, accountId){    
    const user = await auth.getUserByAccountId(accountId);

    const newCategory = await db.ActivityCategory.create(category);   

    await newCategory.setUser(user);
     
    const categoriesResponse = db.ActivityCategory.findByPk(newCategory.id, 
        {           
            attributes: ["id", "name"]
        }        
    );
    return categoriesResponse;
 }

async function getActivityById(id){
    const activity = await db.Activity.findByPk(id);
    if(!activity) throw 'Activity not found';
    return activity;
}

async function getActivityCategoryById(id){
    const category = await db.ActivityCategory.findByPk(id);
    if(!category) throw 'Activity category not found';
    return category;
}

async function getActivityByIdResponse(id){
    const activity = await db.Activity.findByPk(id, {   
        attributes: [
        "id", 
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
         model: db.Expense,            
         attributes: [
             "id",
             "date", 
             "description",
             "amount", 
             "currency",
             "createdDate",
             "updatedDate"
         ],
         include: [
            {
                model: db.ExpenseCategory,
                as: "category",
                attributes: ["id", "name"]
            }
        ],
     },
     {
        model: db.ActivityCategory,
        as: "category",
        attributes: ["id", "name"]
    }
    ],    
});
    
    return activity;
}

async function getTripActivitiesResponse(tripId){
    const activityResponse = await db.Activity.findAll(
        {   attributes: [
            "id", 
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
                 "isPaid",
                 "createdDate",
                 "updatedDate"
             ],
             include: [
                {
                    model: db.ExpenseCategory,
                    as: "category",
                    attributes: ["id", "name"]
                }
            ],
         },
         {
            model: db.ActivityCategory,
            as: "category",
            attributes: ["id", "name"]
        }
        ]
    });
 
    return activityResponse;
}