var Reservation = require('../schemas/reservationSchema');
var Config = require('../../config/config');
var ConfigError = Config.error;
var ValidationErrorsResponse = require('../../config/error');
var ReservationModel = function() {};

ReservationModel.prototype.createReservation = function(req, res, next) {
	var body = req.body;
	
	req.checkBody('customerName', 'Customer name is required.').notEmpty();
	req.checkBody('email', 'Email is required.').notEmpty();
	req.checkBody('tel', 'Telephone is required.').notEmpty();
	req.checkBody('date', 'Date is required.').notEmpty();
	req.checkBody('numOfGuests', 'Number of guests is required.').notEmpty();

	req.sanitizeBody('customerName').trim();
	req.sanitizeBody('email').trim();
	req.sanitizeBody('tel').trim();

	req.asyncValidationErrors()
		.then(function() {

			var reservation = new Reservation();
			reservation.customerName = body.customerName;
			reservation.email = body.email;
			reservation.tel = body.tel;
			reservation.date = body.date;
			reservation.numOfGuests = body.numOfGuests;
			
			reservation.save(function(err) {
				if (err) return res.json(ConfigError);
				return next();
			});
		})
		.catch(function(err) {
			return res.json(ValidationErrorsResponse(err, {
				customerName: null,
				email: null,
				tel: null,
				date: null,
				numOfGuests: null
			}));
		});

}

module.exports = new ReservationModel();