var middleware = require('../../config/middleware');

module.exports = function(express, configPassport) {
    var router = express.Router();

    router.post('/validate-local-email', middleware.validateLocalEmail, function(request, response) {
        response.json({status: true});
    });

    router.post('/validate-password', middleware.validatePassword, function(request, response) {
        response.json({status: true});
    });

    router.get('/user', function(request, response) {
        if (request.isAuthenticated()) response.json({status: true, user: {id: request.user._id, name: request.user.name, gender: request.user.gender, hobbies: request.user.hobbies, picture: request.user.picture, companions: request.user.companions, localEmail: request.user.local.email, facebook: request.user.facebook}});
        else response.json({status: false, user: null});
    });

    router.post('/logout', function(request, response) {
        request.logout();
        response.json({status: true, message: 'Logout Successfully'});
    });

    router.post('/check-user-by-forget-password-token', middleware.checkUserByForgetPasswordToken, function(request, response) {
        response.json({status: true, forget_password_token_expire_date: request.forget_password_token_expire_date});
    });

    router.get('/login-facebook', configPassport.loginFacebook);

    router.get('/login-facebook-callback', configPassport.loginFacebookCallback);

    router.post('/local-login', middleware.localLogin, configPassport.localLogin, function(request, response) {
        response.json({status: true, message: 'Submit Local Login Successfully', user: {id: request.user._id, name: request.user.name, gender: request.user.gender, hobbies: request.user.hobbies, picture: request.user.picture, companions: request.user.companions, localEmail: request.user.local.email, facebook: request.user.facebook}});
    });

    router.post('/local-signup', middleware.localSignup, configPassport.localSignup, function(request, response) {
        response.json({status: true, message: 'Submit Local Signup Successfully', user: {id: request.user._id, name: request.user.name, gender: request.user.gender, hobbies: request.user.hobbies, picture: request.user.picture, companions: request.user.companions, localEmail: request.user.local.email, facebook: request.user.facebook}});
    });

    router.post('/forget-password', middleware.forgetPassword, function(request, response) {
        response.json({status: true, message: 'Submit Forget Password Successfully'});
    });

    router.post('/forget-password-token', middleware.forgetPasswordToken, function(request, response) {
        response.json({status: true, message: 'Submit Forget Password Token Successfully'});
    });

    router.post('/profile', middleware.authentication, middleware.profile, function(request, response) {
        response.json({status: true, message: 'Submit Profile Successfully', user: {id: request.user._id, name: request.user.name, gender: request.user.gender, hobbies: request.user.hobbies, picture: request.user.picture, companions: request.user.companions, localEmail: request.user.local.email, facebook: request.user.facebook}});
    });

    router.get('/connect-facebook', middleware.socialAuthentication, configPassport.connectFacebook);

    router.get('/connect-facebook-callback', middleware.socialAuthentication, configPassport.connectFacebookCallback);

    router.get('/disconnect-facebook', middleware.authentication, middleware.disconnectFacebook, function(request, response) {
        response.json({status: true, message: 'Disconnect Facebook Successfully', user: {id: request.user._id, name: request.user.name, gender: request.user.gender, hobbies: request.user.hobbies, picture: request.user.picture, companions: request.user.companions, localEmail: request.user.local.email, facebook: request.user.facebook}});
    });

    router.post('/reset-password', middleware.authentication, middleware.resetPassword, function(request, response) {
        response.json({status: true, message: 'Reset Password Successfully'});
    });

    router.get('/dashboard-users', middleware.authentication, middleware.dashboardUsers, function(request, response) {
        response.json({status: true, users: request.users});
    });

    router.get('/get-all-hobbies', middleware.authentication, middleware.getAllHobbies, function(request, response) {
        response.json({status: true, hobbies: request.hobbies});
    });

	return router;
};
