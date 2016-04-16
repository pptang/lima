var ReservationModel = require('../models/reservationModel');
module.exports = function(express) {
	  var router = express.Router();
  	router.get('/getVersion', function(req, res) {
  		res.json({
  			status: true,
  			result: {
  				"version": "0.0.1"
  			}
  		});
  	});

    router.post('/createReservation', ReservationModel.createReservation, function(req, res) {
      res.json({
        status: true,
        result: {

        }
      })
    })
  	return router;
};