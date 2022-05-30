const express = require('express');
const router = express.Router();
const activitiesService = require('./activities.service');
const authorize = require('../helpers/jwt_helper');
const Joi = require('joi');
const validateRequest = require('../helpers/validate_request');

module.exports = router;

router.get('/', authorize(), getActivityCategories); 
router.post('/', authorize(), createCategorySchema, createActivityCategory); 

function getActivityCategories(req, res, next){
    activitiesService.getActivityCategories(req.user.id)
    .then((categories) => res.json({categories}))
    .catch(next);
}

function createCategorySchema(req, res, next) {
    const schema = Joi.object({        
        name: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function createActivityCategory(req, res, next){
    activitiesService.createActivityCategory(req.body, req.user.id)
    .then((category) => res.json({category}))
    .catch(next);
}