var mongoose = require('mongoose'),
    chatListOptions = require('./chat-list-options'),
    timeBehavior = require('../plugins/time-behavior');

var chatListSchema = mongoose.Schema({
    initiator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    companion: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    decision_status: Number
}, {collection: 'chat_list'});

chatListSchema.virtual('scenario')
    .get(function() {
        return this.__scenario;
    })
    .set(function(scenario) {
        this.__scenario = scenario;
    });

chatListSchema.plugin(chatListOptions);
chatListSchema.plugin(timeBehavior);

module.exports = mongoose.model('ChatList', chatListSchema);
