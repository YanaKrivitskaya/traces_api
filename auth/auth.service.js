const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');
const { Op } = require("sequelize");

module.exports = {
    createAccount, 
    authenticate,
    getAccountById,    
    refreshToken,
    revokeToken,
    getUserByAccountId,
    getUserById,
    accountOwnsUser,
    updateEmail
};

async function createAccount(params){
    //validate
    if(await db.Account.findOne({where: {email: params.email}})){
        throw `Email ${params.email} is already taken`;
    }

    //hash password
    if(params.password){
        params.password = await bcrypt.hash(params.password, 10);
    }

    //save Account
    var newAccount = await db.Account.create(params);

    //create user entity
    var user = await newAccount.createUser({name: params.name, createdBy: newAccount.id});

    //create family group
    var group = await newAccount.createGroup({name: "Family", });
    await group.addUser(user);

    const userGroup = await db.UserGroup.findOne({where: {groupId: group.id, userId: user.id}});    
    userGroup.isOwner = true;
    await userGroup.save();

    return newAccount;
}

async function updateEmail(accountId, email){
    //validate
    if(await db.Account.findOne({where: {email: email}})){
        throw `Email ${email} is already taken`;
    }

    const account = await getAccountById(accountId);

    account.email = email;
    account.emailVerified = false;

    await account.save();

    return account;
}

async function authenticate({email, password}, device){
    const account = await db.Account.scope('withPass').findOne({
        where: {email: email}
    });    

    if(!account || !(await bcrypt.compare(password, account.password))){        
        throw "Username or password is incorrect";
    }

    const accessToken = generateJwt(account); 

    var refreshToken = await getRefreshTokenByAccountId(account.id, device);    
    
    if(!refreshToken || !refreshToken.isActive) {
        const newRefreshToken = generateRefreshToken(account, device);
        await newRefreshToken.save();
        if(refreshToken!= null && !refreshToken.isActive){
            refreshToken.revokedDate = Date.now();
            refreshToken.replacedByToken = newRefreshToken.token;
                
            await refreshToken.save();
        }
        refreshToken = newRefreshToken;
    }
    
    return {
        account: omitPass(account.get()), 
        accessToken: accessToken, 
        refreshToken: refreshToken.token};
}

async function refreshToken({token}, device){
    const refreshToken = await getRefreshToken(token, device);    

    const account  = await refreshToken.getAccount();

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(account, device);
    refreshToken.revokedDate = Date.now();
    refreshToken.revokedByDevice = device;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    const jwt = generateJwt(account);

    return {
        account: omitPass(account.get()), 
        accessToken: jwt,
        refreshToken: newRefreshToken.token};    
}

async function revokeToken({token}, device){
    const refreshToken = await getRefreshToken(token, device);    

    refreshToken.revokedDate = Date.now();
    refreshToken.revokedByDevice = device;
    await refreshToken.save();
}

async function getAccountById(id){
    const account = await db.Account.findByPk(id/*, {include: [
        {
            model: db.User,            
            as: "user",
            attributes: ["name"],
            include: {
                model: db.Group,
                as: "groups",
              }
        }
    ]}*/);
    

    if(!account) throw "Account not found";
    return account;
}

async function getUserByAccountId(accountId){
    const user = await db.User.findOne({where: {accountId: accountId}});
    if(!user) throw 'User not found';
    return user;
}

async function getUserById(userId){
    const user = await db.User.findByPk(userId);
    if(!user) throw 'User not found';
    return user;
}

async function getRefreshToken(token, device){
    const refreshToken =  await db.RefreshToken.findOne({ where: { token: token, deviceId: device } });
    if(!refreshToken || !refreshToken.isActive) throw 'UnauthorizedError';
    return refreshToken;
}

async function getRefreshTokenByAccountId(accountId, device){
    const refreshToken =  await db.RefreshToken.findOne({ where: { accountId: accountId, deviceId: device } });    
    return refreshToken;
}

function omitPass(account){
    const {password, ...accountWithoutPassword} = account;
    return accountWithoutPassword
}

function generateJwt(account){
    return jwt.sign({sub: account.id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_LIFE});
}

//expires in 7 days
function generateRefreshToken(account, device){
    return new db.RefreshToken({
        accountId: account.id,
        token: crypto.randomBytes(40).toString('hex'),
        expirationDate: new Date(Date.now() + 7*24*60*60*1000),
        deviceId: device
    });
}

async function accountOwnsUser(account, userId){
    const accountUsers = await db.User.findAll({where: {
        createdBy: account.id,
        id: userId,
        accountId: {
            [Op.or]: [null, account.id]
          }
    }});

    if(accountUsers.length == 0) throw "No permissions for this user";
    return true;
}