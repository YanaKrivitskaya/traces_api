const db = require('../db');
const auth = require('../auth/auth.service');

module.exports = {
    getCategories,
    createCategory,
    getCategoryById,
    getCategoryByName,
    updateCategory
}

 async function getCategories(accountId){
    const account = await auth.getAccountById(accountId);
    const user = await auth.getUserByAccountId(account.id);

    const categoriesResponse = db.Category.findAll(
        {
            where: {userId: user.id},
            attributes: ["id", "name", "icon", "color"]
        }        
    );
    return categoriesResponse;
 }

 async function createCategory(category, accountId){    
    const user = await auth.getUserByAccountId(accountId);

    const newCategory = await db.Category.create(category);   

    await newCategory.setUser(user);
     
    const categoriesResponse = db.Category.findByPk(newCategory.id, 
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
     
    const categoriesResponse = db.Category.findByPk(updCategory.id, 
        {           
            attributes: ["id", "name"]
        }        
    );
    return categoriesResponse;
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