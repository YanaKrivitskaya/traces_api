const otpGenerator = require('otp-generator');
const db = require('../db');
const nodemailer = require('nodemailer');
const express = require('express');
const authorize = require('../helpers/jwt_helper');
//const {encode} = require('crypt');
const router = express.Router();

module.exports = router;
//routes
router.post('/verify-email', authorize(), verifyEmail);

async function verifyEmail(req, res, next) {
    try{
        const {email,type} = req.body;
        let email_subject, email_message
        if(!email){
          throw("Email not provided");          
        }
        /*if(!type){
          const response={"Status":"Failure","Details":"Type not provided"}
          return res.status(400).send(response) 
        }*/
    
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
        //const encoded= await encode(JSON.stringify(details))
        const encoded = Buffer.from(JSON.stringify(details)).toString('base64')

        const {message, subject_mail} = require('../email_templates/verification');
        email_message=message(otp);
        email_subject=subject_mail;
        
        //Choose message template according type requestedconst encoded= await encode(JSON.stringify(details))
        if(type){
          if(type=="VERIFICATION"){
            
          }
          /*else if(type=="FORGET"){
            const {message, subject_mail} = require('../templates/email/email_forget');
            email_message=message(otp)
            email_subject=subject_mail
          }
          else if(type=="2FA"){
            const {message, subject_mail} = require('../templates/email/email_2FA');
            email_message=message(otp)
            email_subject=subject_mail
          }
          else{
            const response={"Status":"Failure","Details":"Incorrect Type Provided"}
            return res.status(400).send(response) 
          }*/
        }
    
        // Create nodemailer transporter
        const transporter = nodemailer.createTransport({
          host: 'in-v3.mailjet.com',
          port: 465,
          secure: true,
          auth: {
            user: `${process.env.EMAIL_ADDRESS}`,
            pass: `${process.env.EMAIL_PASSWORD}`
          },          
          tls: {
              //secureProtocol: "TLSv1_method"
              rejectUnauthorized: false
        }
        });
    
    
        const mailOptions = {
          from: `"Traces Team"<${process.env.EMAIL_ADDRESS}>`,
          to: `${email}`,
          subject: email_subject,
          text: email_message ,
        };
    
        await transporter.verify();
        
        //Send Email
        await transporter.sendMail(mailOptions, (err, response) => {
          if (err) {
              return res.status(400).send({"Status":"Failure","Details": err });
          } else {
            return res.send({"Status":"Success","Details":encoded});
          }
        });
      }
      catch(err){
        const response={"Status":"Failure","Details": err.message}
        return res.status(400).send(response)
      }
    
}

// To add minutes to the current time
function AddMinutesToDate(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

