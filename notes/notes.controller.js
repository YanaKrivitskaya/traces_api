const express = require('express');
const router = express.Router();
const notesService = require('./notes.service');
const authorize = require('../helpers/jwt_helper');
const Joi = require('joi');
const validateRequest = require('../helpers/validate_request');

module.exports = router;

router.get('/', authorize(), getNotes);
router.get('/:id', authorize(), getNoteById);
router.post('/', authorize(), createNote);
router.put('/:id', authorize(), updateNote);
router.delete('/:id', authorize(), deleteNote);
router.post('/:id/tags/:tagId', authorize(), addNoteTag);
router.delete('/:id/tags/:tagId', authorize(), deleteNoteTag);

function getNotes(req, res, next){
    notesService.getNotes(req.user.id)
    .then((notes) => res.json({notes}))
    .catch(next);
}

function getNoteById(req, res, next){
    notesService.getNoteByIdWithTags(req.params.id)
    .then((note) => res.json({note}))
    .catch(next);
}

function createNote(req, res, next){
    notesService.createNote(req.body, req.user.id)
        .then((note) => res.json({note}))
        .catch(next);
}

function updateNote(req, res, next){
    notesService.updateNote(req.body, req.params.id)
        .then((note) => res.json({note}))
        .catch(next);
}

function deleteNote(req, res, next){
    notesService.deleteNote(req.params.id, req.user)
        .then(()=> res.json({message: 'Ok'}))
        .catch(next);
}

function addNoteTag(req, res, next){
    notesService.addNoteTag(req.params.id, req.params.tagId)
        .then((note) => res.json({note}))
        .catch(next);
}

function deleteNoteTag(req, res, next){
    notesService.deleteNoteTag(req.params.id, req.params.tagId)
        .then((note) => res.json({note}))
        .catch(next);
}