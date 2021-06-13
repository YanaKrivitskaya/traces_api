const express = require('express');
const router = express.Router();
const userService = require('./auth.service');
const authorize = require('../helpers/jwt_helper');

module.exports = router;

//routes
router.post('/register', register);
router.post('/login', authenticate);
router.post('/refresh-token', refreshToken);
router.post('/revoke-token', authorize(), revokeToken);
router.get('/users/:id', authorize(), getById);

function register(req, res, next){
    userService.createUser(req.body)
        .then(()=> res.json({message: 'Registration successful'}))
        .catch(next);
}

function authenticate(req, res, next){
    userService.authenticate(req.body)
        .then(({user, accessToken, refreshToken}) => {
            setCookieToken(res, refreshToken),
            res.json({user, accessToken})
        })
        .catch(next);
}

function refreshToken(req, res, next){    
    const token = req.cookies.refreshToken;
    userService.refreshToken({token})
        .then(({user, accessToken, refreshToken}) => {
            setCookieToken(res, refreshToken),
            res.json({user, accessToken})
        })
        .catch(next);
}

function revokeToken(req, res, next){    
    const token = req.body.token || req.cookies.refreshToken;

    if(!token) return res.status(400).json({message: 'Token is required'});

    if (!req.user.ownsToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    userService.revoke({token})
        .then(() => {            
            res.json({message: 'Token revoked'});
        })
        .catch(next);
}

function getById(req, res, next){
    userService.getById(req.params.id)
        .then((user) => res.json(user))
        .catch(next);
}

function setCookieToken(res, token){
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7*24*60*60*1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
}