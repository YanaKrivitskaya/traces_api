const express = require('express');
const router = express.Router();
const notesService = require('./notes.service');
const authorize = require('../helpers/jwt_helper');

module.exports = router;

router.get('/', authorize(), getNotes);
router.get('/:id', authorize(), getNoteById);
router.post('/', authorize(), createNote);
router.put('/:id', authorize(), updateNote);

function getNotes(req, res, next){
    notesService.getNotes(req.user.id)
    .then((notes) => res.json({notes}))
    .catch(next);
}

function getNoteById(req, res, next){
    notesService.getNoteById(req.params.id)
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