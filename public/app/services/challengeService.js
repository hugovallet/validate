angular.module('challengeService', [])

.factory('Challenge', function($http) {

	// create a new object
	var challengeFactory = {};

	// get the challenges for the currrent user 
	challengeFactory.all = function(){
		return $http.get('/api/challenges/');
	};

	// create a challenge
	challengeFactory.create = function(challengeData) {
		return $http.post('/api/challenges/', challengeData);
	};

	// delete a user
	challengeFactory.delete = function(id) {
		return $http.delete('/api/challenges/' + id);
	};

	// return our entire userFactory object
	return challengeFactory;

});