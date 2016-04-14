module.exports = function(schema, options) {
	schema.pre('save', function(next) {
		switch(this.scenario) {
			case 'localSignup':
				this.name = this.local.email;
				this.gender = null;
				this.hobbies = [];
				this.picture = null;
				this.companions = [];
				this.facebook = null;

				break;
			case 'disconnectFacebook':
				this.facebook = null;

				break;
		}

	    next();
	});
};
