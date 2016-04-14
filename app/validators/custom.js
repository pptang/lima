var request = require('request'),
	mongoose = require('mongoose'),
	validator = require('validator');

module.exports = {
	customValidators: {
		notequals: function(value, target) {
			if (value) return value !== target;

			return true;
		},
		maxlength: function(value, length) {
            if (value) return value.length <= length;

            return true;
		},
		minlength: function(value, length) {
            if (value) return value.length >= length;

            return true;
		},
		validateEmail: function(value) {
		    if (value) return require('../../config/config').emailValidator.test(value);

		    return true;
		},
		validateGender: function(value) {
			if (value) return (value === 'female' || value === 'male');

			return true;
		},
		validateHobbies: function(value) {
			if (Object.prototype.toString.call(value) === '[object Array]') {
				if (value.length > 0) {
					for (var index = 0; index < value.length; index++) {
						if (Object.prototype.toString.call(value[index]) !== '[object Object]' || !value[index].hasOwnProperty('hobby') || Object.keys(value[index]).length !== 1 || Object.prototype.toString.call(value[index].hobby) !== '[object String]' || value[index].hobby.length === 0) return false;
					}
				}
 
				return true;
			}

			return false;
		},
		validatePicture: function(value) {
			if (value) {
				var pictureParser = value.split(',');

				if (pictureParser.length === 2 && (pictureParser[0] === 'data:image/jpeg;base64' || pictureParser[0] === 'data:image/png;base64')) return validator.isBase64(pictureParser[1]);

				return false;
			}

			return true;
		},
		validateLocalEmail: function(value, unique, host) {
			if (value) {
	 			return new Promise(function(resolve, reject) {
					var options = {
							url: host + 'api/validate-local-email',
							method: 'POST',
							json: true,
				    		body: {email: value, unique: unique}
						};

					request(options, function(error, response, body) {
					    if (error || !body.status) reject();
					    else resolve();
					});
				});
			}

			return true;
		},
		validatePassword: function(value, id, host) {
			if (value) {
	 			return new Promise(function(resolve, reject) {
					var options = {
							url: host + 'api/validate-password',
							method: 'POST',
							json: true,
				    		body: {id: id, password: value}
						};

					request(options, function(error, response, body) {
					    if (error || !body.status) reject();
					    else resolve();
					});
				});
			}

			return true;
		},
		validateMongoID: function(value) {
			if (value) return mongoose.Types.ObjectId.isValid(value);

			return true;
		},
		validateCompanion: function(value, User) {
			if (value) {
				return new Promise(function(resolve, reject) {
					User.findById(value, function(error, user) {
						if (error || !user) reject();
						else resolve();
					});
				});
			}

			return true;
		}
	}
};
