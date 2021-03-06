var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

// task schema 
var TaskSchema   = new Schema({
	description: {type: String, required: true},
	friend: { type: String, required: false},
	proprietary_challenge_id: {type: String, required: true},
	proprietary_user_id:{type: String, required: true},
	proprietary_user_username:{type: String, required: true},
	validation: {type: String, required: true}
	
	
});

module.exports = mongoose.model('Tasks', TaskSchema);