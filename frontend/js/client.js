// define app module
var coffeeApp = angular.module('coffeeApp', ['ngRoute', 'ngCookies']);

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
    $location.path("/delivery");
  };

  $scope.orderFamily = function() {
    order.quantity = $scope.quantityFam;
    order.grindType = $scope.grindTypeFam;
    $location.path("/delivery");  };
});

coffeeApp.controller('DeliveryController', function() {
  
});
