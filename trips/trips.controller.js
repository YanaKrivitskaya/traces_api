const express = require('express');
const router = express.Router();
const tripsService = require('./trips.service');
const authorize = require('../helpers/jwt_helper');
const Joi = require('joi');
const validateRequest = require('../helpers/validate_request');
const multer  = require('multer')

const upload = multer({ storage: multer.memoryStorage() })

module.exports = router;

router.get('/', authorize(), getTrips); 
router.get('/list', authorize(), getTripsList); 
router.get('/:id', authorize(), getTripById);
router.get('/:id/day/:date', authorize(), getTripDay); 
router.post('/', authorize(), tripSchema, createTrip);
router.put('/:id', authorize(), tripSchema, updateTrip);
router.put('/:id/users', authorize(), tripUserSchema, updateTripUsers);
router.delete('/:id', authorize(), deleteTrip);
router.post('/:id/image', authorize(),  upload.single('file'), updateTripImage);

function getTripsList(req, res, next){
    tripsService.getTripsList(req.user.id)
    .then((trips) => res.json({trips}))
    .catch(next);
}

function getTrips(req, res, next){
    tripsService.getTrips(req.user.id)
    .then((trips) => res.json({trips}))
    .catch(next);
}

function getTripDay(req, res, next){
    tripsService.getTripDay(req.params.id, req.params.date, req.user.id)
    .then((tripDay) => res.json({tripDay}))
    .catch(next);
}

function getTripById(req, res, next){
    tripsService.getTrip(req.params.id, req.user.id)
    .then((trip) => res.json({trip}))
    .catch(next);
}

function tripSchema(req, res, next) {
    const schema = Joi.object({
        id: Joi.number().allow(null, ''),
        name: Joi.string().required(),
        description: Joi.string().allow(null, ''),      
        coverImageUrl: Joi.string().allow(null, ''), 
        startDate: Joi.date().required(),
        endDate: Joi.date().allow(null, '')           
    });
    validateRequest(req, next, schema);
}

function createTrip(req, res, next){
    tripsService.createTrip(req.body, req.user.id)
    .then((trip) => res.json({trip}))
    .catch(next);
}

function updateTrip(req, res, next){
    tripsService.updateTrip(req.body, req.user.id)
    .then((trip) => res.json({trip}))
    .catch(next);
}

function tripUserSchema(req, res, next) {
    const schema = Joi.object({
        userIds: Joi.array().required()         
    });
    validateRequest(req, next, schema);
}

function updateTripUsers(req, res, next){
    tripsService.updateTripUsers(req.params.id, req.user.id, req.body.userIds)
    .then((trip) => res.json({trip}))
    .catch(next);
}

function deleteTrip(req, res, next){
    tripsService.deleteTrip(req.params.id, req.user.id)
    .then((response) => res.json({response}))
    .catch(next);
}

function updateTripImage(req, res, next){
    tripsService.updateTripImage(req.params.id, req.file, req.user.id)
    .then((response) => res.json({response}))
    .catch(next);
}