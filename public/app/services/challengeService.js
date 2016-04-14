angular.module('challengeService', ['ngRoute'])

.factory('Challenge', function($http,$route) {

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

	// get challenge's tasks
	challengeFactory.get_tasks = function(id) {
		return $http.get('/api/challenges/' + id + '/tasks/');
	};

	// get challenge's tasks
	challengeFactory.validate = function(challenge_id,task_id) {
		$route.reload();
		return $http.put('/api/challenges/' + challenge_id + '/tasks/'+ task_id);
	};

	// return our entire challengeFactory object
	return challengeFactory;

});