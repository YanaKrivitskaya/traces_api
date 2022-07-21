const express = require('express');
const router = express.Router();
const expensesService = require('./expense.service');
const authorize = require('../helpers/jwt_helper');
const Joi = require('joi');
const validateRequest = require('../helpers/validate_request');

module.exports = router;

router.get('/', authorize(), getTripExpenses); 
router.get('/:id', authorize(), getExpense); 
router.post('/', authorize(), createExpenseSchema, createExpense);
router.put('/:id', authorize(), updateExpenseSchema, updateExpense);
router.delete('/:id', authorize(), deleteExpense);

function getTripExpenses(req, res, next){
    expensesService.getTripExpenses(req.user.id, req.query.tripId)
    .then((expenses) => res.json({expenses}))
    .catch(next);
}

function getExpense(req, res, next){
    expensesService.getExpense(req.params.id, req.user.id)
    .then((expense) => res.json({expense}))
    .catch(next);
}

function createExpenseSchema(req, res, next) {
    const schema = Joi.object({        
        tripId: Joi.number().required(),
        categoryId: Joi.number(),
        expense: Joi.object({
            date: Joi.date().required(),
            name: Joi.string().allow(null, ''),            
            description: Joi.string().allow(null, ''),
            amount: Joi.number().required(),
            currency: Joi.string(),            
            amountDTC: Joi.number().allow(null, ''),
            isPaid: Joi.boolean(),
        })
    });
    validateRequest(req, next, schema);
}

function createExpense(req, res, next){
    expensesService.createExpense(req.body.expense, req.body.tripId, req.body.categoryId, req.user.id)
    .then((expenses) => res.json({expenses}))
    .catch(next);
}

function updateExpenseSchema(req, res, next) {
    const schema = Joi.object({
        categoryId: Joi.number().allow(null, ''),
        expense: Joi.object({
            id: Joi.number().required(),
            date: Joi.date().required(),
            name: Joi.string().allow(null, ''),        
            description: Joi.string().allow(null, ''),
            amount: Joi.number().required(),
            currency: Joi.string().allow(null, ''),           
            amountDTC: Joi.number().allow(null, ''),
            isPaid: Joi.boolean(),
        })        
    });
    validateRequest(req, next, schema);
}

function updateExpense(req, res, next){
    expensesService.updateExpense(req.body.expense, req.body.categoryId, req.user.id)
    .then((expenses) => res.json({expenses}))
    .catch(next);
}

function deleteExpense(req, res, next){
    expensesService.deleteExpense(req.params.id, req.user.id)
    .then((response) => res.json({response}))
    .catch(next);
}