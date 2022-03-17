
const otpGenerator = require('otp-generator');
const db = require('../db');
const nodemailer = require('nodemailer');
const fs = require('fs');
const ejs = require('ejs');
const {htmlToText} = require('html-to-text');
const juice = require('juice');

module.exports ={

};

async function verifyEmail(email){
    //Generate OTP 
    const otp = otpGenerator.generate(4, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
    const now = new Date();
    const expiration_time = AddMinutesToDate(now,10);
     
   
    //Create OTP instance in DB
    const otp_instance = await db.Otp.create({
      otp: otp,
      expirationDate: expiration_time
    });

    // Create details object containing the email and otp id
    var details={
        "timestamp": now, 
        "check": email,
        "success": true,
        "message":"OTP sent to user",
        "otp_id": otp_instance.id
    }

    // Encrypt the details object    
    const encoded = Buffer.from(JSON.stringify(details)).toString('base64');
        
    var email_subject="[Traces]: Email Verification";  

    var templateVars = {
        otpCode: otp
    }

    const templatePath = `email_templates/email_verification.html`;
}