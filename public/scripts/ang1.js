var app1 = angular.module('app1', []);
app1.controller('ctrl1', function($scope) {
	$scope.searchTerm = "";
	$scope.searchResults = [];
	$scope.search = function() {
		$scope.searchResultsHeading = "Tweets containing "+$scope.searchTerm;
		$scope.searchResults = [
			{ user:"John Smith", text:"Some random tweet containing "+$scope.searchTerm+"." },
			{ user:"John Doe", text:"Some other random tweet with "+$scope.searchTerm+"." },
			{ user:"Jane Doe", text:"Another interesting "+$scope.searchTerm+" tweet." },
			{ user:"Jane Tarzan", text:"Yet another "+$scope.searchTerm+" tweet." } ];
	};
	$scope.clear = function() {
		$scope.searchTerm = "";
		$scope.searchResultsHeading = "";
		$scope.searchResults = [];
	};
	$scope.twearch = function() {
		$scope.searchResultsHeading = "Loading Tweets containing "+$scope.searchTerm+"...";
		var queryParams = "?term=" + $scope.searchTerm;
		xhrGet('api/twearch'+queryParams, function(data) {
			$scope.searchResultsHeading = "Tweets containing "+$scope.searchTerm;
			var receivedItems = data || [];
			var items = [];
			for (var i = 0; i < receivedItems.length; ++i) {
				var item = receivedItems[i];
				if (item && 'username' in item) {
					items.push(item);
				}
			}
			$scope.searchResults = items;
		}, function(err) {
			console.error(err);
			$scope.searchResultsHeading = "Error loading Tweets containing "+$scope.searchTerm;
		});
	};
});
function xxhrGet(url, callback, errback) {
	var term = url.substr(url.indexOf("=")+1);
	var results = [
		{ bogus:"John A. Smith", text:"Some random tweet containing "+term+"." },
		{ username:"John A. Smith", text:"Some random tweet containing "+term+"." },
		{ username:"John B. Doe", text:"Some other random tweet with "+term+"." },
		{ username:"Jane C. Doe", text:"Another interesting "+term+" tweet." },
		{ username:"Jane D. Tarzan", text:"Yet another "+term+" tweet." } ];
	if (results) {
		callback(results);
	} else {
		errback('service not available');
	}
}