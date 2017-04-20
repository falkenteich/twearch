var app1 = angular.module('app1', []);
app1.controller('ctrl1', function($scope) {
	// Define initial values
	$scope.first = 1;
	$scope.second = 1;
	$scope.updateValue = function() {
		$scope.calculation = $scope.first + ' + ' + $scope.second +
			" = " + (+$scope.first + +$scope.second);
	};
	$scope.search = function() {
		$scope.searchResults = [
			{ user:"John Smith", text:"Some random tweet." },
			{ user:"John Doe", text:"Some other random tweet." },
			{ user:"Jane Doe", text:"Another interesting tweet." },
			{ user:"Jane Tarzan", text:"Yet another tweet." } ];		
	};
});