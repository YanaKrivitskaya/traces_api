const express = require('express');
const router = express.Router();
const visasService = require('./visas.service');
const authorize = require('../helpers/jwt_helper');
const Joi = require('joi');
const validateRequest = require('../helpers/validate_request');

module.exports = router;

router.get('/', authorize(), getVisas); 
router.get('/:id', authorize(), getVisaById); 
router.post('/', authorize(), visaSchema, createVisa);
router.put('/:id', authorize(), visaSchema, updateVisa);
router.post('/:id/entry', authorize(), visaEntrySchema, createVisaEntry);
router.get('/:id/entry/:entryId', authorize(), getVisaEntry);
router.put('/:id/entry/:entryId', authorize(), visaEntrySchema, updateVisaEntry);
router.delete('/:id/entry/:entryId', authorize(), deleteVisaEntry);
router.delete('/:id', authorize(), deleteVisa);

function getVisas(req, res, next){
    visasService.getVisas(req.user.id)
    .then((visas) => res.json({visas}))
    .catch(next);
}

function getVisaById(req, res, next){
    visasService.getVisaByIdWithEntries(req.params.id, req.user.id)
    .then((visa) => res.json({visa}))
    .catch(next);
}

function visaSchema(req, res, next) {
    const schema = Joi.object({        
        userId: Joi.number().required(),
        visa: Joi.object({
            country: Joi.string().required(),
            type: Joi.string().required(),
            entriesType: Joi.string().required(),
            durationOfStay: Joi.number(),
            startDate: Joi.date().required(),
            endDate: Joi.date().required(),
        })
    });
    validateRequest(req, next, schema);
}

function createVisa(req, res, next){
    visasService.createVisa(req.body.visa, req.body.userId, req.user.id)
    .then((visa) => res.json({visa}))
    .catch(next);
}

function updateVisa(req, res, next){
    visasService.updateVisa(req.body.visa, req.params.id, req.body.userId, req.user.id)
    .then((visa) => res.json({visa}))
    .catch(next);
}

function visaEntrySchema(req, res, next) {
    const schema = Joi.object({
        entryCountry: Joi.string().required(),
        entryCity: Joi.string().allow(null, ''),
        entryTransport: Joi.string().required(),       
        entryDate: Joi.date().required(),
        exitCountry: Joi.string().allow(null, ''),
        exitCity: Joi.string().allow(null, ''),
        exitTransport: Joi.string().allow(null, ''),       
        exitDate: Joi.date().allow(null),
        hasExit: Joi.boolean().allow(null),
        visaId: Joi.number().required()
    });
    validateRequest(req, next, schema);
}

function createVisaEntry(req, res, next){
    visasService.createVisaEntry(req.params.id, req.body, req.user.id)
    .then((entry) => res.json({entry}))
    .catch(next);
}

function getVisaEntry(req, res, next){
    visasService.getVisaEntryById(req.params.id, req.params.entryId, req.user.id)
    .then((entry) => res.json({entry}))
    .catch(next);
}

function updateVisaEntry(req, res, next){
    visasService.updateVisaEntry(req.params.entryId, req.body, req.user.id)
    .then((entry) => res.json({entry}))
    .catch(next);
}

function deleteVisaEntry(req, res, next){
    visasService.deleteVisaEntry(req.params.entryId, req.user.id)
    .then((response) => res.json({response}))
    .catch(next);
}

function deleteVisa(req, res, next){
    visasService.deleteVisa(req.params.id, req.user.id)
    .then((response) => res.json({response}))
    .catch(next);
}