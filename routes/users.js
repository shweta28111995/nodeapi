var express = require('express');
var validator = require('express-validator');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');//login
var jwt = require('jsonwebtoken');//login
var config = require('../config');//login
var smtp = require('../smtp');//calling smtp package
var EmailTemplate = require('email-templates').EmailTemplate; // call email-templates
var cors = require('cors');
var PORT = process.env.PORT || 3000;
var app = express();
var passport = require("passport");
var async = require("async");
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

//call email-template package
//call email templates using path to access files of files
var path = require('path');
var templatesDir = path.resolve(__dirname, '../templates');

// if our user.js file is at models/user.js
var User = require('../models/User');
var error = require('../error');


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


//Save data in database
router.route('/register').post(function (req, res) {
// Start validations 
  req.assert('firstname', error.firstnamereq).notEmpty();
  req.assert('firstname', error.firstnamevalidator).matches(/^[A-Za-z]+$/);

  req.assert('lastname', error.lastnamereq).notEmpty();
  req.assert('lastname', error.lastnamevalidator).matches(/^[a-z]+$/);

  req.assert('email', error.email).isEmail();

  req.assert('password', error.password).notEmpty();
  req.assert("password", error.passwordvalidator)
  .matches(/^(?=.*\d).{4,8}$/);
  
//End Validations



  const errors = req.validationErrors();
  if (errors) {
    return res.send({ "status": "Error", "message": errors });
  }

  //Start check Email is registered or not
  User.findOne({ "email": req.body.email }, function (err, user) {
    //console.log(user.email);

    console.log(req.body.email);
    if (!user) {
      const newUser = new User({
        "firstname": req.body.firstname,
        "lastname": req.body.lastname,
        "email": req.body.email,
        "password": req.body.password,
        "isactive": req.body.isactive,
        "isdeleted": req.body.isdeleted,
      });
      // get the current date
      var currentDate = new Date();
      newUser.created_at = currentDate;
      newUser.updated_at = currentDate;

      console.log('email not Exists: ', req.body.email);
      newUser.save(function (err, user) {
        if (err) return res.send({ "status": "Error", "message": "Email already exists" });
       if(!err){
          
          var template = new EmailTemplate(path.join(templatesDir, 'register'));
    var locals = {
      firstName: req.body.firstname,
      lastName:  req.body.lastname,
      email: req.body.email
    };
    
    
    template.render(locals, function (err, results){
      if (err) {
          return console.error(err);
      }
      mailData = {
        From : 'test@gmail.com',
        to : req.body.email,
        subject : results.subject,
        text : results.text,
        html : results.html
        }
     var smtpProtocol = smtp.smtpTransport;
     smtpProtocol.sendMail(mailData, function(error, info){
       
      if (error) {
        res.send({ "status": "Error", "message": error });
      } else {
        return res.send({ "status": "Success", "message": "Data Inserted", "users": user });
      }
    }); 
  });
       }
      });

    } else {
      console.log('email Exists: ', req.body.email);
      return res.send({ "message": "Email exists" });
    }
    //END check Email is registered or not
  });
});


// Start Get users list

const configurationOptions={
  methods:['POST'],
  origin: 'localhost:3000'
}
router.route('/getUsers').get(cors(configurationOptions),function (req, res) {
  User.find({ isdeleted: "false" }, function (err, user) {
    if (err) return res.send({ "status": "Error", "message": err });
    return res.send({ "status": "Success", "message": "User list", "users": user });
  });
});
// END Get users list

//Get by ID
router.get('/getID/:id', function (req, res) {
  User.findById(req.params.id, function (err, user) {
    if (err) return res.send("There was a problem finding the user.");
    if (!user) return res.send("No user found.");
    res.send(user);
  });
});
//END GET by ID

//reset
router.get('/forgot',function(req,res){
  res.render('forgot');
});

router.post('/forgot', function(req, res, next){
    async.waterfall([
      function(done){
        crypto.randomBytes(20, function(err, buf){
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token,done){
        User.findOne({ email: req.body.email},function(err,user){
          if(user){
            return res.send('Account with that email address exists.');
          }
          else
          {
            return res.send('No Account with that email address exists.');
          }
          user.resetPasswordToken=token;
          user.resetPasswordExpires = Date.now() + 360000; //1 hour
  
          user.save(function(err){
            done(err,token,user);
          });
        });
      },
      function(token, user,done){
        var smtpTransport=nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'donotreply.testing.web@gmail.com',
            pass: '5jrC+7G~'
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'donotreply.testing.web@gmail.com',
          subject: 'CarBazaar Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password.',
          'Please click on the following link, or paste this into the browser to complete the process': 'http://'
          + req.header.host + '/reset/' + token + '/n/n' +
          'If you did not request this, pleadse ignore this email and your password will remain unchanged.'
        };
        smtpTransport.sendMail(mailOptions, function(err){
          console.log('Email sent');
          return res.send('success', 'An email has been sent to ' + user.email + 'with further instructions.');
          done(err,'done');
        });
      }
    ], function(err){
      if(err) return next(err);
    });
  });
  


//Start Get user by email
router.route('/getuserbyemail/:email').get(function (req, res) {
  User.find({ "email": req.params.email }, function (err, user) {
    try {
      if (user.length)
        return res.send({ "status": "Success", "message": "User list", "users": user });
      return res.send({ "status": "Error", "message": "data not found" });
    }
    catch (err) {
      res.send({ "status": "Error", "message": err });
      throw err
    }
  });
});
//END Get user by Email

//START Total User Count
router.route('/totalcount').get(function (req, res) {
  User.count({ isdeleted: "false" }, function (err, user) {
    if (!user)
      return res.send({ "status": "Error", "message": "nothing to show", "error": err });
    return res.send({
      "status": "Success", "message": "User list",
      "TotalUsers": user
    });
  });
});
//END Total User Count

//START update user
router.route('/updateuser/:email').put(function (req, res) {
  var myquery = { "email": req.body.email };
  var newvalues = {
    $set: {
      "firstname": req.body.firstname,
      "lastname": req.body.lastname,
      "password": req.body.password,
      "email": req.body.email,
      "isactive": req.body.isactive,
      "isdeleted": req.body.isdeleted,
    }
  };
  User.update(myquery, newvalues, function (err, user) {
    if (err) return res.send({ "status": "Error", "message": err });
    return res.send({ "status": "Success", "message": "User list", "users": user });
  });
});
//END update user

//START REMOVE/Update all users
router.route('/delete/:email').put(function (req, res) {
  var newvalues = { $set: { isdeleted: 'true' } };
  User.update({ "email": req.params.email }, newvalues, function (err, user) {
    if (err) return res.send({ "status": "Error", "message": err });
    return res.send({ "status": "Success", "message": "User list", "users": user });
  });
});
//END REMOVE/Update all users

   //User Login
   router.post('/login', function (req, res) {
    console.log(req.body.email);
    User.findOne({isactive: "true", email: req.body.email }, function (err, user) {
      
      if (err) return res.send('Error on the server.');
      if (!user) return res.send({ msg: "Error",message: error.invalid });
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (err) { 
          return res.send({ msg: err,user: null });
         } else{
           if(isMatch){
          var token = jwt.sign({email:req.body.email,password:req.body.password }, config.secret, {
            expiresIn: 86400 // expires in 24 hours
          });
          user.token=token;
          return res.send({ auth: true, user: user,token:token });
            }  
            return res.send({ msg: err,user: error.invalid });
          }       
    });
  });
});

  //User LogOut
  router.get('/logout', function (req, res) {
    res.status(200).send({ auth: false, token: null });
  });


  // change password 
router.route('/changepassword/:email').post(function (req, res) { 
  User.findOne({ "email": req.params.email },function (err, user) {
  try {
  if (err) return res.send({ "status": "Error", "message": err }); 
  if (!user) return res.status(404).send('No email found.'); 
  user.comparePassword(req.body.oldpassword, (err, isMatch) => {
  if (err) { 
  res.json({ msg: err,statusCode:400,user: null });
  } else{
  
  if(isMatch){
  user.password = req.body.password; 
  user.save(function (err, user) {
  return res.send({ "status": "Success", "message": "Password is changed" });
  });
  }
  
  }
  });
  }
  catch (err) {
  res.send({ "status": "Error", "message": err });
  throw err
  }
  });
  });


  router.route('/sendemail').get(function (req, res) {
    try {
    // "register" is template name
    var template = new EmailTemplate(path.join(templatesDir, 'register'));
    var locals = {
      firstName: 'shweta',
      lastName:  'sachdeva'
    };
    template.render(locals, function (err, results){
      if (err) {
          return console.error(err);
      }
      mailData = {
        From : 'test@gmail.com',
        to : 'akchauhan556@mailinator.com',
        subject : results.subject,
        text : results.text,
        html : results.html
        }
     var smtpProtocol = smtp.smtpTransport;
     smtpProtocol.sendMail(mailData, function(error, info){
      if (error) {
        res.send({ "status": "Error", "message": error });
      } else {
        return res.send({ "status": "Success", "message": "Email Send" });
      }
    }); 
  });
    }
   
    catch (err) {
      res.send({ "status": "Error", "message": err });
      throw err
    }


    //for send email
// GET users listing. /
router.route('/sendemail').get(function (req, res) {
  try {
  // "register" is template name
  var template = new EmailTemplate(path.join(templatesDir, 'register'));
  var locals = {
    firstName: 'Gurpreet',
    lastName: 'Sandhu',
  };
    
  template.render(locals, function (err, results){
    if (err) {
        return console.error(err);
    }
    mailData = {
      From : 'test@gmail.com',
      to : 'shweta@mailinator.com',
      subject : results.subject,
      Text : results.text,
      html : results.html
      }
   var smtpProtocol = smtp.smtpTransport;
   smtpProtocol.sendMail(mailData, function(error, info){
    if (error) {
      res.send({ "status": "Error", "message": error });
    } else {
      return res.send({ "status": "Success", "message": "Email Send" });
    }
  }); 
});
  }
 
  catch (err) {
    res.send({ "status": "Error", "message": err });
    throw err
  }
});





  //   router.route('/auth/forgot_password')
  //   .get(userHandlers.render_forgot_password_template)
  //   .post(userHandlers.forgot_password);

  //   var  hbs = require('nodemailer-express-handlebars'),
  //   email = process.env.MAILER_EMAIL_ID || 'auth_email_address@gmail.com',
  //   pass = process.env.MAILER_PASSWORD || 'auth_email_pass'
  //   nodemailer = require('nodemailer');
  
  // var smtpTransport = nodemailer.createTransport({
  //   service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
  //   auth: {
  //     user: email,
  //     pass: pass
  //   }
  // });
  
  // var handlebarsOptions = {
  //   viewEngine: 'handlebars',
  //   viewPath: path.resolve('./api/templates/'),
  //   extName: '.html'
  // };
  
  // smtpTransport.use('compile', hbs(handlebarsOptions));  });


  // exports.forgot_password = function(req, res) {
  //   async.waterfall([
  //     function(done) {
  //       User.findOne({
  //         email: req.body.email
  //       }).exec(function(err, user) {
  //         if (user) {
  //           done(err, user);
  //         } else {
  //           done('User not found.');
  //         }
  //       });
  //     },
  //     function(user, done) {
  //       // create the random token
  //       crypto.randomBytes(20, function(err, buffer) {
  //         var token = buffer.toString('hex');
  //         done(err, user, token);
  //       });
  //     },
  //     function(user, token, done) {
  //       User.findByIdAndUpdate({ _id: user._id }, { reset_password_token: token, reset_password_expires: Date.now() + 86400000 }, { upsert: true, new: true }).exec(function(err, new_user) {
  //         done(err, token, new_user);
  //       });
  //     },
  //     function(token, user, done) {
  //       var data = {
  //         to: user.email,
  //         from: email,
  //         template: 'forgot-password-email',
  //         subject: 'Password help has arrived!',
  //         context: {
  //           url: 'http://localhost:3000/auth/reset_password?token=' + token,
  //           name: user.fullName.split(' ')[0]
  //         }
  //       };
  
  //       smtpTransport.sendMail(data, function(err) {
  //         if (!err) {
  //           return res.json({ message: 'Kindly check your email for further instructions' });
  //         } else {
  //           return done(err);
  //         }
  //       });
  //     }
  //   ], function(err) {
  //     return res.status(422).json({ message: err });
  //   });
  // };



  // router.route('/auth/reset_password')
  //   .get(userHandlers.render_reset_password_template)
  //   .post(userHandlers.reset_password);

  //   exports.reset_password = function(req, res, next) {
  //     User.findOne({
  //       reset_password_token: req.body.token,
  //       reset_password_expires: {
  //         $gt: Date.now()
  //       }
  //     }).exec(function(err, user) {
  //       if (!err && user) {
  //         if (req.body.newPassword === req.body.verifyPassword) {
  //           user.hash_password = bcrypt.hashSync(req.body.newPassword, 10);
  //           user.reset_password_token = undefined;
  //           user.reset_password_expires = undefined;
  //           user.save(function(err) {
  //             if (err) {
  //               return res.status(422).send({
  //                 message: err
  //               });
  //             } else {
  //               var data = {
  //                 to: user.email,
  //                 from: email,
  //                 template: 'reset-password-email',
  //                 subject: 'Password Reset Confirmation',
  //                 context: {
  //                   name: user.fullName.split(' ')[0]
  //                 }
  //               };
    
  //               smtpTransport.sendMail(data, function(err) {
  //                 if (!err) {
  //                   return res.json({ message: 'Password reset' });
  //                 } else {
  //                   return done(err);
  //                 }
  //               });
  //             }
  //           });
  //         } else {
  //           return res.status(422).send({
  //             message: 'Passwords do not match'
  //           });
  //         }
  //       } else {
  //         return res.status(400).send({
  //           message: 'Password reset token is invalid or has expired.'
  //         });
  //       }

  //  //change password



router.get('/getuserID/:_id', function (req, res) {
  User.findById( req.params._id, function (err, user) {
      if (err) return res.send({"message":"There was a problem finding the user."});
      if (!user) return res.send("No user found.");
       return res.send({ "status": "Success", "message": "User by id", "users": user });
  });
});
  });

 
  router.route('/resetemail/:email').get(function (req, res) {
    try {
    // "register" is template name
    var template = new EmailTemplate(path.join(templatesDir, 'reset'));
    var locals = {
     
      "email" :req.params.email
    };
      
    template.render(locals, function (err, results){
      if (err) {
          return console.error(err);
      }
      mailData = {
        From : 'test@gmail.com',
        to : req.params.email,
        subject : results.subject,
        Text : results.text,
        html : results.html
        }
     var smtpProtocol = smtp.smtpTransport;
     smtpProtocol.sendMail(mailData, function(error, info){
      if (error) {
        res.send({ "status": "Error", "message": error });
      } else {
        return res.send({ "status": "Success", "message": "Email Send" });
      }
    }); 
  });
    }
  
    catch (err) {
      res.send({ "status": "Error", "message": err });
      throw err
    }
  });
  
  
  // REMOVE/Update car's
  router.route('/deletecar/:registration_no').put(function (req, res) {
    var newvalues = { $set: { isdeleted: 'true' } };
    Car.update({ "registration_no": req.params.registration_no }, newvalues, function (err, car) {
      try {
  
        if (err) return res.send({ "status": "Error", "message": err });
        return res.send({ "status": "Success", "message": "Car list", "cars": car });
      }
      catch (err) {
        res.send({ "status": "Error", "message": err });
        throw err
      }
    });
  });


// send reject car status with user 

router.post('/rejectcarrequest/', function (req, res) {
  console.log(req.body);
  try {
  // "carreject" is template name
  var template = new EmailTemplate(path.join(templatesDir, 'carreject'));
  var locals = {
  name: req.body.name,
  email: req.body.email,
  };
  
  template.render(locals, function (err, results){
  if (err) {
  return console.error(err);
  }
  mailData = {
  From : 'test@gmail.com',
  to : req.body.email,
  subject : results.subject,
  Text : results.text,
  html : results.html
  }
  var smtpProtocol = smtp.smtpTransport;
  smtpProtocol.sendMail(mailData, function(error, info){
  if (error) {
  res.send({ "status": "Error", "message": error });
  } else {
  return res.send({ "status": "Success", "message": "Email Send" });
  }
  }); 
  });
  }
  
  catch (err) {
  res.send({ "status": "Error", "message": err });
  throw err
  }
  
  });

  router.route('/updateuserpassword/:email').put(function (req, res) {
    var myquery = { "email": req.params.email };
    var newvalues = {
      $set: {
        "password": req.body.password, 
      }
    };
    User.update(myquery, newvalues, function (err, user) {
      if (err) return res.send({ "status": "Error", "message": err });
      return res.send({ "status": "Success", "message": "User list", "users": user });
    });
  });


  //send car detail eamil on ask for price
//send car detail eamil on ask for price
router.post('/sendcardetail', function (req, res) {
console.log(req.body);
try {

var template = new EmailTemplate(path.join(templatesDir, 'carprice'));
var locals = {
customername: req.body.customername,
customeremail: req.body.customeremail,
customerid: req.body.customerid,
registration_no: req.body.Registration_no,
Manufacturer: req.body.Manufacturer,
Model: req.body.Model,
ownername: req.body.ownername,
owneremail: req.body.owneremail,
ownerid: req.body.ownerid
};

template.render(locals, function (err, results){
if (err) {
return console.error(err);
}
mailData = {
From : 'test@gmail.com',
to : req.body.owneremail,
subject : results.subject,
Text : results.text,
html : results.html
}
var smtpProtocol = smtp.smtpTransport;
smtpProtocol.sendMail(mailData, function(error, info){
if (error) {
res.send({ "status": "Error", "message": error });
} else {
return res.send({ "status": "Success", "message": "Email Sent to admin" });
}
}); 
});
}

catch (err) {
res.send({ "status": "Error", "message": err });
throw err
}


  
  router.route('/changeuserstatus/:email').put(function (req, res) {
    var newvalues = { $set: { isActive: 'true' } };
    User.update({ "email": req.params.email }, newvalues, function (err, user) {
    try {
    if (err) return res.send({ "status": "Error", "message": err });
    return res.send({ "status": "Success", "message": "Email verified" });
    }
    catch (err) {
    res.send({ "status": "Error", "message": err });
    throw err
    }
    });
  });

  });

  

module.exports = router;
