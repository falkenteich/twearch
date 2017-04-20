var app1 = angular.module('app1', []);
app1.controller('ctrl1', function($scope) {
	$scope.searchTerm = "Enter your search here.";
	$scope.searchResults = [];
	$scope.search = function() {
		$scope.searchResults = [
			{ user:"John Smith", text:"Some random tweet containing "+$scope.searchTerm+"." },
			{ user:"John Doe", text:"Some other random tweet with "+$scope.searchTerm+"." },
			{ user:"Jane Doe", text:"Another interesting "+$scope.searchTerm+" tweet." },
			{ user:"Jane Tarzan", text:"Yet another "+$scope.searchTerm+" tweet." } ];
	};
	$scope.clear = function() {
		$scope.searchTerm = "";
		$scope.searchResults = [];
	};
});