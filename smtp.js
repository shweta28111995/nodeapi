var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport");
var smtpTransport = nodemailer.createTransport(smtpTransport({
   host: "smtp.gmail.com",
    secureConnection: true,
    port: 587,
    auth: {
       // user: "donotreply.testing.web@gmail.com",
       // pass: "5jrC+7G~"     
       user: "vikrammanchanda18@yahoo.com",
        pass: "VICKY@18"  
    }
}));

module.exports = {
    'smtpTransport': smtpTransport,  
};
