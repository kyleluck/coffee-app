var express = require('express');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var randtoken = require('rand-token');

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

// list all available grind options
app.get('/options', function(req, res) {
  res.json([
    "Extra coarse",
  	"Coarse",
  	"Medium-coarse",
  	"Medium",
  	"Medium-fine",
  	"Fine",
  	"Extra fine"
  ]);
});

// handle signups
app.post('/signup', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  bcrypt.hash(password, 10, function(err, encryptedPassword) {
    if (err) {
      res.status(400).send({ "status": "fail", "message": err.message });
      return;
    }
    User.findOne({ _id: username }, function(err, user) {
      if (err) {
        res.status(400).send({ "status": "fail", "message": err.message });
        return;
      }
      if (!user) {
        // create user
        User.create({
          _id: username,
          password: encryptedPassword
        }, function(err) {
          if (err) {
            res.status(400).send({ "status": "fail", "message": err.message });
            return;
          }
          res.status(200).send({ "status": "ok" });
        });
      } else {
        // user already exists, send 409
        res.status(409).send({ "status": "fail", "message": "Username is taken" });
      }
    });
  });
});

// handle login
app.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  // find user in database
  User.findOne({ _id: username }, function(err, user) {
    if (err) {
      res.status(400).send({ "status": "fail", "message": "Error finding user " + err.message });
      return;
    }
    // if user isn't found
    if (!user) {
      res.status(400).send({ "status": "fail", "message": "User not found" });
      return;
    } else {
      // compare submitted password with encrypted password in databse
      bcrypt.compare(password, user.password, function(err, matched) {
        if (err) {
          res.status(400).send({ "status": "fail", "message": "Error in bcrypt: " + err.message });
          return;
        }
        // if passwords match, generate token and push to users token array
        if (matched) {
          var token = randtoken.generate(64);
          // set token to expire in 10 days and push to authenticationTokens array
          user.authenticationTokens.push({ token: token, expiration:  Date.now() + 1000 * 60 * 60 * 24 * 10 });
          // save user's new token
          user.save(function(err) {
            if (err) {
              res.status(400).send({ "status": "fail", "message": "Error saving token: " + err.message });
              return;
            }
            // return token in response body
            res.status(200).send({ "status": "ok", "token": token });
          });
        } else {
          // incorrect password
          res.status(400).send({ "status": "fail", "message": "Password doesn't match" });
        }
      });
    }
  });
});

// allows users to order coffee, charges purchases with stripe
app.post('/orders', function(req, res) {
  var token = req.body.token;
  User.findOne(
    //check if token exists and hasn't expired
    { authenticationTokens: { $elemMatch: { token: token, expiration: { $gt: Date.now() } } } },
    function(err, user) {
      //if there was an error finding the user by authenticationToken...
      if (err) {
        res.status(400).send({ "status": "fail", "message": "err.errors" });
        return;
      }
      // found user based on authentication token.
      if (user) {
        // push the order from the request to orders property on the user object
        user.orders.push(req.body.order);
        //save the user to the database
        user.save(function(err) {
          if (err) {
            // construct a more readable error message
            var errorMessage = "";
            for (var key in err.errors) {
              errorMessage += err.errors[key].message + " ";
            }
            res.status(400).send({ "status": "fail", "message": errorMessage });
            return;
          }
          res.status(200).send({ "status": "ok" });
        });
      } else {
        res.status(400).send({ "status": "fail", "message": "Session expired. Please sign in again." });
      }
    }
  );
});

// returns all orders the user has previously submitted
app.get('/orders', function(req, res) {
  //find user by their token
  var token = req.query.token;
  User.findOne(
    //check if token exists and hasn't expired
    { authenticationTokens: { $elemMatch: { token: token, expiration: { $gt: Date.now() } } } },
    function(err, user) {
      //if there was an error finding the user by authenticationToken
      if (err) {
        res.status(400).send({ "status": "fail", "message": err.errors });
        return;
      }
      if (user) {
        //found the user, now respond with an object of all their order history
        var orders = [];
        user.orders.forEach(function(order) {
          orders.push({ "options": order.options, "address": order.address });
        });
        res.status(200).send({ "status": "ok", "message": orders});
      } else {
        res.status(400).send({ "status": "fail", "message": "Session expired. Please sign in again." });
      }
    }
  );
});

app.listen(3000, function() {
  console.log('Listening on 3000...');
});
