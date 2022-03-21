const otpGenerator = require('otp-generator');
const db = require('../db');
const nodemailer = require('nodemailer');
const fs = require('fs');
const ejs = require('ejs');
const {htmlToText} = require('html-to-text');
const juice = require('juice');

module.exports ={
    sendOtpToEmail,
    verifyOtp
};

async function sendOtpToEmail(email){
    try{
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

    if (fs.existsSync(templatePath)) {
        const template = fs.readFileSync(templatePath, "utf-8");
        const html = ejs.render(template, templateVars);
        const text = htmlToText(html);
        const htmlWithStylesInlined = juice(html);    
        
        // Create nodemailer transporter
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        service: 'Gmail',
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
        html:htmlWithStylesInlined,
        text:text          
      };
  
      await transporter.verify();
      
      //Send Email
      await transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          throw err.message;
        }
      });

      return encoded;
      }  
    }
    catch(err){
        throw err.message;
    } 
}

async function verifyOtp(verificationKey, otp, email){
    try{
        // var currentdate = new Date(); 
         //const {verificationKey, otp, email} = params;
     
         if(!verificationKey){
           throw "Verification Key not provided";        
         }
         if(!otp){
           throw "OTP not Provided";        
         }
         if(!email){
           throw "Check not Provided";        
         }
     
         let decoded;
     
         //Check if verification key is altered or not and store it in variable decoded after decryption
         try{
           let buff = new Buffer.from(verificationKey, 'base64');        
           decoded = buff.toString('ascii');
         }
         catch(err) {
           throw err.message;
         }
     
         var obj= JSON.parse(decoded)
         const check_obj = obj.check
     
         // Check if the OTP was meant for the same email or phone number for which it is being verified 
         if(check_obj!=email){
           throw "OTP was not sent to this particular email";        
         }
     
         const otp_instance= await db.Otp.findOne({where:{id: obj.otp_id}});
     
         //Check if OTP is available in the DB
         if(otp_instance!=null){
           //Check if OTP is already used or not
           if(otp_instance.isVerified!=true){
     
               //Check if OTP is expired or not
               if (!otp_instance.isExpired){
     
                   //Check if OTP is equal to the OTP in the DB
                   if(otp===otp_instance.otp){
                       // Mark OTP as verified or used
                       otp_instance.isVerified=true
                       await otp_instance.save();     
                       
                       return email;
                   }
                   else{
                       throw "OTP NOT Matched";                    
                   }   
               }
               else{
                   throw "OTP Expired";                
               }
           }
           else{
               throw "OTP Already Used";            
           }
        }
        else{
            throw "OTP not defined";
        }
    }catch(err){        
        throw err;
    }
}

// To add minutes to the current time
function AddMinutesToDate(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}