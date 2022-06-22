const express = require('express');
const router = express.Router();
const activitiesService = require('./activities.service');
const authorize = require('../helpers/jwt_helper');
const Joi = require('joi');
const validateRequest = require('../helpers/validate_request');

module.exports = router;

router.get('/', authorize(), getTripActivities); 
router.get('/:id', authorize(), getActivity); 
router.post('/', authorize(), activitySchema, createActivity);
router.put('/:id', authorize(), activitySchema, updateActivity);
router.delete('/:id', authorize(), deleteActivity);

function getTripActivities(req, res, next){
    activitiesService.getTripActivities(req.user.id, req.query.tripId)
    .then((activities) => res.json({activities}))
    .catch(next);
}

function getActivity(req, res, next){
    activitiesService.getActivity(req.params.id, req.user.id)
    .then((activity) => res.json({activity}))
    .catch(next);
}

function activitySchema(req, res, next) {
    const schema = Joi.object({        
        tripId: Joi.number().required(),
        categoryId: Joi.number().allow(null, ''),
        expense: Joi.object({
            id: Joi.number().allow(null, ''),
            date: Joi.date().required(),            
            description: Joi.string().allow(null, ''),
            amount: Joi.number().required(),
            currency: Joi.string().allow(null, ''),
            amountUSD: Joi.number().allow(null, ''),
            isPaid: Joi.boolean(),
            category: Joi.object({
                id: Joi.number().allow(null, ''),
                name: Joi.string().required()
            }).required()
        }).allow(null, ''),
        activity: Joi.object({
            id: Joi.number().allow(null, ''),
            name: Joi.string().required(),
            location: Joi.string().allow(null, ''),
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
    activitiesService.createActivity(req.body.activity, req.body.expense, req.body.tripId, req.body.categoryId, req.user.id)
    .then((activities) => res.json({activities}))
    .catch(next);
}

function updateActivity(req, res, next){
    activitiesService.updateActivity(req.body.activity, req.body.expense, req.body.tripId, req.body.categoryId, req.user.id)
    .then((activities) => res.json({activities}))
    .catch(next);
}

function deleteActivity(req, res, next){
    activitiesService.deleteActivity(req.params.id, req.user.id)
    .then((response) => res.json({response}))
    .catch(next);
}

