angular.module('challengeCtrl', ['challengeService'])

//EN CONSTRUCTION

.controller('challengeController', function(Challenge) {

	var vm = this;

	// set a processing variable to show loading things
	vm.processing = true;

	// grab all the challenges at page load
	Challenge.all().success(function(data) {
			
	vm.challenges={};	
			
			

			for (var i = 0; i < data.length; i++) {
				(function(i,vm,data){


				var id = data[i]._id;
				
				
				Challenge.get_tasks(id).success(function(data2){

					vm.challenges[i]=data[i];
					vm.challenges[i].tasks = data2;
					
				});



				})(i,vm,data);
			
		}

			console.log("list"+vm.challenges);

			// when all the challenges come back, remove the processing variable
			vm.processing = false;
			
			
	});
	// function to delete a challenge
	
	vm.deleteChallenge = function(id) {
		vm.processing = true;

		Challenge.delete(id)
			.success(function(data) {

				Challenge.all()
					.success(function(data) {
						vm.processing = false;
						vm.challenges = data;
					});

			});
	};	

})	

	// controller applied to challenge creation page
.controller('challengeCreateController', function(Challenge) {
	
	var vm = this;

	// variable to hide/show elements of the view
	// differentiates between create or edit pages
	vm.type = 'create';

	// function to create a challenge
	vm.saveChallenge = function() {
		vm.processing = true;
		vm.message = '';

		// use the create function in the userService
		Challenge.create(vm.challengeData)
			.success(function(data) {
				vm.processing = false;
				vm.challengeData = {};
				vm.message = data.message;
			});
			
	};	

})

// controller applied to challenge edit page
.controller('challengeEditController', function($routeParams, Challenge) {

	var vm = this;

	// variable to hide/show elements of the view
	// differentiates between create or edit pages
	vm.type = 'edit';

	// get the challenge data for the challenge you want to edit
	// $routeParams is the way we grab data from the URL
	Challenge.get($routeParams.challenge_id)
		.success(function(data) {
			vm.challengeData = data;
		});

	// function to save the user
	vm.saveChallenge = function() {
		vm.processing = true;
		vm.message = '';

		// call the userService function to update 
		Challenge.update($routeParams.challenge_id, vm.challengeData)
			.success(function(data) {
				vm.processing = false;

				// clear the form
				vm.challengeData = {};

				// bind the message from our API to vm.message
				vm.message = data.message;
			});
	};

});

