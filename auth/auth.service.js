const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');

module.exports = {
    createUser, 
    authenticate,
    getById,
    refreshToken,
    revokeToken
};

async function createUser(params){
    //validate
    if(await db.User.findOne({where: {email: params.email}})){
        throw `Email ${params.email} is already taken`;
    }

    //hash password
    if(params.password){
        params.password = await bcrypt.hash(params.password, 10);
    }

    //save user
    await db.User.create(params);
}

async function authenticate({email, password}){
    const user = await db.User.scope('withPass').findOne({where: {email: email}});    

    if(!user || !(await bcrypt.compare(password, user.password))){        
        throw "Username or password is incorrect";
    }

    const accessToken = generateJwt(user);
    const refreshToken = generateRefreshToken(user);

    await refreshToken.save();
    
    return {
        user: omitPass(user.get()), 
        accessToken: accessToken, 
        refreshToken: refreshToken};
}

async function refreshToken({token}){
    const refreshToken = await getRefreshToken(token);
    const user  = await refreshToken.getUser();

    const newRefreshToken = generateRefreshToken(user);
    refreshToken.revokeDate = Date.now();
    refreshToken.replacedByToken = newRefreshToken.token;
    
    await refreshToken.save();
    await newRefreshToken.save();

    const jwt = generateJwt(user);

    return {
        user: omitPass(user.get()), 
        accessToken: jwt, 
        refreshToken: refreshToken};
}

async function revokeToken({token}){
    const refreshToken = await getRefreshToken(token);

    refreshToken.RevokeDate = Date.now();
    await refreshToken.save();
}

async function getById(id){
    return await getUser(id);
}

async function getUser(id){
    const user = await db.User.findByPk(id);    
    if(!user) throw "User not found";
    return user;
}

async function getRefreshToken(token){
    const refreshToken =  await db.RefreshToken.findOne({ where: { id: token.id } });
    if(!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

function omitPass(user){
    const {password, ...userWithoutPassword} = user;
    return userWithoutPassword
}

function generateJwt(user){
    return jwt.sign({sub: user.id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_LIFE});
}

//expires in 7 days
function generateRefreshToken(user){
    return new db.RefreshToken({
        userId: user.id,
        token: crypto.randomBytes(40).toString('hex'),
        expirationDate: new Date(Date.now() + 7*24*60*60*1000)
    });
}