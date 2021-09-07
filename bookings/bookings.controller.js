const express = require('express');
const router = express.Router();
const bookingsService = require('./bookings.service');
const authorize = require('../helpers/jwt_helper');
const Joi = require('joi');
const validateRequest = require('../helpers/validate_request');

module.exports = router;

router.get('/', authorize(), getTripBookings); 
router.get('/:id', authorize(), getBooking); 
router.post('/', authorize(), createBookingSchema, createBooking);
router.put('/:id', authorize(), updateBookingSchema, updateBooking);
router.delete('/:id', authorize(), deleteBooking);

function getTripBookings(req, res, next){
    bookingsService.getTripBookings(req.user.id, req.query.tripId)
    .then((bookings) => res.json({bookings}))
    .catch(next);
}

function getBooking(req, res, next){
    bookingsService.getBooking(req.params.id, req.user.id)
    .then((booking) => res.json({booking}))
    .catch(next);
}

function createBookingSchema(req, res, next) {
    const schema = Joi.object({        
        tripId: Joi.number().required(),        
        expense: Joi.object({
            date: Joi.date().required(),            
            description: Joi.string().allow(null, ''),
            amount: Joi.number().required(),
            currency: Joi.string().allow(null, ''),
            isPaid: Joi.boolean(),
            category: Joi.object({
                name: Joi.string().required()
            }).required()
        }).allow(null, ''),
        booking: Joi.object({
            name: Joi.string().required(),
            details: Joi.string().allow(null, ''),
            location: Joi.string().allow(null, ''),            
            reservationNumber: Joi.string().allow(null, ''),
            reservationUrl: Joi.string().allow(null, ''),
            entryDate: Joi.date().allow(null, ''),
            exitDate: Joi.date().allow(null, ''),
            image: Joi.string().allow(null, ''),            
            guestsQuantity: Joi.number().allow(null, '')            
        })
    });
    validateRequest(req, next, schema);
}

function createBooking(req, res, next){
    bookingsService.createBooking(req.body.booking, req.body.expense, req.body.tripId, req.user.id)
    .then((bookings) => res.json({bookings}))
    .catch(next);
}

function updateBookingSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().required(),
        details: Joi.string().allow(null, ''),
        description: Joi.string().allow(null, ''),
        reservationDate: Joi.date().allow(null, ''),
        reservationNumber: Joi.string().allow(null, ''),
        reservationUrl: Joi.string().allow(null, ''),
        entryDate: Joi.date().allow(null, ''),
        exitDate: Joi.date().allow(null, ''),
        image: Joi.string().allow(null, ''),            
        guestsQuantity: Joi.number().allow(null, '')            
    });
    validateRequest(req, next, schema);
}

function updateBooking(req, res, next){
    bookingsService.updateBooking(req.body, req.user.id)
    .then((bookings) => res.json({bookings}))
    .catch(next);
}

function deleteBooking(req, res, next){
    bookingsService.deleteBooking(req.params.id, req.user.id)
    .then((response) => res.json({response}))
    .catch(next);
}
