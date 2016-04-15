var bodyParser = require('body-parser'); 	// get body-parser
var User       = require('../models/user');
var Challenges = require('../models/challenge');
var Tasks      = require('../models/task');
var jwt        = require('jsonwebtoken');
var config     = require('../../config');
var async      = require('async');

// super secret for creating tokens
var superSecret = config.secret;

module.exports = function(app, express) {

	var apiRouter = express.Router();

	// route to generate sample user
	apiRouter.post('/sample', function(req, res) {

		// look for the user named chris
		User.findOne({ 'username': 'chris' }, function(err, user) {

			// if there is no chris user, create one
			if (!user) {
				var sampleUser = new User();

				sampleUser.name = 'Chris';  
				sampleUser.username = 'chris'; 
				sampleUser.password = 'supersecret';

				sampleUser.save();
			} else {
				console.log(user);

				// if there is a chris, update his password
				user.password = 'supersecret';
				user.save();
			}

		});

	});

	// route to authenticate a user (POST http://localhost:8080/api/authenticate)
	apiRouter.post('/authenticate', function(req, res) {

	  // find the user
	  User.findOne({
	    username: req.body.username
	  }).select('name username password').exec(function(err, user) {

	    if (err) throw err;

	    // no user with that username was found
	    if (!user) {
	      res.json({ 
	      	success: false, 
	      	message: 'Authentication failed. User not found.' 
	    	});
	    } else if (user) {

	      // check if password matches
	      var validPassword = user.comparePassword(req.body.password);
	      if (!validPassword) {
	        res.json({ 
	        	success: false, 
	        	message: 'Authentication failed. Wrong password.' 
	      	});
	      } else {

	        // if user is found and password is right
	        // create a token
	        var token = jwt.sign({
	        	_id: user._id,                                                   //STOCK l'ID du user dans le token
	        	name: user.name,
	        	username: user.username
	        }, superSecret, {
	          expiresInMinutes: 1440 // expires in 24 hours
	        });

	        // return the information including token as JSON
	        res.json({
	          success: true,
	          message: 'Enjoy your token!',
	          token: token
	        });
	      }   

	    }

	  });
	});

	// route middleware to verify a token
	apiRouter.use(function(req, res, next) {
		// do logging
		console.log('Somebody just came to our app!');

	  // check header or url parameters or post parameters for token
	  var token = req.body.token || req.query.token || req.headers['x-access-token'];

	  // decode token
	  if (token) {

	    // verifies secret and checks exp
	    jwt.verify(token, superSecret, function(err, decoded) {      

	      if (err) {
	        res.status(403).send({ 
	        	success: false, 
	        	message: 'Failed to authenticate token.' 
	    	});  	   
	      } else { 
	        // if everything is good, save to request for use in other routes
	        req.decoded = decoded;
	            
	        next(); // make sure we go to the next routes and don't stop here
	      }
	    });

	  } else {

	    // if there is no token
	    // return an HTTP response of 403 (access forbidden) and an error message
   	 	res.status(403).send({ 
   	 		success: false, 
   	 		message: 'No token provided.' 
   	 	});
	    
	  }
	});

	// test route to make sure everything is working 
	// accessed at GET http://localhost:8080/api
	apiRouter.get('/', function(req, res) {
		res.json({ message: 'hooray! welcome to our api!' });	
	});

	// on routes that end in /users
	// ----------------------------------------------------
	apiRouter.route('/users')

		// create a user (accessed at POST http://localhost:8080/users)
		.post(function(req, res) {
			
			var user = new User();		// create a new instance of the User model
			user.name = req.body.name;  // set the users name (comes from the request)
			user.username = req.body.username;  // set the users username (comes from the request)
			user.password = req.body.password;  // set the users password (comes from the request)
			user.credit = 50; //POUR CETTE VERSION TEST, CHAQUE NOUVEL UTILISATEUR SE VOIT OFFRIR 50e A LA CREATION DU COMPTE
			user.friend = req.body.friend; //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

			user.save(function(err) {
				if (err) {
					// duplicate entry
					if (err.code == 11000) 
						return res.json({ success: false, message: 'A user with that username already exists. '});
					else 
						return res.send(err);
				}

				// return a message
				res.json({ message: 'User created!' });
			});

		})

		
		// get all the users (accessed at GET http://localhost:8080/api/users)
		.get(function(req, res) {

			User.find({}, function(err, users) {
				if (err) res.send(err);

				// return the users
				res.json(users);
			});
		});
	


	//ON ROUTES THAT END IN CHALLENGES !
	apiRouter.route('/challenges')
		//cette fonction va chercher l'identité de l'utilisateur stockée dans son token puis l'utilise pour lui créer un nouveau challenge

		.post(function(req,res){
			var challenge = new Challenges();
			var user_id = req.decoded._id;
			

			challenge.title = req.body.title;
			challenge.amount = req.body.amount; //ATTENTION IL FAUDRA CHECKER QUE LE MEC A SUFFISAMENT de crédit EN STOCK et aussi débiter le stock du gars après création
			challenge.due_date = req.body.due_date; //Attention il faudra que cette date soit bien stockée dans le format "date" de javascript pour éviter les problèmes après...
			challenge.theme = req.body.theme;
			challenge.proprietary_user_id = user_id;
			challenge.points = 0; //au début, quand le challenge est créé le mec à zéros points.
			challenge.total_points = 0; //tant que le mec à pas rajouté des tâches le score max est à zéro aussi.

			//Chercher le nombre de crédits dispo sur le compte user, ensuite créer le challenge si suffisament de crédits
			User.find({"_id":user_id},{"_id":0,"credit":1}, function(err, result){
            	var cash = result[0].credit;
           		console.log('Available user cash : ' + cash);
            
				if(cash<challenge.amount) res.send({message:"Not enough credits available"});
				else{
					//Sauver le nouveau challenge dans la DB des challenges
					challenge.save(function(err) {
						if (err) res.send(err);
						// return a message
						res.json({ message: 'Challenge created!' });
					
					//enlever des crédits à l'utilisateur concerné
					var new_credit = cash - challenge.amount;
					console.log("New value : "+new_credit);
					User.update({ "_id" : user_id },{ $set: { "credit": new_credit} }, function(err, results) {       
					   });
					});

				}
			})
		
		})



		//cette fonction va chercher l'identité de l'utilisateur stockée dans son token puis l'utilise pour charger les challenges de l'utilisateur
		//FAUDRA FAIRE UN TRUC ICI POUR CHARGER LES TACHES ASSOCIEES AU CHALLENGE
		.get(function(req, res) {
			var user_id = req.decoded._id;
			Challenges.find({"proprietary_user_id":user_id}, function(err, challenges) {                     
				if (err) res.send(err);

				//return matching challenges
				res.json(challenges);
			});
		});







	//on routes that end in /challenges/:challenge_id
	// --------------------------------------------------------
	apiRouter.route('/challenges/:challenge_id')
		// get the challenge with that id
		.get(function(req, res) {
			Challenges.findById(req.params.challenge_id, function(err, challenge) {
				if (err) res.send(err);

				// return that challenge
				res.json(challenge);
			});
		})

		// update the challenge with this id
		.put(function(req, res) {
			Challenges.findById(req.params.challenge_id, function(err, challenge) {

				if (err) res.send(err);

				// set the new challenge information if it exists in the request
				if (req.body.title) challenge.title = req.body.title;
				if (req.body.amount) challenge.amount = req.body.amount;
				if (req.body.due_date) challenge.due_date = req.body.date;
				if (req.body.theme) challenge.theme = req.body.theme;

				// save the user
				challenge.save(function(err) {
					if (err) res.send(err);

					// return a message
					res.json({ message: 'Challenge updated!' });
				});

			});
		})

		// delete the challenge with this id
		.delete(function(req, res) {
			
			Challenges.find({"_id":req.params.challenge_id},{"_id":0,"amount":1}, function(err, result1){
				if (err) res.send(err);
            	var amount = result1[0].amount;    

				User.find({"_id":req.decoded._id},{"_id":0,"credit":1}, function(err, result2){
					if (err) res.send(err);
		        	var cash = result2[0].credit;
					var updated_cash = cash + amount;
					//remettre des crédits à l'utilisateur concerné
					User.update({ "_id" : req.decoded._id },{ $set: { "credit": updated_cash} }, function(err, results) {  });

					Challenges.remove({	_id: req.params.challenge_id}, function(err, challenge) {
						if (err) res.send(err);
						res.json({ message: 'Challenge successfully deleted, credited '+amount+"euros on user "+req.decoded._id});
					});

				});
				
					
				
			});

				
			
		});

	// on routes that end in /challenges/:challenge_id/tasks
	// --------------------------------------------------------
	apiRouter.route('/challenges/:challenge_id/tasks')

		//permet de créer une nouvelle tache
		.post(function(req,res){
			var task = new Tasks();
			var user_id = req.decoded._id;
			var challenge_id = req.params.challenge_id;
			console.log('Challenge : ' + challenge_id);

			task.description = req.body.description;
			task.friend = req.body.friend;
			task.proprietary_challenge_id = req.params.challenge_id;
			task.proprietary_user_id = user_id;
			task.proprietary_user_username = req.decoded.username;
			task.validation = "no_val";

			/*User.update({ "_id" : user_id },{ $set: {"friend": req.body.friend} }, function(err, results) {  //xxxxxxx MARCHE MAIS JE VOUDRAIS METTRE A LA SUITE TOUS LES AMIS
			});*/
			
			//On cherche le challenge associé pour récupérer le nombre total de points en cours
			Challenges.find({"_id":challenge_id},{"_id":0,"total_points":1}, function(err, challenge) {                     
				if (err) res.send(err);
				//On stock le nombre actuel de points total
				var points = challenge[0].total_points; 
				//on rajoute 3 point au nombre max de points actuel
				Challenges.update({ "_id" : challenge_id },{ $set: { "total_points": points + 3} }, function(err, results) {  });
				//Ensuite on peut sauver la nouvelle task dans la DB des tasks
				task.save(function(err) {
					if (err) res.send(err);
					// return a message
					res.json({ message: 'Task created!' });
				});
				
			});
			
		
		})


		//get all the tasks of one challenge
		.get(function(req, res) {
			Tasks.find({"proprietary_challenge_id":req.params.challenge_id}, function(err, tasks) {                     
				if (err) res.send(err);

				//return matching tasks
				res.json(tasks);
			});
		});

// on routes that end in /challenges/:challenge_id/tasks/:task_id
	// ----------------------------------------------------
	apiRouter.route('/challenges/:challenge_id/tasks/:task_id')

		// get the task with that id
		.get(function(req, res) {
			Tasks.findById(req.params.task_id, function(err, user) {
				if (err) res.send(err);

				// return that task
				res.json(user);
			});
		})

		// update the task with this id
		.put(function(req, res) {
			Tasks.findById(req.params.task_id, function(err, task) {

				if (err) res.send(err);
				var task_id = req.params.task_id;
				var challenge_id = req.params.challenge_id;
				var task_status = task.validation;
				var user_id = req.decoded._id;

				// set the new task information if it exists in the request
				if (req.body.description) task.description = req.body.description;
				if (req.body.friend) task.friend = req.body.friend;

				//Il faut d'abord récupérer une info utile : qui a créé la tache ?

				Tasks.findById(task_id,{"_id":0,"proprietary_user_id":1},function(err,result){
					proprietary_user_id = result.proprietary_user_id;
					//ensuite on regarde si l'emeteur du put est le créateur de la tache : si c'est le cas alors cela veut dire qu'il s'agit d'une self-validation, sinon cela veut dire que la validation est faite par le mentor !
					if(proprietary_user_id==user_id){

						if(!req.body.friend && !req.body.description) {                                //Cette condition est vérifiée quand l'utilisateur clique sur le bouton de validation d'une tache
							//on met a jour le statut de la tâche en fonctioon du contexte. La double validation, en revanche est définitive et ne peut être modifiée c'est pourquoi task_status="double_val" n'est pas proposé ici ici
							if(task_status=="no_val"){
								Tasks.update({ "_id" : task_id },{ $set: {"validation": "val"} }, function(err, results) { if (err) res.send(err);});
								//ensuite on met à jour le nombre de points en cours du challenge
								Challenges.findById(challenge_id, function(err, challenge) {
									if (err) res.send(err);
									//ici on récupère le nombre de points en cours
									var current_points = challenge.points;
									//ici on met a jour ce nombre de points
									var new_points = current_points + 1;
									console.log(current_points);
									console.log(task_status);
									console.log(new_points);
									Challenges.update({ "_id" : challenge_id },{ $set: {"points": new_points} }, function(err, results) { if (err) res.send(err);});	
								});

							}

								 

							if(task_status=="val"){
								Tasks.update({ "_id" : task_id },{ $set: {"validation": "no_val"} }, function(err, results) {if (err) res.send(err);});
								Challenges.findById(challenge_id, function(err, challenge) {
									if (err) res.send(err);
									//ici on récupère le nombre de points en cours
									var current_points = challenge.points;
									//ici on met a jour ce nombre de points
									var new_points = current_points - 1;
									console.log(current_points);
									console.log(task_status);
									console.log(new_points);
									Challenges.update({ "_id" : challenge_id },{ $set: {"points": new_points} }, function(err, results) { if (err) res.send(err);});	
								});
							}
						}
					}
					if(proprietary_user_id!=user_id){
						if(!req.body.friend && !req.body.description) {                                //Cette condition est vérifiée quand l'utilisateur clique sur le bouton de validation d'une tache
							//on met a jour le statut de la tâche en fonctioon du contexte. La double validation, en revanche est définitive et ne peut être modifiée c'est pourquoi task_status="double_val" n'est pas proposé ici ici
							if(task_status=="no_val"){
								Tasks.update({ "_id" : task_id },{ $set: {"validation": "double_val"} }, function(err, results) { if (err) res.send(err);});
								//ensuite on met à jour le nombre de points en cours du challenge
								Challenges.findById(challenge_id, function(err, challenge) {
									if (err) res.send(err);
									//ici on récupère le nombre de points en cours
									var current_points = challenge.points;
									//ici on met a jour ce nombre de points
									var new_points = current_points + 3;
									console.log(current_points);
									console.log(task_status);
									console.log(new_points);
									Challenges.update({ "_id" : challenge_id },{ $set: {"points": new_points} }, function(err, results) { if (err) res.send(err);});	
								});

							};
							if(task_status=="val"){
								Tasks.update({ "_id" : task_id },{ $set: {"validation": "double_val"} }, function(err, results) { if (err) res.send(err);});
								//ensuite on met à jour le nombre de points en cours du challenge
								Challenges.findById(challenge_id, function(err, challenge) {
									if (err) res.send(err);
									//ici on récupère le nombre de points en cours
									var current_points = challenge.points;
									//ici on met a jour ce nombre de points
									var new_points = current_points + 2;
									console.log(current_points);
									console.log(task_status);
									console.log(new_points);
									Challenges.update({ "_id" : challenge_id },{ $set: {"points": new_points} }, function(err, results) { if (err) res.send(err);});	
								});

							};
						};
					};
				});

				

				// save the task
				task.save(function(err) {
					if (err) res.send(err);

					// return a message
					res.json({ message: 'Task updated!' });
				});

			});
		})

		// delete the task with this id
		.delete(function(req, res) {
			Tasks.remove({
				_id: req.params.task_id
			}, function(err, task) {
				if (err) res.send(err);

				res.json({ message: 'Successfully deleted' });
			});
		});

	// on routes that end in /users/:user_id
	// ----------------------------------------------------
	apiRouter.route('/users/:user_id')

		// get the user with that id
		.get(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {
				if (err) res.send(err);

				// return that user
				res.json(user);
			});
		})

		// update the user with this id
		.put(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {

				if (err) res.send(err);

				// set the new user information if it exists in the request
				if (req.body.name) user.name = req.body.name;
				if (req.body.username) user.username = req.body.username;
				if (req.body.password) user.password = req.body.password;

				// save the user
				user.save(function(err) {
					if (err) res.send(err);

					// return a message
					res.json({ message: 'User updated!' });
				});

			});
		})

		// delete the user with this id
		.delete(function(req, res) {
			User.remove({
				_id: req.params.user_id
			}, function(err, user) {
				if (err) res.send(err);

				res.json({ message: 'Successfully deleted' });
			});
		});



			


	// api endpoint to get user information
	apiRouter.get('/me', function(req, res) {
		data = req.decoded;
		user_id = data._id;
		
		User.find({"_id":user_id},{"_id":0,"credit":1,"friend":1}, function(err, result){  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        	var cash = result[0].credit;
        	var ami = result[0].friend;
			data["credit"] = cash;
			data["friend"] = ami;
			res.send(data);
		});
	});


	////////////////////////////////MENTORING : RECUPERER ET VALIDER LES TACHES DES AUTRES//////////////////////////////////////


	apiRouter.route('/mentorings')

		// get the user with that id
		.get(function(req, res) {
			var user_id = req.decoded._id;
			Tasks.find({"friend":user_id,$or:[{"validation":"val"},{"validation":"no_val"}]},function(err,tasks){
				if(err) res.send(err);
				res.json(tasks);
			});

				
		});	
				

	var get_participant = function(task,doneCallback){

		var challenge_id = task.proprietary_challenge_id;

		Challenges.findById(challenge_id,{"_id":0,"proprietary_user_id":1},function(err,cursor){
			
			cursor.toArray(doneCallback);
			//on récupère les infos du user (typiquement son nom plutot que son "id" !)
			

		});	
		return doneCallback(null);

	}
			
		

	return apiRouter;
};