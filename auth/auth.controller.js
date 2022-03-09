const express = require('express');
const router = express.Router();
const Joi = require('joi');
const authService = require('./auth.service');
const authorize = require('../helpers/jwt_helper');
const validateRequest = require('../helpers/validate_request');

module.exports = router;

//routes
router.post('/register', registerSchema, register);
router.post('/login', authenticateSchema, authenticate);
router.post('/refresh-token', tokenSchema, refreshToken);
router.post('/revoke-token', authorize(), tokenSchema, revokeToken);
router.put('/email', authorize(), updateSchema, updateEmail);
//router.get('/users/:id', authorize(), getUserById);

function registerSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().required(),        
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
        //confirmPassword: Joi.string().valid(Joi.ref('password')).required(),       
    });
    validateRequest(req, next, schema);
}

function register(req, res, next){
    authService.createAccount(req.body)
        .then(()=> res.json({message: 'Registration successful'}))
        .catch(next);
}

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next){
    var device = req.headers["device-info"];
    authService.authenticate(req.body, device)
        .then(({account, accessToken, refreshToken}) => {
            setCookieToken(res, refreshToken),
            res.json({account, accessToken})
        })
        .catch(next);
}

function refreshToken(req, res, next){    
    var device = req.headers["device-info"];
    authService.refreshToken(req.body, device)
        .then(({account, accessToken, refreshToken}) => {    
            setCookieToken(res, refreshToken),        
            res.json({account, accessToken})
        })
        .catch(next);
}

/*function getUserById(req, res, next){
    authService.getAccountById(req.params.id)
        .then((user) => res.json(user))
        .catch(next);
}*/

function tokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function revokeToken(req, res, next){    
    const token = req.body.token || req.cookies.refreshToken;
    var device = req.headers["device-info"];

    if(!token) return res.status(400).json({message: 'Token is required'});

    if (!req.user.ownsToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    authService.revokeToken({token}, device)
        .then(() => {            
            res.json({message: 'Token revoked'});
        })
        .catch(next);
}

function setCookieToken(res, token){
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7*24*60*60*1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function updateEmail(req, res, next){
    authService.updateEmail(req.user.id, req.body.email)
        .then((account)=> res.json({account}))
        .catch(next);
}