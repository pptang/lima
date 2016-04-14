var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    userOptions = require('./user-options'),
    timeBehavior = require('../plugins/time-behavior');

var userSchema = mongoose.Schema({
    name: String,
    gender: String,
    hobbies: Array,
    picture: String,
    companions: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    local: {
        email: String,
        password: String
    },
    facebook: {
        id: String,
        token: String
    },
    forget_password_token: String,
    forget_password_token_expire_date: Date
}, {collection: 'user'});

userSchema.virtual('scenario')
    .get(function() {
        return this.__scenario;
    })
    .set(function(scenario) {
        this.__scenario = scenario;
    });

userSchema.plugin(userOptions);
userSchema.plugin(timeBehavior);

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
