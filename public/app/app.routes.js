angular.module('app.routes', ['ngRoute'])

.config(function($routeProvider, $locationProvider) {

	$routeProvider

		// route for the home page
		.when('/', {
			templateUrl : 'app/views/pages/home.html'
		})
		
		// login page
		.when('/login', {
			templateUrl : 'app/views/pages/login.html',
   			controller  : 'mainController',
    		controllerAs: 'login'
		})
		
		// show all users
		.when('/users', {
			templateUrl: 'app/views/pages/users/all.html',
			controller: 'userController',
			controllerAs: 'user'
		})

		// form to create a new user
		// same view as edit page
		.when('/users/create', {
			templateUrl: 'app/views/pages/users/single.html',
			controller: 'userCreateController',
			controllerAs: 'user'
		})

		// page to edit a user
		.when('/users/:user_id', {
			templateUrl: 'app/views/pages/users/single.html',
			controller: 'userEditController',
			controllerAs: 'user'
		})

		// show all challenges
		.when('/challenges', {
			templateUrl: 'app/views/pages/challenges/all.html',
			controller: 'challengeController',
			controllerAs: 'challenge',
		})

		// form to create a new challenge
		// same view as edit page
		.when('/challenges/create', {
			templateUrl: 'app/views/pages/challenges/challengeCreate.html',
			controller: 'challengeCreateController',
			controllerAs: 'challenge'
		})

		// page to edit a challenge
		.when('/challenges/:challenge_id', {
			templateUrl: 'app/views/pages/challenges/challengeCreate.html',
			controller: 'challengeEditController',
			controllerAs: 'challenge'
		})

		// page to create a task
		.when('/challenges/:challenge_id/tasks/create', {
			templateUrl: 'app/views/pages/tasks/taskCreate.html',
			controller: 'taskCreateController',
			controllerAs: 'task'
		})

		// show all mentorings
		.when('/mentorings', {
			templateUrl: 'app/views/pages/mentoring/all_mentorings.html',
			controller: 'mentoringController',
			controllerAs: 'mentoring',
		});




	$locationProvider.html5Mode(true);

});
