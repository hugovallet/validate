angular.module('taskCtrl', ['taskService'])

	// controller applied to task creation page
.controller('taskCreateController', function(Task) {
	
	var vm = this;

	// function to create a task
	vm.saveTask = function() {
		vm.processing = true;
		vm.message = '';

		// use the create function in the userService
		Task.create(vm.taskData)
			.success(function(data) {
				vm.processing = false;
				vm.taskData = {};
				vm.message = data.message;
			});
			
	};	

})