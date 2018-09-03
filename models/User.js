// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var passportLocalMongoose = require('passport-local-mongoose');

//Start Database connection
/*var config = require("../config");
mongoose.Promise = global.Promise;
mongoose.connect(config.database);
//End Database connection*/

// create a schema
var userSchema = new Schema({
  firstname: String,
  lastname: String,
  email: { type: String, required: true, unique: true },
  password: { type: String }, 
  isactive : {type: Boolean, default: false},
  isdeleted : {type: Boolean, default: false},
  created_at: Date,
  updated_at: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

// the schema is useless so far
// we need to create a model using it




//Start Encrypting Password
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { 
    return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});
//End Encrypting Password

/**
 * Helper method for validating user's password.
 */
//Start matching password
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};
//End matching password

//userSchema.plugin(passportLocalMongoose)

var User = mongoose.model('User', userSchema);
// make this available to our users in our Node applications
module.exports = User;