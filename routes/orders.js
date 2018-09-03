var express= require('express');
var router= express.Router();
var Order = require('../models/Order');

router.route('/addorder').post(function (req, res) {
  
    var newOrder = new Order({
      "user": req.body.userid,
      "registration_no": req.body.registration_no,
      "model": req.body.model,
      "speedometer": req.body.speedometer,
      "manufacturer": req.body.manufacturer
    });

    newOrder.save(function (err, order) {
      try {
        if (err) return res.send({ "status": "Error", "message":err});
        return res.send({ "status": "Success", "message": "Data Instered", "cars": order });
      }
      catch (err) {
        return res.send({ "status": "Error", "message": err });
        throw err
      }
    });
});
  
  module.exports = router;