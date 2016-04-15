angular.module('mentoringService', ['ngRoute'])

.factory('Mentoring', function($http) {

	// create a new object
	var taskFactory = {};


	taskFactory.all = function() {
		return $http.get('/api/mentorings/');
	};

	return taskFactory;

});