const express = require('express');
const router = express.Router();
const tripsService = require('./trips.service');
const authorize = require('../helpers/jwt_helper');
const Joi = require('joi');
const validateRequest = require('../helpers/validate_request');

module.exports = router;

router.get('/', authorize(), getTrips); 
router.get('/:id', authorize(), getTripById); 
router.post('/', authorize(), createTripSchema, createTrip);

function getTrips(req, res, next){
    tripsService.getTrips(req.user.id)
    .then((trips) => res.json({trips}))
    .catch(next);
}

function getTripById(req, res, next){
    tripsService.getTrip(req.params.id, req.user.id)
    .then((trip) => res.json({trip}))
    .catch(next);
}

function createTripSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().optional().allow(null),      
        coverImageUrl: Joi.string().optional().allow(null), 
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
    });
    validateRequest(req, next, schema);
}

function createTrip(req, res, next){
    tripsService.createTrip(req.body, req.user.id)
    .then((trip) => res.json({trip}))
    .catch(next);
}