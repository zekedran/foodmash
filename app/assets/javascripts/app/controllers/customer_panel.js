'use strict';

angular.module('foodmashApp.controllers')

.controller('CustomerPanelController', ['$scope','$location','toaster','$rootScope','Cart', function($scope, $location, toaster, $rootScope, Cart){

	$scope.carts = [];
	$scope.selectedCart = {};
	$scope.selectedStatus = {};
	$scope.loadingCarts = true;
	$scope.statuses = [
		{name: "purchased", alias: "Placed Order", icon_class: "fa fa-clock-o", percent: 'width:0%'},
		{name: "ordered", alias: "Being Aggregated", icon_class: "fa fa-dropbox", percent: 'width:35%'},
		{name: "dispatched", alias: "Dispatched for Delivery", icon_class: "fa fa-truck", percent: 'width:65%'},
		{name: "delivered", alias: "Delivered", icon_class: "fa fa-check-circle", percent: 'width:100%'}
	];

	Cart.query({user_id: $rootScope.currentUser.id}).then(function(carts){
		if(carts.length > 0){
			$scope.carts = carts;
		}else{
			$scope.carts = null;
		}
		$scope.loadingCarts = false;
	}, function(err){
		$scope.carts = null;
		$scope.loadingCarts = false;
	});

	$scope.checkIfCompleted = function(status){
		if($scope.statuses.indexOf(status) <= $scope.statuses.indexOf($scope.selectedStatus)){
			return true;
		}
		return false;
	};

	$scope.selectCart = function(cart){
		$scope.selectedCart = cart;
		getSuitableStatus(cart.aasm_state);
	};

	$scope.getStatusIcon = function(status){
		$scope.statuses.filter(function(s){
			if(s.name == status){
				console.log('fa fa-fw ' + s.icon_class.split(" ")[1]);
				return 'fa fa-fw ' + s.icon_class.split(" ")[1];
			}
		});
		return '';
	};

	function getSuitableStatus(status){
		$scope.statuses.filter(function(s){
			if(s.name == status){
				$scope.selectedStatus = s;
			}
		});
	};

}]);