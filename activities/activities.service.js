const db = require('../db');
const auth = require('../auth/auth.service');
const tripsService = require('../trips/trips.service');
const expenseService = require('../expenses/expense.service');

module.exports = {
    getTripActivities,
    getActivity,
    createActivity,
    updateActivity,
    deleteActivity
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

async function createActivity(activity, expense, tripId, accountId){
    const account = await auth.getAccountById(accountId);

    await tripsService.userOwnsTrip(account, tripId);

    const newActivity = await db.Activity.create(activity);

    const trip = await tripsService.getTripById(tripId);

    await newActivity.setTrip(trip);   

    if(expense != null){
       const newExpense = await expenseService.createExpense(expense, tripId, accountId);
       await newActivity.setExpense(newExpense);
    }
 
    const activityResponse = await getActivityByIdResponse(newActivity.id);
 
    return activityResponse;
 }

 async function updateActivity(updActivity, accountId){
    const account = await auth.getAccountById(accountId);    

    const activity = await getActivityById(updActivity.id);

    const trip = activity.getTrip();

    await userOwnsTrip(account, trip.id);

    await activity.update(updActivity);
 
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

async function getActivityById(id){
    const activity = await db.Activity.findByPk(id);
    if(!activity) throw 'Activity not found';
    return activity;
}

async function getActivityByIdResponse(id){
    const activity = await db.Activity.findByPk(id, {   
        attributes: [
        "id", 
        "name",         
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
    
    return activity;
}

async function getTripActivitiesResponse(tripId){
    const activityResponse = await db.Activity.findAll(
        {   attributes: [
            "id", 
            "name",         
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
 
    return activityResponse;
}