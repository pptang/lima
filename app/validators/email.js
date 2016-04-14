module.exports = function(errorMessage) {
	if (!errorMessage) errorMessage = '{VALUE} is not a valid email';

    return {
		validator: function(value) {
		    if (value) return require('../../config/config').emailValidator.test(value);

		    return true;
		},

		message: errorMessage
    };
};
