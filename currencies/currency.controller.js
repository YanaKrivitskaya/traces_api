const express = require('express');
const router = express.Router();
const currencyService = require('./currency.service');
const authorize = require('../helpers/jwt_helper');

module.exports = router;

router.get('/', authorize(), getCurrencies);

function getCurrencies(req, res, next){
    currencyService.getCurrencies(req.user.id)
    .then((currencies) => res.json({currencies}))
    .catch(next);
}