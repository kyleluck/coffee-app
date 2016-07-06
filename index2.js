var express = require('express');
var bcrypt = require('bcrypt-as-promised');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var randtoken = require('rand-token');
var Promise = require('bluebird');
mongoose.Promise = Promise; // use bluebird with mongoose

var app = express();

// connect to the database
mongoose.connect('mongodb://localhost/coffee');

// mongodb model for users
var User = mongoose.model('User', {
  _id: { type: String, required: true },
  password: { type: String, required: true },
  authenticationTokens: [{ token: String, expiration: Date }],
  orders: [{
    "options": {
      "grind": { type: String, required: true },
      "quantity": { type: Number, required: true }
    },
    "address": {
      "name": { type: String, required: true },
      "address": { type: String, required: true },
      "address2": String,
      "city": { type: String, required: true },
      "state": { type: String, required: true },
      "zipCode": { type: String, required: true },
      "deliveryDate": { type: Date, required: true }
    }
  }]
});

// use body parser with JSON
app.use(bodyParser.json());



// allows users to order coffee, charges purchases with stripe
app.post('/orders', authRequired, function(req, res) {
  // user is authenticated
  // push the order from the request to orders property on the user object
  var user = req.user;
  user.orders.push(req.body.order);
  //save the user to the database
  user.save()
    .then(function() {
      res.status(200).json({ "status": "ok" });
      return null;
    })
    .catch(function(err) {
      // construct a more readable error message
      var errorMessage = "";
      for (var key in err.errors) {
        errorMessage += err.errors[key].message + " ";
      }
      res.status(400).json({ "status": "fail", "message": errorMessage });
    });
});

// function to handle authentication
function authRequired(req, res, next) {
  // assign token variable depending on if it's a GET or POST
  var token = req.query.token ? req.query.token : req.body.token;
  User.findOne(
    //check if token exists and hasn't expired
    { authenticationTokens: { $elemMatch: { token: token, expiration: { $gt: Date.now() } } } })
    .then(function(user) {
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(400).json({ "status": "fail", "message": "Session expired. Please sign in again." });
      }
    })
    .catch(function(err) {
      //if there was an error finding the user by authenticationToken
      res.status(400).json({ "status": "fail", "message": err.errors });
    });
}

app.listen(3000, function() {
  console.log('Listening on 3000...');
});
