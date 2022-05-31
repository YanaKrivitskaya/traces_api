const db = require('../db');
const auth = require('../auth/auth.service');

module.exports = {
    getCategories,
    createCategory,
    getCategoryById,
    getCategoryByName,
    updateCategory,
    getCategoryUsage,
    deleteCategory
}

 async function getCategories(accountId){
    const account = await auth.getAccountById(accountId);
    const user = await auth.getUserByAccountId(account.id);

    const categoriesResponse = await db.Category.findAll(
        {
            where: {userId: user.id},
            attributes: ["id", "name", "icon", "color"]
        }        
    );
    return categoriesResponse;
 }

 async function getCategoryUsage(categoryId, accountId){
    const account = await auth.getAccountById(accountId);
    
    var activitiesCount = await db.Activity.count({
        where:{
            categoryId: categoryId
        }
    });

    var expensesCount = await db.Expense.count({
        where:{
            categoryId: categoryId
        }
    });

    const categoriesResponse = await db.Category.findByPk(categoryId, 
        {           
            attributes: ["id", "name"]
        }        
    );
    return {
        activitiesCount: activitiesCount, 
        expensesCount: expensesCount,
        category: categoriesResponse};   
 }

 async function createCategory(category, accountId){    
    const user = await auth.getUserByAccountId(accountId);

    const newCategory = await db.Category.create(category);   

    await newCategory.setUser(user);
     
    const categoriesResponse = await db.Category.findByPk(newCategory.id, 
        {           
            attributes: ["id", "name"]
        }        
    );
    return categoriesResponse;
 }

 async function updateCategory(updCategory, accountId){    
    const user = await auth.getUserByAccountId(accountId);

    const category = await getCategoryById(updCategory.id);    

    await userOwnsCategory(user, category.id);

    await category.update(updCategory);    
     
    const categoriesResponse = await db.Category.findByPk(updCategory.id, 
        {           
            attributes: ["id", "name"]
        }        
    );
    return categoriesResponse;
 }

 async function deleteCategory(categoryId, newCategoryId, accountId){
    const user = await auth.getUserByAccountId(accountId);
    
    const category = await getCategoryById(categoryId);    

    await userOwnsCategory(user, category.id);    

    if(newCategoryId != null){
        const newCategory = await getCategoryById(newCategoryId);
        
        const categoryActivities = await category.getActivityCategory();
        for (const activity of categoryActivities){
            await activity.setActivityCategory(newCategory);
        }

        const categoryExpenses= await category.getExpenseCategory();
        for (const expense of categoryExpenses){
            await expense.setExpenseCategory(newCategory);
        }
    }    
    
    await db.Category.destroy({where:{id: categoryId}});
 
   return "Ok";
 }

 async function getCategoryById(id){
    const category = await db.Category.findByPk(id);
    if(!category) throw 'Category not found';
    return category;
}

async function getCategoryByName(name){
    const category = await db.Category.findOne({
        where:{
            name: name
        }
    });    
    return category;
}

async function userOwnsCategory(user, categoryId){
    const userCategories = await user.getCategories({ where: {id: categoryId}});

    if(userCategories.length == 0) throw "No permissions for this category";
    return true;
}