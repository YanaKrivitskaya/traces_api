const express = require('express');
const router = express.Router();
const profileService = require('./profile.service');
const authorize = require('../helpers/jwt_helper');
const Joi = require('joi');
const validateRequest = require('../helpers/validate_request');

module.exports = router;

router.get('/', authorize(), getProfileWithGroups);
router.get('/groups/:id/users', authorize(), getGroupUsers);
router.post('/groups/:id/users', authorize(), createUserSchema, createUserForGroup);
router.delete('/groups/:id/users/:userId', authorize(), removeUserFromGroup);
router.put('/user/:id', authorize(), updateUserSchema, updateUser);

function getProfileWithGroups(req, res, next){
    profileService.getProfileWithGroups(req.user.id)
    .then((profile) => res.json({profile}))
    .catch(next);
}

function createUserForGroup(req, res, next){
    profileService.createUserForGroup(req.body, req.params.id, req.user.id)
    .then((user) => res.json({user}))
    .catch(next);
}

function createUserSchema(req, res, next) {
    const schema = Joi.object({        
        name: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function updateUserSchema(req, res, next) {
    const schema = Joi.object({
        id: Joi.number().required(),
        name: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function updateUser(req, res, next){
    profileService.updateUser(req.body, req.params.id, req.user.id)
    .then((user) => res.json({user}))
    .catch(next);
}

function getGroupUsers(req, res, next){
    profileService.getGroupUsers(req.params.id, req.user.id)
    .then((group) => res.json({group}))
    .catch(next);
}

function removeUserFromGroup(req, res, next){
    profileService.removeUserFromGroup(req.params.id, req.params.userId, req.user.id)
    .then((group) => res.json({group}))
    .catch(next);
}