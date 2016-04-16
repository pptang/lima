var mongoose = require('mongoose');
var timeBehavior = require('../plugins/time-behavior');

var reservationSchema = mongoose.Schema({
	customerName: String,
	email: String,
	tel: String,
	date: Date,	
	numOfGuests: Number
});

reservationSchema.plugin(timeBehavior);

module.exports = mongoose.model('Reservation', reservationSchema);