const db = require('../db');
const auth = require('../auth/auth.service');
const Sequelize = require("sequelize").Sequelize

module.exports = {
    getCurrencies
}

async function getCurrencies(accountId){
    await auth.getAccountById(accountId);

    return await db.Currency.findAll({
        attributes: ["id", "code", "name", "createdDate"]
    });
}