module.exports = function(schema, options) {
	var createdAt = 'created_at',
		updatedAt = 'updated_at',
		createdAtType = Date,
		updatedAtType = Date,
		object = {};

	if (Object.prototype.toString.call(options) === '[object Object]') {
		if (options.createdAt) {
			if (Object.prototype.toString.call(options.createdAt) === '[object String]') {
				createdAt = options.createdAt;
			} else if (Object.prototype.toString.call(options.createdAt) === '[object Object]') {
				createdAt = options.createdAt.name;
				createdAtType = options.createdAt.type;
			}
		}

		if (options.updatedAt) {
			if (Object.prototype.toString.call(options.updatedAt) === '[object String]') {
				updatedAt = options.updatedAt;
			} else if (Object.prototype.toString.call(options.updatedAt) === '[object Object]') {
				updatedAt = options.updatedAt.name;
				createdAtType = options.updatedAt.type;
			}
		}
	}

	object[createdAt] = createdAtType;
	object[updatedAt] = updatedAtType;

	schema.add(object);
	schema.pre('save', function(next) {
		var date = new Date();

		if (this.isNew) this[createdAt] = date;
		this[updatedAt] = date;

		next();
	});
};
