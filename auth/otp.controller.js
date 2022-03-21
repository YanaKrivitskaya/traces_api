const express = require('express');
const authorize = require('../helpers/jwt_helper');
const router = express.Router();
const otpService = require('../auth/otp.service');

module.exports = router;
//routes
router.post('/verify-email', authorize(), verifyEmail);

async function verifyEmail(req, res, next) {
    otpService.sendOtpToEmail(req.body.email)
    .then((verificationKey) => res.json({verificationKey}))
    .catch(next);   
}




