var mongoose = require('mongoose'),
    timeBehavior = require('../plugins/time-behavior');

var chatRoomSchema = mongoose.Schema({
    chat_list_id: {type: mongoose.Schema.Types.ObjectId, ref: 'ChatList'},
    creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    message: String
}, {collection: 'chat_room'});

chatRoomSchema.plugin(timeBehavior);

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
