const express = require('express');
const router = express.Router();
const ticketsService = require('./ticket.service');
const authorize = require('../helpers/jwt_helper');
const Joi = require('joi');
const validateRequest = require('../helpers/validate_request');

module.exports = router;

router.get('/', authorize(), getTripTickets); 
router.get('/:id', authorize(), getTicket); 
router.post('/', authorize(), ticketSchema, createTicket);
router.put('/:id', authorize(), ticketSchema, updateTicket);
router.delete('/:id', authorize(), deleteTicket);

function getTripTickets(req, res, next){
    ticketsService.getTripTickets(req.user.id, req.query.tripId)
    .then((tickets) => res.json({tickets}))
    .catch(next);
}

function getTicket(req, res, next){
    ticketsService.getTicket(req.params.id, req.user.id)
    .then((ticket) => res.json({ticket}))
    .catch(next);
}

function ticketSchema(req, res, next) {
    const schema = Joi.object({        
        tripId: Joi.number().required(),
        userId: Joi.number().allow(null, ''),
        expense: Joi.object({
            id: Joi.number().allow(null, ''),
            date: Joi.date().required(),            
            description: Joi.string().allow(null, ''),
            amount: Joi.number().required(),
            currency: Joi.string().allow(null, ''), 
            amountUSD: Joi.number().allow(null, ''),
            isPaid: Joi.boolean(),           
            category: Joi.object({
                name: Joi.string().required()
            }).required()
        }).allow(null, ''),
        ticket: Joi.object({
            id: Joi.number().allow(null, ''),
            departureLocation: Joi.string().required(),
            arrivalLocation: Joi.string().required(),
            type: Joi.string().required(),
            departureDatetime: Joi.date().allow(null, ''),
            arrivalDatetime: Joi.date().allow(null, ''),
            carrier: Joi.string().allow(null, ''),
            carrierNumber: Joi.string().allow(null, ''),
            quantity: Joi.number().allow(null, ''),
            seats: Joi.string().allow(null, ''),
            details: Joi.string().allow(null, ''),
            reservationNumber: Joi.string().allow(null, ''),
            reservationUrl: Joi.string().allow(null, ''),
        })
    });
    validateRequest(req, next, schema);
}

function createTicket(req, res, next){
    ticketsService.createTicket(req.body.ticket, req.body.expense, req.body.tripId, req.body.userId, req.user.id)
    .then((tickets) => res.json({tickets}))
    .catch(next);
}

function updateTicket(req, res, next){
    ticketsService.updateTicket(req.body.ticket, req.body.expense, req.body.tripId,req.user.id)
    .then((tickets) => res.json({tickets}))
    .catch(next);
}

function deleteTicket(req, res, next){
    ticketsService.deleteTicket(req.params.id, req.user.id)
    .then((response) => res.json({response}))
    .catch(next);
}
