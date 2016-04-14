var middleware = require('../../config/middleware');

module.exports = function(express) {
    var router = express.Router();

    router.get('/get-all-chat-list', middleware.authentication, middleware.getAllChatList, function(request, response) {
        response.json({status: true, chatList: request.chatList});
    });

    router.post('/create-chat-list', middleware.authentication, middleware.createChatList, function(request, response) {
        response.json({status: true, message: 'Create Chat List Successfully', user: {id: request.user._id, name: request.user.name, gender: request.user.gender, hobbies: request.user.hobbies, picture: request.user.picture, companions: request.user.companions, localEmail: request.user.local.email, facebook: request.user.facebook}});
    });

    router.get('/get-chat-list', middleware.authentication, middleware.getChatList, function(request, response) {
        response.json({status: true, chatList: request.chatList});
    });

	router.post('/approve-chat-list', middleware.authentication, middleware.approveChatList, function(request, response) {
        response.json({status: true, message: 'Approve Chat List Successfully'});
    });

    router.post('/get-chat-list-by-id', middleware.authentication, middleware.getChatListByID, function(request, response) {
        response.json({status: true, chatList: request.chatList});
    });

    router.post('/get-chat-room-by-chat-list-id', middleware.authentication, middleware.getChatRoomByChatListID, function(request, response) {
        response.json({status: true, chatRoom: request.chatRoom});
    });

    router.post('/chat-room', middleware.authentication, middleware.chatRoom, function(request, response) {
        response.json({status: true, chatRoom: {_id: request.chatRoom._id, chat_list_id: request.chatRoom.chat_list_id, creator: request.chatRoom.creator, message: request.chatRoom.message, created_at: request.chatRoom.created_at}});
    });

	return router;
};
