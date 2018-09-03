// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderSchema = new Schema({

  user : {
    type : Schema.Types.ObjectId,
    ref:'User'
  },
    registration_no: { type: String},
    model: { type: String},
    speedometer: { type: Number}, 
    manufacturer : String,
    cost : Number,
    owner: String
  });

  // the schema is useless so far
  // we need to create a model using it
  var Order = mongoose.model('Order', orderSchema);
// make this available to our users in our Node applications
module.exports = Order;