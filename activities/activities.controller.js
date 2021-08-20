const express = require('express');
const router = express.Router();
const activitiesService = require('./activities.service');
const authorize = require('../helpers/jwt_helper');
const Joi = require('joi');
const validateRequest = require('../helpers/validate_request');

module.exports = router;

router.get('/', authorize(), getTripActivities); 
router.get('/:id', authorize(), getActivity); 
router.post('/', authorize(), createActivitySchema, createActivity);
router.put('/:id', authorize(), updateActivitySchema, updateActivity);
router.delete('/:id', authorize(), deleteActivity);

function getTripActivities(req, res, next){
    activitiesService.getTripActivities(req.user.id, req.body.tripId)
    .then((activities) => res.json({activities}))
    .catch(next);
}

function getActivity(req, res, next){
    activitiesService.getActivity(req.params.id, req.user.id)
    .then((activity) => res.json({activity}))
    .catch(next);
}

function createActivitySchema(req, res, next) {
    const schema = Joi.object({        
        tripId: Joi.number().required(),        
        expense: Joi.object({
            date: Joi.date().required(),
            name: Joi.string().allow(null, ''),
            category: Joi.string().allow(null, ''),
            description: Joi.string().allow(null, ''),
            amount: Joi.number().required(),
            currency: Joi.string().allow(null, ''),
        }).allow(null, ''),
        activity: Joi.object({
            name: Joi.string().required(),            
            description: Joi.string().allow(null, ''),
            date: Joi.date().allow(null, ''),            
            isPlanned: Joi.bool().allow(null, ''),
            isCompleted: Joi.bool().allow(null, ''),
            image: Joi.string().allow(null, '')          
        })
    });
    validateRequest(req, next, schema);
}

function createActivity(req, res, next){
    activitiesService.createActivity(req.body.activity, req.body.expense, req.body.tripId, req.user.id)
    .then((activities) => res.json({activities}))
    .catch(next);
}

function updateActivitySchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().required(),            
        description: Joi.string().allow(null, ''),
        date: Joi.date().allow(null, ''),            
        isPlanned: Joi.bool().allow(null, ''),
        isCompleted: Joi.bool().allow(null, ''),
        image: Joi.string().allow(null, '')          
    });
    validateRequest(req, next, schema);
}

function updateActivity(req, res, next){
    activitiesService.updateActivity(req.body, req.user.id)
    .then((activities) => res.json({activities}))
    .catch(next);
}

function deleteActivity(req, res, next){
    activitiesService.deleteActivity(req.params.id, req.user.id)
    .then((response) => res.json({response}))
    .catch(next);
}
