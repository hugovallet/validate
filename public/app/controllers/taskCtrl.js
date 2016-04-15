angular.module('taskCtrl', ['ngRoute','taskService','userService'])

	// controller applied to task creation page
.controller('taskCreateController', function($scope,User,Task) {
	
	var vm = this;
	/*
	$scope.friends = [
				  {id:"115464564564-pierre", name: "pierre"},
				  {id: "2646456465465-marie", name:"marie"}
				  ];*/

	User.friends().then(function(friends){
		
		
		$scope.friends = friends.data;
		console.log($scope.friends);
	});
	
	// function to create a task
	vm.saveTask = function() {
		vm.processing = true;
		vm.message = '';
		console.log(vm.taskData);

		// use the create function in the userService
		Task.create(vm.taskData)
			.success(function(data) {
				vm.processing = false;
				vm.taskData = {};
				vm.message = data.message;
			});
			
	};	

})