const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');

module.exports = {
    createUser, 
    authenticate,
    getUserById,    
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
    const user = await db.User.scope('withPass').findOne({
        where: {email: email}
    });    

    if(!user || !(await bcrypt.compare(password, user.password))){        
        throw "Username or password is incorrect";
    }

    const accessToken = generateJwt(user); 

    var refreshToken = await getRefreshTokenByUserId(user.id);    
    
    if(!refreshToken || !refreshToken.isActive) {
        const newRefreshToken = generateRefreshToken(user);
        await newRefreshToken.save();
        if(refreshToken!= null && !refreshToken.isActive){
            refreshToken.revokedDate = Date.now();
            refreshToken.replacedByToken = newRefreshToken.token;
                
            await refreshToken.save();
        }
        refreshToken = newRefreshToken;
    }
    
    return {
        user: omitPass(user.get()), 
        accessToken: accessToken, 
        refreshToken: refreshToken.token};
}

async function refreshToken({token}){
    const refreshToken = await getRefreshToken(token);    

    const user  = await refreshToken.getUser();
    const jwt = generateJwt(user);

    return {
        user: omitPass(user.get()), 
        accessToken: jwt};    
}

async function revokeToken({refreshToken}){
    const token = await getRefreshToken(refreshToken);    

    token.RevokeDate = Date.now();
    await token.save();
}

async function getCurrentUser({token}){
    const refreshToken = await getRefreshToken(token);
    
    var user = await refreshToken.getUser();
    
    const accessToken = generateJwt(user);
    
    return {
        user: omitPass(user.get()), 
        accessToken: accessToken}
}

async function getUserById(id){
    const user = await db.User.findByPk(id);    
    if(!user) throw "User not found";
    return user;
}

async function getRefreshToken(token){
    const refreshToken =  await db.RefreshToken.findOne({ where: { token: token } });
    if(!refreshToken || !refreshToken.isActive) throw 'UnauthorizedError';
    return refreshToken;
}

async function getRefreshTokenByUserId(userId){
    const refreshToken =  await db.RefreshToken.findOne({ where: { userId: userId } });    
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