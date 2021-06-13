const db = require('../db');

module.exports = {
    getNotes
}

async function getNotes(userId){
    const user = await db.User.findByPk(userId);
    if(!user) throw "User not found";
    return notes = await user.getNotes();
}

async function getUserByToken(){
    const user = await db.User.findByPk(req.user.sub);
}