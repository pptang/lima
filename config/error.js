module.exports = function(errors, messagePrototype) {
	for (var index = 0; index < errors.length; index++) {
		if (messagePrototype[errors[index].param] && Object.prototype.toString.call(messagePrototype[errors[index].param]) === '[object String]') messagePrototype[errors[index].param] = [messagePrototype[errors[index].param], errors[index].msg];
		else if (messagePrototype[errors[index].param] && Object.prototype.toString.call(messagePrototype[errors[index].param]) === '[object Array]') messagePrototype[errors[index].param].push(errors[index].msg);
		else messagePrototype[errors[index].param] = errors[index].msg;
	}

    for (index in messagePrototype) {
        if (!messagePrototype[index]) delete messagePrototype[index];
    }

    return {status: false, message: messagePrototype};
};
