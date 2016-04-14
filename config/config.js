var port = 5555;

module.exports = {
	'port': port,
	'dburl': 'mongodb://localhost/a',
	'error': {'status': false, 'message': {'error': 'System is in problem'}},
	'emailValidator': /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i,
    'smtp': {
        'mailFrom': '',
        'user': '',
        'pass': ''
    },
    'facebook': {
        'clientID': '',
        'clientSecret': '',
        'loginCallbackURL': '/api/login-facebook-callback',
        'connectCallbackURL': '/api/connect-facebook-callback'
    }
};
