var express = require('express');
var router = express.Router();
var Car = require('../models/Car');
var error = require('../error');
var multer = require('multer');

// var storage = multer.diskStorage({
//     destination:'../carbazarapp/src/assets/images',
//     filename: function (req, file, cb) {
//       var fileSplit = file.originalname.split(".");
// var filename = file.originalname; 
// var fileLength = fileSplit.length;
// var extension = fileSplit[fileLength-1];
// filename = filename.replace("."+extension,"-");
// cb( null, filename+ Date.now()+"."+extension);
//     }
//   })
   
//   var upload = multer({ storage: storage }).single('images');
//   router.post('/addcar', function (req, res) {
//   console.log(req.file);
//   upload(req, res, function (err) {
//     if (err)
//      {
//       // An error occurred when uploading
//       console.log(err);
//     }

//     var newCar = new Car({
//       "user": req.body.userid,
//       "registration_no": req.body.registration_no,
//       "model": req.body.model,
//       "speedometer": req.body.speedometer,
//       "manufacturer": req.body.manufacturer,
//       "photopath":req.file.filename,
//       "cost": req.body.cost
//     });


//     var currentDate = new Date();
//     newCar.created_at = currentDate;
//     newCar.updated_at = currentDate;

//     newCar.save(function (err, car) {
//       try {
//         if (err) return res.send({ "status": "Error", "message": "Registration Number already Exists" });
//         return res.send({ "status": "Success", "message": "Data Inserted", "cars": car, "path" : req.file.path });
//       }
//       catch (err) {
//         res.send({ "status": "Error", "message": err });
//         throw err
//       }
//     });

//     // Everything went fine
//   })
// });

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});



//Start Get car by id
router.route('/getcarbyuser/:userid').get(function (req, res) {
  Car.find({ user: req.params.userid, "isdeleted": false }).populate('user', ['firstname', 'lastname']).exec(function (err, Car) {
    if (err) return res.send({ "message": "There was a problem finding the user." });
    if (!Car) return res.send("No user found.");
    return res.send({ "status": "Success", "message": "Car by id", "cars": Car });
  });
});
//END Get car by id

// REMOVE/Update car's
router.route('/deletecar/:registration_no').put(function (req, res) {
  var newvalues = { $set: { isdeleted: 'true' } };
  Car.update({ "registration_no": req.params.registration_no }, newvalues, function (err, car) {
    // User.update({fname:"Gurpreet"}, {$set: {lname:"SIDHU",email:"SIDHU@gmail.com"}},function (err, user) {
    try {
      if (err) return res.send({ "status": "Error", "message": err });
      return res.send({ "status": "Success", "message": "Car Delete successfully!!", "cars": car });
    }
    catch (err) {
      res.send({ "status": "Error", "message": err });
      throw err
    }
  });
});

//Start Get car by reg
router.route('/getcarbyreg/:registration_no').get(function (req, res) {
  Car.find({ "registration_no": req.params.registration_no }, function (err, car) {
    try {
      if (car.length)
        return res.send({ "status": "Success", "message": "Car list", "cars": car });
      return res.send({ "status": "Error", "message": "data not found" });
    }
    catch (err) {
      res.send({ "status": "Error", "message": err });
      throw err
    }
  });
});
//END Get car by reg


router.route('/getCars/get').get(function (req, res) {
  Car.find(function (err, car) {
    if (err) return res.send({ "status": "Error", "message": err });
    return res.send({ "status": "Success", "message": "Car lists", "cars": car });
  });
});

// Start Get cars list
router.route('/getCars').get(function (req, res) {
  Car.find({ isdeleted: "false" }, function (err, car) {
    if (err) return res.send({ "status": "Error", "message": err });
    return res.send({ "status": "Success", "message": "Car lists", "cars": car });
  });
});
// END Get cars list

//START update car
router.route('/updatecar/:registration_no').put(function (req, res) {
  var myquery = { "registration_no": req.params.registration_no };
  var newvalues = {
    $set: {
      "model": req.body.model, "manufacturer": req.body.manufacturer,
    }
  };
  Car.update(myquery, newvalues, function (err, Car) {
    if (err) return res.send({ "status": "Error", "message": err });
    return res.send({ "status": "Success", "message": "Carlist", "Cars": Car });
  });
});
//END update car


// Update car's status
router.route('/updateCarStatus/:registration_no').put(function (req, res) {
  Car.findOne({ "registration_no": req.params.registration_no },
    function (err, car) {

      if (err) return res.send("There was a problem finding the car.");
      if (!car) return res.send("No found.");

      if (car.status == 'accepted') {
        return res.send({ "status": "Success", "message": "A link expired" });
      }
      var newvalues = { $set: { status: 'accepted' } };
      Car.update({ "registration_no": req.params.registration_no, "isdeleted": "false" }, newvalues, function (err, car) {
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

});

//GetByID
router.get('/getByID/:_id', function (req, res) {
  Car.findById(req.params._id, function (err, Car) {
    if (err) return res.send({ "message": "There was a problem finding the car." });
    if (!Car) return res.send("No car found.");
    return res.send({ "status": "Success", "message": "Car by id", "cars": Car });

  }).populate('user', ['firstname', 'lastname']);
});


module.exports = router;

