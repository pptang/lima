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
  	return router;
};