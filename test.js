var express = require('express');
var mongoose = require('mongoose');
var Promise = require('bluebird');
mongoose.Promise = Promise; // use bluebird with mongoose

var app = express();

app.get('/', function(req, res) {
  var user = new User({
    _id: "fdjkl",
    password: "123123"
  });

  user.orders.push({
        "options": {
          "grind": "fine",
          "quantity": 0.6
        },
        "address": {
          "deliveryDate": "2016-07-23T04:00:00.000Z",
          "zipCode": "30309",
          "state": "TX",
          "city": "FooBar",
          "address2": null,
          "address": "123 East Main St.",
          "name": "Another name"
        }
      });
  //save the user to the database
  user.save()
    .then(function() {
      //res.status(200).json({ "status": "ok" });
      console.log("OK");
    })
    .catch(function(err) {
      // construct a more readable error message
      console.log(err);
    });

});

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

// connect to the database
mongoose.connect('mongodb://localhost/coffee');

app.listen(3000, function() {
  console.log('listening on 3000...');
});
