require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("✅ MongoDB connected"))

var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var workoutRouter = require('./routes/workouts');
var consultationsRoute = require('./routes/consultations');
var recipeRouter = require('./routes/recipes');

var app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // folder for your .ejs files

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors());



app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/workouts', workoutRouter);
app.use('/consultations', consultationsRoute);
app.use('/recipes', recipeRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});
module.exports = app;
