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

async function authenticate({email, password}, device){
    const user = await db.User.scope('withPass').findOne({
        where: {email: email}
    });    

    if(!user || !(await bcrypt.compare(password, user.password))){        
        throw "Username or password is incorrect";
    }

    const accessToken = generateJwt(user); 

    var refreshToken = await getRefreshTokenByUserId(user.id);    
    
    if(!refreshToken || !refreshToken.isActive) {
        const newRefreshToken = generateRefreshToken(user, device);
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

async function refreshToken({token}, device){
    const refreshToken = await getRefreshToken(token, device);    

    const user  = await refreshToken.getUser();

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(user, device);
    refreshToken.revokedDate = Date.now();
    refreshToken.revokedByDevice = device;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    const jwt = generateJwt(user);

    return {
        user: omitPass(user.get()), 
        accessToken: jwt,
        refreshToken: newRefreshToken.token};    
}

async function revokeToken({token}, device){
    const refreshToken = await getRefreshToken(token, device);    

    refreshToken.revokedDate = Date.now();
    refreshToken.revokedByDevice = device;
    await refreshToken.save();
}

async function getUserById(id){
    const user = await db.User.findByPk(id);    
    if(!user) throw "User not found";
    return user;
}

async function getRefreshToken(token, device){
    const refreshToken =  await db.RefreshToken.findOne({ where: { token: token, deviceId: device } });
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
function generateRefreshToken(user, device){
    return new db.RefreshToken({
        userId: user.id,
        token: crypto.randomBytes(40).toString('hex'),
        expirationDate: new Date(Date.now() + 7*24*60*60*1000),
        deviceId: device
    });
}