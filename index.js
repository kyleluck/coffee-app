var express = require('express');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var app = express();

// connect to the database
mongoose.connect('mongodb://localhost/coffee');

// mongodb model for users
var User = mongoose.model('User', {
  _id: { type: String, required: true },
  password: { type: String, required: true }
});

// use body parser with JSON
app.use(bodyParser.json());

// GET /options/list - list all available grind options
app.get('/options/list', function(req, res) {
  res.send('Hello World');
});

// handle signups
app.post('/signup', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({ _id: username }, function(err, user) {
    if (err) {
      return console.error(err.message);
    }
    if (!user) {
      // create user
      
    } else {
      // user already exists, send 409
      res.status(409);
    }
  });
});

// handle login
app.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({ _id: username }, function(err, user) {
    if (err) {
      return console.error(err.message);
    }
    if (!user) {
      res.send('User not found');
    } else {
      if (user.password === password) {
        res.send('Authenticated');
      } else {
        res.send('Login failed');
      }
    }
  });
});

// allows users to order coffee, charges purchases with stripe
app.post('/orders', function(req, res) {

});

// returns all orders the user has previously submitted
app.get('/orders', function(req, res) {

});

app.listen(3000, function() {
  console.log('Listening on 3000...');
});
