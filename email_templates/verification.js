const subject_mail = "[Traces]: Email Verification"

const message = (otp) =>{
     return `Dear User, \n\n` 
      + 'OTP for your email verification is : \n\n'
      + `${otp}\n\n`
      + 'This is a auto-generated email. Please do not reply to this email.\n\n'
      + 'Regards\n'
      + 'Traces Team\n\n'
}

module.exports={subject_mail, message};