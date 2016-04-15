angular.module('userApp', ['ngAnimate', 'ngRoute','app.routes', 'authService', 'mainCtrl', 'userCtrl', 'userService','challengeService','challengeCtrl','taskService','taskCtrl','mentoringService','mentoringCtrl'])

// application configuration to integrate token into requests
.config(function($httpProvider) {

	// attach our auth interceptor to the http requests
	$httpProvider.interceptors.push('AuthInterceptor');

});	