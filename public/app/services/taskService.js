angular.module('taskService', [])

.factory('Task', function($http) {

	// create a new object
	var taskFactory = {};

	taskFactory.create = function(challenge_id) {
		return $http.post('/api/users/' + challenge_id+'/tasks');
	};

	return taskFactory;

});