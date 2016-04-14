var LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    UserModel = require('../app/models/user'),
    Config = require('./config');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        return done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        UserModel.findById(id, function(error, user) {
            return done(error, user);
        });
    });

    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(request, email, password, done) {
        process.nextTick(function() {
            UserModel.findOne({'local.email': email}, function(error, user) {
                if (error) return done(Config.error);

                if (!user) return done({status: false, message: {email: 'Incorrect email'}});

                if (!user.validPassword(password)) return done({status: false, message: {password: 'Incorrect password'}});

                return done(null, user);
            });
        });
    }));

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(request, email, password, done) {
        process.nextTick(function() {
            var user = new UserModel();

            user.scenario = 'localSignup';
            user.local.email = email;
            user.local.password = user.generateHash(password);
            user.save(function(error) {
                if (error) return done(Config.error);

                return done(null, user);
            });
        });
    }));

    passport.use('login-facebook', new FacebookStrategy({
        clientID: Config.facebook.clientID,
        clientSecret: Config.facebook.clientSecret,
        callbackURL: Config.facebook.loginCallbackURL,
        profileFields: ['id'],
        passReqToCallback: true
    },
    function(request, token, refreshToken, profile, done) {
        process.nextTick(function() {
            UserModel.findOne({'facebook.id': profile.id}, function(error, user) {
                if (error) return done(Config.error.message.error);

                if (!user) return done('User%20does%20not%20exist');

                request.login(user, function(error) {
                    if (error) return done(Config.error.message.error);

                    return done(null, user);
                });
            });
        });
    }));

    passport.use('connect-facebook', new FacebookStrategy({
        clientID: Config.facebook.clientID,
        clientSecret: Config.facebook.clientSecret,
        callbackURL: Config.facebook.connectCallbackURL,
        profileFields: ['id'],
        passReqToCallback: true
    },
    function(request, token, refreshToken, profile, done) {
        process.nextTick(function() {
            UserModel.findOne({'_id': request.user._id}, function(error, user) {
                if (error) return done(Config.error.message.error);

                if (!user) return done('User%20does%20not%20exist');

                user.facebook = {id: profile.id, token: token};
                user.save(function(error) {
                    if (error) return done(Config.error.message.error);

                    return done(null, user);
                });
            });
        });
    }));

    return {
        localLogin: function(request, response, next) {
            passport.authenticate('local-login', function(error, user) {
                if (error) return response.json(error);

                request.login(user, function(error) {
                    if (error) return response.json(Config.error);

                    return next();
                });
            })(request, response, next);
        },
        localSignup: function(request, response, next) {
            passport.authenticate('local-signup', function(error, user) {
                if (error) return response.json(error);

                request.login(user, function(error) {
                    if (error) return response.json(Config.error);

                    return next();
                });
            })(request, response, next);
        },
        loginFacebook: passport.authenticate('login-facebook', {scope: 'email'}),
        loginFacebookCallback: function(request, response, next) {
            passport.authenticate('login-facebook', function(error, user) {
                if (error) return response.redirect('/#/error?url=layout.home&message=' + error);

                if (!user) return response.redirect('/#/error?url=layout.home&message=Authentication%20is%20in%20problem');

                return response.redirect('/#/success?url=layout.home&message=Login%20Facebook%20Successfully');
            })(request, response, next);
        },
        connectFacebook: passport.authenticate('connect-facebook', {scope: 'email'}),
        connectFacebookCallback: function(request, response, next) {
            passport.authenticate('connect-facebook', function(error, user) {
                if (error) return response.redirect('/#/error?url=layout.profile&message=' + error);

                if (!user) return response.redirect('/#/error?url=layout.profile&message=Authentication%20is%20in%20problem');

                return response.redirect('/#/success?url=layout.profile&message=Connect%20Facebook%20Successfully');
            })(request, response, next);
        }
    };
};
