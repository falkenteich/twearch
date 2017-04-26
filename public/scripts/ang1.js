var app1 = angular.module('app1', []);
app1.controller('ctrl1', function($scope) {
	$scope.winH = window.screen.availHeight;
	$scope.winW = window.screen.availWidth;
	$scope.maxW = Math.max($scope.winH,$scope.winW);
	$scope.bodyW = Math.min($scope.maxW,800);
	$scope.searchTerm = "";
	$scope.searchOld = false;
	$scope.searchResultsHeading = "";
	$scope.searchResults = [];
	$scope.clear = function() {
		$scope.searchTerm = "";
		$scope.searchOld = false;
		$scope.searchResultsHeading = "";
		$scope.searchResults = [];
	};
	$scope.twearch = function() {
		var age = $scope.searchOld ? "Old" : "New";
		var api = $scope.searchOld ? "api/clearch" : "api/twearch";
		$scope.searchResultsHeading = "Searching for "+age+" Tweets containing "+$scope.searchTerm+"...";
		var queryParams = "?term=" + $scope.searchTerm.toLowerCase();
		xhrGet(api+queryParams, function(data) {
			var receivedItems = data || [];
			var items = [];
			for (var i = 0; i < receivedItems.length; ++i) {
				var item = receivedItems[i];
				if (item && 'username' in item) {
					items.push(item);
				}
			}
			$scope.searchResultsHeading = (items.length > 0)
				? age+" Tweets containing "+$scope.searchTerm
				: "There are no "+age+" Tweets containing "+$scope.searchTerm;
			$scope.searchResults = items;
			$scope.$apply();
		}, function(err) {
			console.error(err);
			$scope.searchResultsHeading = "Error loading "+age+" Tweets containing "+$scope.searchTerm;
			$scope.$apply();
		});
	};
	$scope.clearch = function() {
		$scope.searchResultsHeading = "Loading old Tweets containing "+$scope.searchTerm+"...";
		var queryParams = "?term=" + $scope.searchTerm;
		xhrGet('api/clearch'+queryParams, function(data) {
			var receivedItems = data || [];
			var items = [];
			for (var i = 0; i < receivedItems.length; ++i) {
				var item = receivedItems[i];
				if (item && 'username' in item) {
					items.push(item);
				}
			}
			$scope.searchResultsHeading = "Old Tweets containing "+$scope.searchTerm;
			$scope.searchResults = items;
			$scope.$apply();
		}, function(err) {
			console.error(err);
			$scope.searchResultsHeading = "Error loading Tweets containing "+$scope.searchTerm;
			$scope.$apply();
		});
	};
});