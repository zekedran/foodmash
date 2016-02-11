'use strict';

angular.module('foodmashApp.controllers')

.controller('BodyController', ['$scope', '$location', 'toaster', 'CartService', function($scope, $location, toaster, CartService){

		$scope.logo_transparent = 'https://s3-ap-southeast-1.amazonaws.com/foodmash/assets/logo_transparent.png';

		CartService.setCartGlobally();

		$scope.routeToCart = function(){
			$location.path("/cart");
		};

	 	$scope.routeToRoot = function(){
	 	 	$location.path("/");
	 	};


}]);

