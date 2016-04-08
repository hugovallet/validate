angular.module('challengeService', [])

.factory('Challenge', function($http) {

	// create a new object
	var challengeFactory = {};

	// get the challenges for the currrent user XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
	challengeFactory.get_challenges = function(){
		return $http.get('/api/challenges');
	}

	// return our entire userFactory object
	return challengeFactory;

});