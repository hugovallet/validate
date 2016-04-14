angular.module('taskService', ['ngRoute'])

.factory('Task', function($http, $routeParams) {

	// create a new object
	var taskFactory = {};
	var challenge_id = $routeParams.challenge_id;


	taskFactory.create = function(data) {
		return $http.post('/api/challenges/' +  $routeParams.challenge_id +'/tasks', data);
	};

	return taskFactory;

});