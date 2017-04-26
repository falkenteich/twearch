var app1 = angular.module('app1', []);
app1.controller('ctrl1', function($scope) {
	$scope.winH = window.screen.availHeight;
	$scope.winW = window.screen.availWidth;
	$scope.maxW = Math.max($scope.winH,$scope.winW);
	$scope.bodyW = Math.min($scope.maxW,800);
	$scope.fontXL = '1.5rem';
	$scope.fontL = '1.25rem';
	$scope.fontM = '1rem';
	$scope.fontS = '0.75rem';
	$scope.fontXS = '0.5rem';
	$scope.searchTerm = "";
	$scope.searchResultsHeading = "";
	$scope.searchResults = [];
	$scope.clear = function() {
		$scope.searchTerm = "";
		$scope.searchResultsHeading = "";
		$scope.searchResults = [];
	};
	$scope.twearch = function() {
		$scope.searchResultsHeading = "Searching for Tweets containing "+$scope.searchTerm+"...";
		var queryParams = "?term=" + $scope.searchTerm;
		xhrGet('api/twearch'+queryParams, function(data) {
			var receivedItems = data || [];
			var items = [];
			for (var i = 0; i < receivedItems.length; ++i) {
				var item = receivedItems[i];
				if (item && 'username' in item) {
					items.push(item);
				}
			}
			$scope.searchResultsHeading = "New Tweets containing "+$scope.searchTerm;
			$scope.searchResults = items;
			$scope.$apply();
		}, function(err) {
			console.error(err);
			$scope.searchResultsHeading = "Error loading Tweets containing "+$scope.searchTerm;
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