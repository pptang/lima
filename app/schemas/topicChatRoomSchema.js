var mongoose = require('mongoose');
var timeBehavior = require('../plugins/time-behavior');

var topicChatRoomSchema = mongoose.Schema({
	title: String,
	description: String,
	creator: String,
	members: [{
		user_id: String,
		inviter: String,
		status: Number
	}],
	access: Number
});

topicChatRoomSchema.plugin(timeBehavior);

module.exports = mongoose.model('TopicChatRoom', topicChatRoomSchema);