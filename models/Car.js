// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var carSchema = new Schema({

  user : {
    type : Schema.Types.ObjectId,
    ref:'User'
  },
    registration_no: { type: String,required: true, unique: true },
    model: { type: String},
    speedometer: { type: Number}, 
    manufacturer : String,
    cost : Number,
    photopath : String,
    status :{type: String, default: "yes"},
    isactive : {type: Boolean, default: false},
    isdeleted : {type: Boolean, default: false},
    created_at: Date,
    updated_at: Date
  });

  // the schema is useless so far
  // we need to create a model using it
  var Car = mongoose.model('Car', carSchema);
// make this available to our users in our Node applications
module.exports = Car;