angular.module('challengeService', [])

.factory('Challenge', function($http) {

	// create a new object
	var challengeFactory = {};

	// get a single user
	challengeFactory.get = function(id) {
		return $http.get('/api/challenges/' + id);
	};

	// get the challenges for the currrent user 
	challengeFactory.all = function(){
		return $http.get('/api/challenges/');
	};

	// create a challenge
	challengeFactory.create = function(challengeData) {
		return $http.post('/api/challenges/', challengeData);
	};

	// update a challenge
	challengeFactory.update = function(id, challengeData) {
		return $http.put('/api/challenges/' + id, challengeData);
	};

	// delete a challenge
	challengeFactory.delete = function(id) {
		return $http.delete('/api/challenges/' + id);
	};

	// return our entire challengeFactory object
	return challengeFactory;

});