var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

// task schema 
var TaskSchema   = new Schema({
	description: {type: String, required: true},
	friend: { type: String, required: false},
	proprietary_challenge_id: {type: String, required: true},
	validation: {type: Boolean},
	validation_friend: {type:Boolean}
	
});

module.exports = mongoose.model('Tasks', TaskSchema);