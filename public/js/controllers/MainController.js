angular.module('MainController', [])
		.controller('mainCtrl', function($scope, $http) {

			$http.get('/getVersion').then(function(response) {
				$scope.limaTitle = response.data.result.version;
			});
			$scope.limaTitle = "你好";
		})
		.controller('reservCtrl', function($scope, $http) {
			$scope.reservationResult = '';
			$scope.createReservation = function() {
				console.log("test");
				$http.post('/createReservation', $scope.reservation)
					.then(function(response) {
						alert("訂位成功");
					})
					.catch(function(err) {
						alert("訂位失敗:" + err);
					});
			}
			
		});

