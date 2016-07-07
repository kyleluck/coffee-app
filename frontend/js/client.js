// define app module
var coffeeApp = angular.module('coffeeApp', ['ngRoute', 'ngCookies']);

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

coffeeApp.controller('HomeController', function($scope) {

});
