// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');
// const expressValidator = require('express-validator');

// //Start Database connection
// var mongoose = require("mongoose");
// var config = require("./config");
// mongoose.Promise = global.Promise;
// mongoose.connect(config.database, { useNewUrlParser: true })
// .then(() =>  console.log('connection succesful'))
// .catch((err) => console.error(err));
// //End Database connection

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var carsRouter = require('./routes/cars');


// var cors = require('cors');
// var app = express();
// //enables cors
// app.use(cors());


// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(expressValidator());

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
// app.use('/cars', carsRouter);


// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);


//   res.render('error');
// });

// module.exports = app;


var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressValidator = require('express-validator');
var cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var carsRouter = require('./routes/cars');
//Start Database connection
// load mongoose package
var mongoose = require("mongoose");
//Call config file
var config = require("./config");
// Use native Node promises
mongoose.Promise = global.Promise;

mongoose.connect(config.database)
.then(() =>  console.log('connection succesful'))
.catch((err) => console.error(err));
//End Database connection


var app = express();
app.use(cors())
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressValidator());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/cars', carsRouter);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
