const nodemailer = require("nodemailer");

module.exports={
 
  sendOTP:(email, otp) => {
      return new Promise((resolve, reject)=>{
      let password="kownldqoewlxgqjo"
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "jasmart823@gmail.com",
            pass: password
        }
    });
    var mailOptions = {
        from:"jasmart823@gmail.com",
        to: email,
        subject: "Jas Mart Email verification",
        html: `
                  <h1>Verify Your Email For Jas Mart</h1>
                    <h3>use this code <h2>${otp}</h2> to verify your email</h3>
                   
                 `
    };
    transporter.sendMail(mailOptions,(err,res)=>{
        if(err){
            console.log(err);
        }
        else {
          resolve(otp)
        }
    });
      })

  }
}