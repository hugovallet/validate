angular.module('challengeCtrl', ['challengeService'])

//EN CONSTRUCTION

.controller('challengeController', function(Challenge) {

	var vm = this;

	// set a processing variable to show loading things
	vm.processing = true;

	// grab all the challenges at page load
	Challenge.all()
		.success(function(data) {

			// when all the challenges come back, remove the processing variable
			vm.processing = false;

			// bind the challenges that come back to vm.challenges
			vm.challenges = data;
		});

		/*
	// function to delete a challenge EN CONSTRUCTION
	vm.deleteChallenge = function(id) {
		vm.processing = true;

		Challenge.delete(id)
			.success(function(data) {

				// get all challenges to update the table
				// you can also set up your api 
				// to return the list of challenges with the delete call
				Challenge.all()
					.success(function(data) {
						vm.processing = false;
						vm.challenges = data;
					});

			});
	};
	*/

})