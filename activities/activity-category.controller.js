const express = require('express');
const router = express.Router();
const activitiesService = require('./activities.service');
const authorize = require('../helpers/jwt_helper');

module.exports = router;

router.get('/', authorize(), getActivityCategories); 

function getActivityCategories(req, res, next){
    activitiesService.getActivityCategories(req.user.id)
    .then((categories) => res.json({categories}))
    .catch(next);
}