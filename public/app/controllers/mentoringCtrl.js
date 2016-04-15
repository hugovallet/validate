angular.module('mentoringCtrl', ['mentoringService','challengeService'])

//EN CONSTRUCTION

.controller('mentoringController', function(Mentoring,Challenge) {

	var vm = this;

	// set a processing variable to show loading things
	vm.processing = true;

	Mentoring.all()
		.success(function(data) {

			// when all the users come back, remove the processing variable
			vm.processing = false;

			// bind the users that come back to vm.users
			vm.mentorings = data;
		});

	vm.validateMentoring = function(challenge_id,task_id){
		vm.processing = true;
		Challenge.validate(challenge_id,task_id).success(function(data){
			vm.processing = false;
		})

	};

});
			