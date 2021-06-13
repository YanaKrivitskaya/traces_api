const express = require('express');
const router = express.Router();
const notesService = require('./notes.service');
const authorize = require('../helpers/jwt_helper');

module.exports = router;

router.get('/', authorize(), getNotes);

function getNotes(req, res, next){
    notesService.getNotes(req.user.id)
    .then((notes) => res.json({notes}))
    .catch(next);
}