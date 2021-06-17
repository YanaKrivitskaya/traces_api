const express = require('express');
const router = express.Router();
const tagsService = require('./tags.service');
const authorize = require('../helpers/jwt_helper');

module.exports = router;

router.get('/', authorize(), getTags);
router.get('/:id', authorize(), getTagById);
router.post('/', authorize(), createTag);
router.put('/:id', authorize(), updateTag);

function getTags(req, res, next){
    tagsService.getTags(req.user.id)
    .then((tags) => res.json({tags}))
    .catch(next);
}

function getTagById(req, res, next){
    tagsService.getTagById(req.params.id)
    .then((Tag) => res.json({Tag}))
    .catch(next);
}

function createTag(req, res, next){
    tagsService.createTag(req.body, req.user.id)
        .then((Tag) => res.json({Tag}))
        .catch(next);
}

function updateTag(req, res, next){
    tagsService.updateTag(req.body, req.params.id)
        .then((Tag) => res.json({Tag}))
        .catch(next);
}