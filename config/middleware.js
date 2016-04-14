var async = require('async'),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    User = require('../app/models/user'),
    ChatList = require('../app/models/chat-list'),
    ChatRoom = require('../app/models/chat-room'),
    Config = require('./config'),
    ConfigError = Config.error,
    ValidationErrorsResponse = require('./error');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: Config.smtp.user,
        pass: Config.smtp.pass
    }
});

module.exports = {
    validateLocalEmail: function(request, response, next) {
        User.findOne({'local.email': request.body.email}, function(error, user) {
            if (error) return response.json({status: false});

            if (request.body.unique === true && user) return response.json({status: false});

            if (request.body.unique === false && !user) return response.json({status: false});

            return next();
        });
    },
    validatePassword: function(request, response, next) {
        User.findOne({'_id': request.body.id}, function(error, user) {
            if (error || !user || !user.validPassword(request.body.password)) return response.json({status: false});

            return next();
        });
    },
    checkUserByForgetPasswordToken: function(request, response, next) {
        User.findOne({forget_password_token: request.body.forgetPasswordToken, forget_password_token_expire_date: {'$gt': Date.now()}}, function(error, user) {
            if (error) return response.status(401).json(ConfigError);

            if (!user) return response.status(404).json({'status': false, 'message': {'error': 'Forget password token is invalid or expire or you have already done'}});

            request.forget_password_token_expire_date = user.forget_password_token_expire_date;

            return next();
        });
    },
    localLogin: function(request, response, next) {
        var body = request.body;

        request.sanitizeBody('email').toString();
        request.sanitizeBody('password').toString();

        request.checkBody('email', 'This field is required').notEmpty();
        request.checkBody('email', body.email + ' is not a valid email').validateEmail();
        request.checkBody('password', 'This field is required').notEmpty();

        request.asyncValidationErrors()
            .then(function() {
                return next();
            })
            .catch(function(errors) {
                return response.json(ValidationErrorsResponse(errors, {email: null, password: null}));
            });
    },
    localSignup: function(request, response, next) {
        var body = request.body;

        request.sanitizeBody('email').toString();
        request.sanitizeBody('password').toString();

        request.checkBody('email', 'This field is required').notEmpty();
        request.checkBody('email', body.email + ' is not a valid email').validateEmail();
        request.checkBody('email', body.email + ' is already in use').validateLocalEmail(true, request.headers.referer);
        request.checkBody('password', 'This field is required').notEmpty();
        request.checkBody('password', 'This field is too long').maxlength(12);
        request.checkBody('password', 'This field is too short').minlength(6);

        request.asyncValidationErrors()
            .then(function() {
                return next();
            })
            .catch(function(errors) {
                return response.json(ValidationErrorsResponse(errors, {email: null, password: null}));
            });
    },
    forgetPassword: function(request, response, next) {
        var body = request.body;

        request.sanitizeBody('email').toString();

        request.checkBody('email', 'This field is required').notEmpty();
        request.checkBody('email', body.email + ' is not a valid email').validateEmail();
        request.checkBody('email', body.email + ' does not exist').validateLocalEmail(false, request.headers.referer);

        request.asyncValidationErrors()
            .then(function() {
                async.waterfall(
                    [
                        function(done) {
                            crypto.randomBytes(20, function(error, buffer) {
                                if (error) done(ConfigError);
                                else done(null, buffer.toString('hex'));
                            });
                        },
                        function(token, done) {
                            User.findOne({'local.email': body.email}, function(error, user) {
                                if (error) {
                                    done(ConfigError);
                                } else if (!user) {
                                    done(ConfigError);
                                } else {
                                    user.forget_password_token = token;
                                    user.forget_password_token_expire_date = Date.now() + 3600000;
                                    user.save(function(error) {
                                        if (error) done(ConfigError);
                                        else done(null, token, user);
                                    });
                                }
                            });
                        },
                        function(token, user, done) {
                            var mailOptions = {
                                from: Config.smtp.mailFrom,
                                to: user.local.email,
                                subject: 'Forget Password Information',
                                text: 'Please click below link or paste below link into your browser.\n\n' + 'You can just ignore this email if you want to keep your original password.\n\n' + request.headers.referer + '#/forget-password-token/' + token + '\n\n'
                            };

                            transporter.sendMail(mailOptions, function(error) {
                                if (error) done(ConfigError);
                                else done(null);
                            });
                        }
                    ],
                    function(error) {
                        if (error) return response.json(error);

                        return next();
                    }
                );
            })
            .catch(function(errors) {
                return response.json(ValidationErrorsResponse(errors, {email: null}));
            });
    },
    forgetPasswordToken: function(request, response, next) {
        var body = request.body;

        User.findOne({forget_password_token: body.forgetPasswordToken, forget_password_token_expire_date: {'$gt': Date.now()}}, function(error, user) {
            if (error) return response.status(401).json(ConfigError);

            if (!user) return response.status(404).json({'status': false, 'message': {'error': 'Forget password token is invalid or expire or you have already done'}});

            request.sanitizeBody('password').toString();
            request.sanitizeBody('passwordConfirmation').toString();

            request.checkBody('password', 'This field is required').notEmpty();
            request.checkBody('password', 'This field is too long').maxlength(12);
            request.checkBody('password', 'This field is too short').minlength(6);
            request.checkBody('passwordConfirmation', 'This field is required').notEmpty();
            request.checkBody('passwordConfirmation', 'This field is too long').maxlength(12);
            request.checkBody('passwordConfirmation', 'This field is too short').minlength(6);
            request.checkBody('passwordConfirmation', 'This field is not equal to password').equals(body.password);

            request.asyncValidationErrors()
                .then(function() {
                    user.local.password = user.generateHash(body.password);
                    user.forget_password_token = undefined;
                    user.forget_password_token_expire_date = undefined;
                    user.save(function(error) {
                        if (error) return response.json(ConfigError);

                        return next();
                    });
                })
                .catch(function(errors) {
                    return response.json(ValidationErrorsResponse(errors, {password: null, passwordConfirmation: null}));
                });
        });
    },
    authentication: function(request, response, next) {
        if (request.isAuthenticated()) return next();
        else return response.status(401).json({status: false, message: {error: 'Authentication is in problem'}, user: null});
    },
    socialAuthentication: function(request, response, next) {
        if (request.isAuthenticated()) return next();
        else return response.redirect('/#/error?url=layout.home&message=Authentication%20is%20in%20problem');
    },
    profile: function(request, response, next) {
        var body = request.body;

        request.sanitizeBody('name').toString();

        request.checkBody('name', 'This field is required').notEmpty();
        request.checkBody('gender', 'This field is not a valid format').validateGender();
        request.checkBody('hobbies', 'This field is not a valid format').validateHobbies();
        request.checkBody('picture', 'This field is not a valid format').validatePicture();

        request.asyncValidationErrors()
            .then(function() {
                User.findOne({'_id': request.user._id}, function(error, user) {
                    if (error) return response.json(ConfigError);

                    if (!user) return response.json(ConfigError);

                    user.name = body.name;
                    user.gender = body.gender || user.gender;
                    user.hobbies = body.hobbies;
                    user.picture = body.picture || user.picture;
                    user.save(function(error) {
                        if (error) return response.json(ConfigError);

                        request.user.name = user.name;
                        request.user.gender = user.gender;
                        request.user.hobbies = user.hobbies;
                        request.user.picture = user.picture;

                        return next();
                    });
                });
            })
            .catch(function(errors) {
                return response.json(ValidationErrorsResponse(errors, {name: null, gender: null, hobbies: null, picture: null}));
            });
    },
    disconnectFacebook: function(request, response, next) {
        User.findOne({'_id': request.user._id}, function(error, user) {
            if (error) return response.json(ConfigError);

            if (!user) return response.json(ConfigError);

            user.scenario = 'disconnectFacebook';
            user.save(function(error) {
                if (error) return response.json(ConfigError);

                request.user.facebook = user.facebook;

                return next();
            });
        });
    },
    resetPassword: function(request, response, next) {
       var body = request.body;

        request.sanitizeBody('password').toString();
        request.sanitizeBody('newPassword').toString();
        request.sanitizeBody('newPasswordConfirmation').toString();

        request.checkBody('password', 'This field is required').notEmpty();
        request.checkBody('password', 'This field is too long').maxlength(12);
        request.checkBody('password', 'This field is too short').minlength(6);
        request.checkBody('password', 'This field is not your password').validatePassword(request.user._id, request.headers.referer);
        request.checkBody('newPassword', 'This field is required').notEmpty();
        request.checkBody('newPassword', 'This field is too long').maxlength(12);
        request.checkBody('newPassword', 'This field is too short').minlength(6);
        request.checkBody('newPasswordConfirmation', 'This field is required').notEmpty();
        request.checkBody('newPasswordConfirmation', 'This field is too long').maxlength(12);
        request.checkBody('newPasswordConfirmation', 'This field is too short').minlength(6);
        request.checkBody('newPasswordConfirmation', 'This field is not equal to new password').equals(body.newPassword);

        request.asyncValidationErrors()
            .then(function() {
                User.findOne({'_id': request.user._id}, function(error, user) {
                    if (error) return response.json(ConfigError);

                    if (!user) return response.json(ConfigError);

                    user.local.password = user.generateHash(body.newPassword);
                    user.save(function(error) {
                        if (error) return response.json(ConfigError);

                        request.user.local.password = user.local.password;

                        return next();
                    });
                });
            })
            .catch(function(errors) {
                return response.json(ValidationErrorsResponse(errors, {password: null, newPassword: null, newPasswordConfirmation: null}));
            });
    },
    dashboardUsers: function(request, response, next) {
        User.find({'_id': {'$ne': request.user._id}}, {'local.password': false, updated_at: false, __v: false}, function(error, users) {
            if (error) return response.json(ConfigError);

            request.users = users;

            return next();
        });
    },
    getAllHobbies: function(request, response, next) {
        User.aggregate(
            [
                {
                    '$match': {
                        '_id': {'$ne': request.user._id}
                    }
                },
                {
                    '$project': {
                        'hobbies': 1
                    }
                },
                {
                    '$unwind': '$hobbies'
                },
                {
                    '$group': {
                        '_id': null,
                        'hobbies': {'$addToSet': '$hobbies.hobby'}
                    }
                }
            ],
            function(error, result) {
                if (error) return response.json(ConfigError);

                if (result.length === 1) request.hobbies = result[0].hobbies;
                else request.hobbies = result;

                return next();
            }
        );
    },
    getAllChatList: function(request, response, next) {
        ChatList.find({}, {__v: false}, function(error, chatList) {
            if (error) return response.json(ConfigError);

            request.chatList = chatList;

            return next();
        });
    },
    createChatList: function(request, response, next) {
        var body = request.body;

        request.checkBody('companion', 'This field is required').notEmpty();
        request.checkBody('companion', 'This field is not a valid format').validateMongoID();
        request.checkBody('companion', 'This field is not a valid companion').validateCompanion(User);
        request.checkBody('companion', 'This field is equal to initiator').notequals(request.user._id.toString());

        request.asyncValidationErrors()
            .then(function() {
                ChatList.findOne({'$or': [{'initiator': request.user._id, 'companion': body.companion}, {'initiator': body.companion, 'companion': request.user._id}]}, function(error, chatList) {
                    if (error) return response.json(ConfigError);

                    if (chatList) return response.json(ConfigError);

                    var chatListModel = new ChatList();

                    chatListModel.scenario = 'createChatList';
                    chatListModel.initiator = request.user._id;
                    chatListModel.companion = body.companion;
                    chatListModel.save(function(error) {
                        if (error) return response.json(ConfigError);

                        User.findOne({'_id': request.user._id}, function(error, user) {
                            if (error) return response.json(ConfigError);

                            user.companions.push(body.companion);
                            user.save(function(error) {
                                if (error) return response.json(ConfigError);

                                request.user.companions = user.companions;

                                return next();
                            });
                        });
                    });
                });
            })
            .catch(function(errors) {
                return response.json(ValidationErrorsResponse(errors, {companion: null}));
            });
    },
    getChatList: function(request, response, next) {
        ChatList.find({'$or': [{initiator: request.user._id}, {companion: request.user._id}]})
            .select({updated_at: false, __v: false})
            .populate({path: 'initiator', select: {'local.password': false, updated_at: false, __v: false}})
            .populate({path: 'companion', select: {'local.password': false, updated_at: false, __v: false}})
            .exec(function(error, chatList) {
                if (error) return response.json(ConfigError);

                request.chatList = chatList;

                return next();
            });
    },
    approveChatList: function(request, response, next) {
        var body = request.body;

        request.checkBody('id', 'This field is required').notEmpty();
        request.checkBody('id', 'This field is not a valid format').validateMongoID();

        request.asyncValidationErrors()
            .then(function() {
                ChatList.findOne({'_id': body.id}, function(error, chatList) {
                    if (error) return response.json(ConfigError);

                    if (!chatList) return response.json(ConfigError);

                    if (chatList.initiator.toString() !== request.user._id.toString() && chatList.companion.toString() !== request.user._id.toString()) return response.json(ConfigError);

                    chatList.scenario = 'approveChatList';
                    chatList.save(function(error) {
                        if (error) return response.json(ConfigError);

                        return next();
                    });
                });
            })
            .catch(function(errors) {
                return response.json(ValidationErrorsResponse(errors, {id: null}));
            });
    },
    getChatListByID: function(request, response, next) {
        var body = request.body;

        request.checkBody('id', 'This field is required').notEmpty();
        request.checkBody('id', 'This field is not a valid format').validateMongoID();

        request.asyncValidationErrors()
            .then(function() {
                ChatList.findOne({'$or': [{'_id': body.id, 'initiator': request.user._id, 'decision_status': 1}, {'_id': body.id, 'companion': request.user._id, 'decision_status': 1}]})
                    .select({updated_at: false, __v: false})
                    .populate({path: 'initiator', select: {'local.password': false, updated_at: false, __v: false}})
                    .populate({path: 'companion', select: {'local.password': false, updated_at: false, __v: false}})
                    .exec(function(error, chatList) {
                        if (error) return response.json(ConfigError);

                        if (!chatList) return response.json(ConfigError);

                        request.chatList = chatList;

                        return next();
                    });
            })
            .catch(function(errors) {
                return response.json(ValidationErrorsResponse(errors, {id: null}));
            });
    },
    getChatRoomByChatListID: function(request, response, next) {
        var body = request.body;

        request.checkBody('id', 'This field is required').notEmpty();
        request.checkBody('id', 'This field is not a valid format').validateMongoID();

        request.asyncValidationErrors()
            .then(function() {
                ChatRoom.find({'chat_list_id': body.id}, {updated_at: false, __v: false}, {sort: {created_at: 1}}, function(error, chatRoom) {
                    if (error) return response.json(ConfigError);

                    request.chatRoom = chatRoom;

                    return next();
                });
            })
            .catch(function(errors) {
                return response.json(ValidationErrorsResponse(errors, {id: null}));
            });
    },
    chatRoom: function(request, response, next) {
        var body = request.body;

        request.sanitizeBody('message').toString();

        request.checkBody('chat_list_id', 'This field is required').notEmpty();
        request.checkBody('chat_list_id', 'This field is not a valid format').validateMongoID();
        request.checkBody('initiator', 'This field is required').notEmpty();
        request.checkBody('initiator', 'This field is not a valid format').validateMongoID();
        request.checkBody('companion', 'This field is required').notEmpty();
        request.checkBody('companion', 'This field is not a valid format').validateMongoID();
        request.checkBody('message', 'This field is required').notEmpty();

        request.asyncValidationErrors()
            .then(function() {
                if (body.initiator !== request.user._id.toString() && body.companion !== request.user._id.toString()) return response.json(ConfigError);

                var chatRoom = new ChatRoom();

                chatRoom.chat_list_id = body.chat_list_id;
                chatRoom.creator = request.user._id;
                chatRoom.message = body.message;
                chatRoom.save(function(error) {
                    if (error) return response.json(ConfigError);

                    request.chatRoom = chatRoom;

                    return next();
                });
            })
            .catch(function(errors) {
                return response.json(ValidationErrorsResponse(errors, {chat_list_id: null, initiator: null, companion: null, message: null}));
            });
    }
};
