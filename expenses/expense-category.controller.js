const express = require('express');
const router = express.Router();
const expensesService = require('./expense.service');
const authorize = require('../helpers/jwt_helper');
const Joi = require('joi');
const validateRequest = require('../helpers/validate_request');

module.exports = router;

router.get('/', authorize(), getExpenseCategories);
router.post('/', authorize(), createCategorySchema, createExpenseCategory); 


function getExpenseCategories(req, res, next){
    expensesService.getExpenseCategories(req.user.id)
    .then((categories) => res.json({categories}))
    .catch(next);
}

function createCategorySchema(req, res, next) {
    const schema = Joi.object({        
        name: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function createExpenseCategory(req, res, next){
    expensesService.createExpenseCategory(req.body, req.user.id)
    .then((category) => res.json({category}))
    .catch(next);
}
