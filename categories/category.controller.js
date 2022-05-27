const express = require('express');
const router = express.Router();
const categoriesService = require('../categories/categories.service');
const authorize = require('../helpers/jwt_helper');
const Joi = require('joi');
const validateRequest = require('../helpers/validate_request');

module.exports = router;

router.get('/', authorize(), getCategories);
router.post('/', authorize(), createCategorySchema, createCategory); 


function getCategories(req, res, next){
    categoriesService.getCategories(req.user.id)
    .then((categories) => res.json({categories}))
    .catch(next);
}

function createCategorySchema(req, res, next) {
    const schema = Joi.object({        
        name: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function createCategory(req, res, next){
    categoriesService.createCategory(req.body, req.user.id)
    .then((category) => res.json({category}))
    .catch(next);
}
