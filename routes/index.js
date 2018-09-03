var express = require('express');
var router = express.Router();

var passport = require("passport");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

//reset
var jwt = require('jwt-simple');

var payload = { userId: 1 };
var secret = 'fe1a1915a379f3be5394b64d14794932';
var token = jwt.encode(payload, secret);
var decode = jwt.decode(token, secret);
const bodyParser = require('body-parser');

//reset

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



// router.post('/forgot', function(req, res, next){
//   aync.waterfall([
//     function(done){
//       crypto.randomBytes(20, function(err, buf){
//         var token = buf.toString('hex');
//         done(err, token);
//       });
//     },
//     function(token,done){
//       User.findOne({ email: req.body.email},function(err,user){
//         if(!user){
//           req.flash('error','No account with that email address exists.');
//           return res.redirect('/forgot');
//         }
//         user.resetPasswordToken=token;
//         user.resetPasswordExpires = Date.now() + 360000; //1 hour

//         user.save(function(err){
//           done(err,token,user);
//         });
//       });
//     },
//     function(token, user,done){
//       var smtpTransport=nodemailer.createTransport({
//         service: 'Gmail',
//         auth: {
//           user: 'donotreply.testing.web@gmail.com',
//           pass: '5jrC+7G~'
//         }
//       });
//       var mailOptions = {
//         to: user.email,
//         from: 'donotreply.testing.web@gmail.com',
//         subject: 'CarBazaar Password Reset',
//         text: 'You are receiving this because you (or someone else) have requested the reset of the password.',
//         'Please click on the following link, or paste this into the browser to complete the process': 'http://'
//         + req.header.host + '/reset/' + token + '/n/n' +
//         'If you did not request this, pleadse ignore this email and your password will remain unchanged.'
//       };
//       smtpTransport.sendMail(mailOptions, function(err){
//         console.log('Email sent');
//         req.flash('success', 'An email has been sent to ' + user.email + 'with further instructions.');
//         done(err,'done');
//       });
//     }
//   ], function(err){
//     if(err) return next(err);
//     res.redirect('/forgot');
//   });
// });

// router.get('/reset/:token',function(req,res){
//   User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}},
//   function(err, user) {
//     if (!user) {
//       req.flash('error', 'Password reset token is invalid or has expired.');
//       return res.redirect('/forgot');
//     }
//     res.render('reset', {token: req.params.token});
//   });
// });

// router.post('/reset/:token', function(req, res) {
//   async.waterfall([
//     function(done) {
//       User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
//         if (!user) {
//           req.flash('error', 'Password reset token is invalid or has expired.');
//           return res.redirect('back');
//         }
//         if(req.body.password === req.body.confirm) {
//           user.setPassword(req.body.password, function(err) {
//             user.resetPasswordToken = undefined;
//             user.resetPasswordExpires = undefined;

//             user.save(function(err) {
//               req.logIn(user, function(err) {
//                 done(err, user);
//               });
//             });
//           })
//         } else {
//             req.flash("error", "Passwords do not match.");
//             return res.redirect('back');
//         }
//       });
//     },
//     function(user, done) {
//       var smtpTransport = nodemailer.createTransport({
//         service: 'Gmail', 
//         auth: {
//           user: 'learntocodeinfo@gmail.com',
//           pass: process.env.GMAILPW
//         }
//       });
//       var mailOptions = {
//         to: user.email,
//         from: 'learntocodeinfo@mail.com',
//         subject: 'Your password has been changed',
//         text: 'Hello,\n\n' +
//           'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
//       };
//       smtpTransport.sendMail(mailOptions, function(err) {
//         req.flash('success', 'Success! Your password has been changed.');
//         done(err);
//       });
//     }
//   ], function(err) {
//     res.redirect('/users');
//   });
// });


// //end password





module.exports = router;
