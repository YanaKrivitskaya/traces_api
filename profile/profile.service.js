const db = require('../db');
const auth = require('../auth/auth.service');
const Sequelize = require("sequelize").Sequelize

module.exports = {
    getProfileWithGroups,
    createUserForGroup,
    getAccountUsers,
    getGroupUsers,
    updateUser,
    removeUserFromGroup
}

async function getProfileWithGroups(accountId){
    return await db.Account.findByPk(accountId, {
        attributes: [["id", "accountId"], 'email', 'emailVerified'],        
        include: [
            {
                model: db.User,
                as: "user",
                attributes: ["id", "name"],                
                include: {
                    model: db.Group,
                    as: "groups",
                    attributes: ["id", "name", "ownerAccountId"],                    
                    through: {attributes: []},
                    include: {
                        model: db.User,
                        as: "users",                        
                        attributes: ["id", "accountId", "name"],
                        through: {attributes: ["isOwner"]},
                      }
                  }
            }
        ]
    });
}

async function createUserForGroup(user, groupId, accountId){
    const account = await auth.getAccountById(accountId);
    const group = await getGroupById(groupId);

    const accountOwnsGroup = await account.hasGroup(group);

    if(!accountOwnsGroup) throw "No permissions to add user to this group";

    user.createdByAccountId = account.id;

    const newUser = await db.User.create(user);
    await group.addUser(newUser);   

    return await getUserByIdWithGroups(newUser.id);
}

async function updateUser(userObject, userId, accountId){
    const account = await auth.getAccountById(accountId);
    var accountUser = await account.getUser();

    var user = await db.User.findByPk(userId);
    
    var ownedUsers = await db.User.findAll({where:{createdByAccountId: account.id, accountId: null}});
    if(accountUser.id != userId && ownedUsers.filter(u => u.id == userId).length == 0) throw "No permissions to update user";

    user.name = userObject.name;

    var updUser = await user.save();
    return await getUserById(updUser.id);
}

async function removeUserFromGroup(groupId, userId, accountId){
    const account = await auth.getAccountById(accountId);
    var accountUser = await account.getUser();

    var user = await db.User.findByPk(userId);
    var group = await getGroupById(groupId);

    if(group.ownerAccountId != account.id) throw "No permissions to remove user from this group";

    var ownedUsers = await db.User.findAll({where:{createdByAccountId: account.id, accountId: null}});
    if(ownedUsers.filter(u => u.id == userId).length == 0) throw "No permissions to remove this user";

    await user.removeGroup(group);

    var userGroups = await user.getGroups();
    
    if(userGroups.length == 0 && user.accountId == null){
        await db.User.destroy({where: { id: userId}});
    }
    
    return await getGroupUsers(groupId);
}

async function getAccountUsers(accountId){    
    return await db.Users.findAll({where: {createdByAccountId: accountId}});
}

async function getGroupUsers(groupId){    
    return await db.Group.findByPk(groupId, {attributes: ["id", "name", "ownerAccountId"],                    
    through: {attributes: []},
    include: {
        model: db.User,
        as: "users",                        
        attributes: ["id", "accountId", "name"],
        through: {attributes: ["isOwner"]},
      }});
}

async function getGroupById(groupId){
    const group = await db.Group.findByPk(groupId);
    if(!group) throw 'Group not found';
    return group;
}

async function getUserById(userId){
    const user = await db.User.findByPk(userId);
    if(!user) throw 'User not found';
    return user;
}

async function getUserByIdWithGroups(userId){
    const user = await db.User.findByPk(userId, {
        attributes: ["id", "name"],                
                include: {
                    model: db.Group,
                    as: "groups",
                    attributes: ["id", "name", "ownerAccountId"],                    
                    through: {attributes: []},
                    include: {
                        model: db.User,
                        as: "users",                        
                        attributes: ["id", "accountId", "name"],
                        through: {attributes: ["isOwner"]},
                      }
                  }
    });
    if(!user) throw 'User not found';
    return user;
}


