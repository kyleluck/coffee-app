// define app module with ngRoute and ngCookies dependencies
var coffeeApp = angular.module('coffeeApp', ['ngRoute', 'ngCookies', 'ngMessages']);

var API = "http://localhost:8000";

var order = {
  quantity: 0,
  grindType: ""
};

// define routing
coffeeApp.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'HomeController',
      templateUrl: 'home.html'
    })
    .when('/options/', {
      controller: 'OptionsController',
      templateUrl: 'options.html'
    })
    .when('/delivery', {
      controller: 'DeliveryController',
      templateUrl: 'delivery.html'
    })
    .when('/payment', {
      controller: 'PaymentController',
      templateUrl: 'payment.html'
    })
    .when('/thankyou', {
      controller: 'ThankyouController',
      templateUrl: 'thankyou.html'
    })
    .when('/login', {
      controller: 'LoginController',
      templateUrl: 'login.html'
    })
    .when('/register', {
      controller: 'RegisterController',
      templateUrl: 'register.html'
    })
    .otherwise({ redirectTo: '/'});
});

coffeeApp.run(function($rootScope, $location, $cookies) {
  $rootScope.$on('$locationChangeStart', function(event, nextUrl, currentUrl) {
    // console.log('next url', nextUrl, 'current url', currentUrl);
    // console.log('nextUrl split', nextUrl.split('/'));
    var path = nextUrl.split('/')[4];
    // if user is going to a restricted area and doesn't have a token stored in a cookie, redirect to the login page
    var token = $cookies.get('token');
    if (!token && (path === 'delivery' || path === 'options' || path === 'payment')) {
      $rootScope.goHere = path;
      $location.path('/login');
    }
  });
});

coffeeApp.controller('HomeController', function($scope, $location) {
  // directToOptions function redirect the user to /options
  $scope.directToOptions = function(){
    $location.path("/options");
  };
});

coffeeApp.controller('OptionsController', function($scope, $http, $location) {
  // call the backend to receive a list of coffee type options
  $http.get(API + '/options')
    .then(function(response) {
      // attach the array of coffee type options to the scope
      $scope.options = response.data;
    })
    .catch(function(err) {
      console.error(err);
    });

  $scope.orderIndividual = function() {
    order.quantity = $scope.quantityInd;
    order.grindType = $scope.grindTypeInd;
    order.frequency = $scope.frequencyInd;
    order.amount = $scope.quantityInd * 20;
    $location.path("/delivery");
  };

  $scope.orderFamily = function() {
    order.quantity = $scope.quantityFam;
    order.grindType = $scope.grindTypeFam;
    order.frequency = $scope.frequencyFam;
    order.amount = $scope.quantityFam * 20;
    $location.path("/delivery");
  };

});

coffeeApp.controller('DeliveryController', function($scope, $location) {
  $scope.processDeliveryInfo = function() {
    // attach form field inputs to the scope
    order.fullname = $scope.fullname;
    order.address1 = $scope.address1;
    if ($scope.address2 === undefined) {
      $scope.address2 = "N/A";
    }
    order.address2 = $scope.address2;
    order.city = $scope.city;
    order.state = $scope.state;
    order.zipcode = $scope.zipcode;
    order.date = $scope.date;

    // redirect to payment page
    $location.path("/payment");

  };
});

coffeeApp.controller('PaymentController', function($scope, $http, $location, $cookies) {
  // attach current order information to scope
  $scope.order = order;
  var amount = order.amount;
  var userToken = $cookies.get('token');

  $scope.processPayment = function() {
    //stripe
    // Creates a CC handler which could be reused.
    var handler = StripeCheckout.configure({
      // my testing public publishable key
      key: 'pk_test_kRwESRwnQ8TEmXsuiOIRyHgP',
      locale: 'auto',
      // once the credit card is validated, this function will be called
      token: function(token) {
        // Make the request to the backend to actually make a charge
        // This is the token representing the validated credit card
        var tokenId = token.id;
        $http.post(API + '/charge', { amount: amount, token: tokenId })
          .then(function(data) {
            console.log('Charge:', data);
            // alert('You were charged $' + (data.data.charge.amount / 100));
            $location.path('/thankyou');
          })
          .catch(function(err) {
            //alert user of error
          });
      }
    });
    // open the handler - this will open a dialog
    // with a form with it to prompt for credit card
    // information from the user
    handler.open({
      name: 'DC Roasters',
      description: 'Pay via Stripe...',
      amount: amount
    });

    //save order to the database
    $http.post(API + '/orders', { order: order, token: userToken })
      .then(function(response) {
        //do nothing
      })
      .catch(function(err) {
        //handle error
        console.log(err);
      });
  };
});

coffeeApp.controller('LoginController', function($scope, $http, $location, $rootScope, $cookies) {
  $scope.login = function() {
    if ($scope.loginForm.$valid) {
      $http.post(API + '/login', { username: $scope.username, password: $scope.password })
        .then(function(response) {
          // if login is a success, redirect
          if (response.status === 200) {
            $scope.loginFailed = false;
            // set a cookie with the token from the database response
            $cookies.put('token', response.data.token);
            // redirect to the page they were trying to go to
            $location.path('/' + $rootScope.goHere);
          }
        })
        .catch(function(err) {
          // tell user login wasn't successful
          $scope.loginFailed = true;
        });
    }
  };
  $scope.registration = function(){
    $location.path("/register");
  };
});


coffeeApp.controller("ThankyouController", function($location, $scope){
  // Redirecting the customer to options page
  $scope.directToOptions = function(){
    $location.path("/options");
  };
});

coffeeApp.controller('RegisterController', function($scope, $location, $http) {
  $scope.register = function() {
    $http.post(API + '/signup', { username: $scope.username, password: $scope.password })
      .then(function(response) {
        if (response.status === 200) {
          // user successfully created
          $scope.registered = true;
        }
      })
      .catch(function(err) {
        console.log(err);
      });
  };

  // if they've registered and clicked the login button, redirect to the login page
  $scope.redirectToLogin = function() {
    $location.path('/login');
  };
});
