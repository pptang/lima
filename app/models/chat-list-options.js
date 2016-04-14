module.exports = function(schema, options) {
	schema.pre('save', function(next) {
		switch(this.scenario) {
			case 'createChatList':
				this.decision_status = 0;

				break;
			case 'approveChatList':
				this.decision_status = 1;

				break;
		}

	    next();
	});
};
